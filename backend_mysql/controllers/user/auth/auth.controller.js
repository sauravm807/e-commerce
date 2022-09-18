"use strict;"
//pakages imports
const createError = require('http-errors');
const { faker } = require('@faker-js/faker');

// modals imports
const User = require("../../../modal/user/User.modal");
const Uuid = require("../../../modal/uuids/uuids.Modal");

// services imports
const redisService = require("../../../services/redis.service");
const { userValidateSchemaRegister, userValidateSchemaLogin } = require("../../../validation/user.validation");
const { encryptPassword, matchPassword } = require("../../../services/bcrypt.service");
const { createUuid } = require("../../../services/uuid.service");
const {
    createAccessToken,
    createRefreshToken,
} = require("../../../services/jwt.service");

class AuthController {
    /**
     * registerOneUser - to register one user
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns 
     * @author Saurav Vishal <sauravvishal@globussoft.in>
     */
    async registerOneUser(req, res, next) {
        try {
            console.log(req.body);
            const userData = await userValidateSchemaRegister.validateAsync(req.body);
            const ifUserExist = await User.findOne({ where: { email: req.body.email } });
            if (ifUserExist) throw createError.Conflict(`${userData.email} is already present.`);
            const password = await encryptPassword(userData.password);
            userData.password = password;
            delete userData.repeatPassword;
            const user = await User.create(userData);
            // const insertUser = await user.save();
            if (!user) throw createError.BadRequest("User not created.");
            res.status(201).json({
                status: 201,
                message: "New user created."
            });
        } catch (error) {
            if (error.isJoi) {
                return next(createError.MethodNotAllowed(error.details[0].message));
            }
            next(error);
        }
    }

    /**
     * registerMultipleRandomUser - to register multiple random users
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @author Saurav Vishal <sauravvishal@globussoft.in>
     */
    async registerMultipleRandomUser(req, res, next) {
        try {
            const { no } = req.params;
            const users = [];
            for (let i = 0; i < no; i++) {
                const fullName = faker.name.fullName();
                const firstName = fullName.split(" ")[0];
                const lastName = fullName.split(" ")[1];
                const email = faker.internet.email(fullName).toLowerCase();
                const phoneNo = faker.phone.number('+91 #### ### ###');
                const createdAt = faker.date.between('2021-01-01T00:00:00.000Z', '2022-06-06T00:00:00.000Z')
                const address = `${faker.address.buildingNumber()} ${faker.address.cardinalDirection()} ${faker.address.city()} ${faker.address.state()}`;
                const password = await encryptPassword(email);
                users.push({ email, password, fullName, firstName, lastName, phoneNo, address, createdAt });
            }

            const insertedData = await User.bulkCreate(users);

            if (!insertedData.length) throw createError.BadRequest("Users not created.");

            res.status(201).json({
                status: 201,
                message: `${no} New random users created.`
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * userLogin - login user
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @author Saurav Vishal <sauravvishal@globussoft.in>
     */
    async userLogin(req, res, next) {
        try {
            const userData = await userValidateSchemaLogin.validateAsync(req.body);
            const user = await User.findOne({where :{ email: userData.email }});

            if (!user) throw createError.NotFound("Email not found.");

            const isMatch = await matchPassword({ password: userData.password, hash: user.password });
            // const msg = await redisService.getId(user.id);
            // if (msg) {
            //     const ttl = await redisService.getTtl(user.id);
            //     throw createError.BadRequest(`Login has been blocked try after ${ttl} seconds`);
            // }

            if (!isMatch) {
                let count = user.wrongPassCount;
                if (count < 3) {
                    await User.update({wrongPassCount: ++count }, {
                       where: {
                        id: user.id 
                        }
                    });
                    throw createError.Unauthorized(`Password do not match. Wrong attempt count ${count}`);
                } else {
                    // const result = await redisService.setId(user.id);
                    await User.update({ wrongPassCount: 0 }, {
                       where: {
                            id: user.id
                        }
                    });
                    throw createError.BadRequest(`Login has been blocked try after one minute`);
                }
            }
            
            const uuid = createUuid();
            const accessToken = await createAccessToken({ userId: user.id, uuid }); // create access token with payload id and uuid
            const refreshToken = await createRefreshToken(user.id,uuid); // create refresh token with payload uuid
         

            const ifUuidExist = await Uuid.findOne({where :{ userId: user.id }});
            if (!ifUuidExist) {
                const uuidArr = [{
                    id: uuid,
                    token: accessToken,
                    createdAt: new Date().getTime()
                }]
                const uuidCreate = await Uuid.create({
                    userId: user.id,
                    uuid: JSON.stringify(uuidArr)
                });

                // const insertUuid = await uuidCreate.save();

                if (!uuidCreate) throw createError.BadRequest("Something went wrong.");
                return res.status(200).json({
                    status: 200,
                    message: "Login successfull",
                    token: { accessToken, refreshToken }
                });
            }
            const arr = JSON.parse(ifUuidExist.uuid);
            arr.push({ id: uuid, token: accessToken, createdAt: new Date().getTime() });
            const updateUuid = await Uuid.update({  uuid: JSON.stringify(arr) }, {
                where: {
                    id: ifUuidExist.id
                }
            });
            if (updateUuid) return res.status(200).json({
                status: 200,
                message: "Login successfull",
                token: { accessToken, refreshToken }
            });
            throw createError.BadRequest("Something went wrong.");
        } catch (error) {
            if (error.isJoi) {
                return next(createError.MethodNotAllowed(error.details[0].message));
            }
            next(error);
        }
    }

    /**
     * userLogout - to logout tokens sent by user
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @author Saurav Vishal <sauravvishal@globussoft.in>
     */
    async userLogout(req, res, next) {
        try {
            const { id, uuid } = req.user;

            const data = await Uuid.findOne({where :{ userId: id }});

            const index = JSON.parse(data.uuid).findIndex(item => item.id === uuid);

            const arr = JSON.parse(data.uuid).splice(index, 1);

            const updateUuid = await Uuid.update({   uuid: JSON.stringify(data.uuid) }, {
                where: {
                    id: data.id
                }
            });

            res.status(200).json({
                code: 200,
                message: "Logged out successfully."
            });
        } catch (error) {
            next(error);
        }
    }

    async generateTokens(req, res, next) {
        try {
            const { userId, id } = req.userRefresh;

            const userData = await Uuid.findOne({
                where: {
                    userId: userId
                }
            });
            if (!userData) throw createError.NotFound("Token not found in db.");
            userData.uuid = JSON.parse(userData.uuid);
            const [user] =  userData.uuid.filter(item => item.id === id);

            if (!user) throw createError.NotFound("Token not found in db.");

            const index = userData.uuid.findIndex(item => item.id === id);

            const arr = userData.uuid.splice(index, 1);

            const uuid = createUuid();

            userData.uuid.push({ id: uuid, createdAt: new Date().getTime() });

            const updateUuid = await Uuid.update({  uuid: JSON.stringify(user.uuid)  }, {
                where: {
                    id: user.id
                }
            });

            const accessToken = await createAccessToken({ userId: user.id, uuid: id });

            const refreshToken = await createRefreshToken(user.id,id);

            res.status(200).json({
                status: 200,
                message: "Tokens generated successfully",
                token: { accessToken, refreshToken }
            });

        } catch (error) {
            next(error);
        }
    }

    async userLogoutAllTokens(req, res, next) {
        try {
            const { id, uuid } = req.user;

            const data = await Uuid.findOne({where :{ userId: id }});

            const tokenData = JSON.parse(data.uuid);

            const promises = [];
            
            tokenData.forEach(item => {
                promises.push(redisService.setLoggedOutToken(item.token));
            });

            const result = await Promise.all(promises);
            const deletedData = await Uuid.destroy({where :{ userId: id }});
            
            if (result.length) return res.status(200).json({
                code: 200,
                message: "User logged out from all devices"
            });

            throw createError.BadRequest("Something went wrong.");
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new AuthController;