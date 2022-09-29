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
            const userData = await userValidateSchemaRegister.validateAsync(req.body);
            const ifUserExist = await User.findOne({ email: userData.email });
            if (ifUserExist) throw createError.Conflict(`${userData.email} is already present.`);

            const password = await encryptPassword(userData.password);
            userData.password = password;
            delete userData.repeatPassword;
            const user = new User(userData);
            const insertUser = await user.save();
            if (!insertUser._id) throw createError.BadRequest("User not created.");
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
                const phoneNo = faker.phone.number('+91##########');
                const createdAt = faker.date.between('2021-01-01T00:00:00.000Z', '2022-06-06T00:00:00.000Z')
                const address = `${faker.address.buildingNumber()} ${faker.address.cardinalDirection()} ${faker.address.city()} ${faker.address.state()}`;
                const password = await encryptPassword(email);
                users.push({ email, password, fullName, firstName, lastName, phoneNo, address, createdAt });
            }

            const insertedData = await User.insertMany(users);

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
            const user = await User.findOne({ email: userData.email }).lean();

            if (!user) throw createError.NotFound("Email not found.");

            const isMatch = await matchPassword({ password: userData.password, hash: user.password });
            const msg = await redisService.getId(user._id);
            if (msg) {
                const ttl = await redisService.getTtl(user._id);
                throw createError.BadRequest(`Login has been blocked try after ${ttl} seconds`);
            }

            if (!isMatch) {
                let count = user.wrongPassCount;
                if (count < 3) {
                    await User.updateOne({ _id: user._id }, {
                        $set: {
                            wrongPassCount: ++count
                        }
                    });
                    throw createError.Unauthorized(`Password do not match. Wrong attempt count ${count}`);
                } else {
                    const result = await redisService.setId(user._id);
                    await User.updateOne({ _id: user._id }, {
                        $set: {
                            wrongPassCount: 0
                        }
                    });
                    throw createError.BadRequest(`Login has been blocked try after one minute`);
                }
            }

            const uuid = createUuid();
            const accessToken = await createAccessToken({ user: user, uuid }); // create access token with payload id and uuid

            const refreshToken = await createRefreshToken(uuid); // create refresh token with payload uuid

            const CREATED_AT = new Date().getTime();
            
            const EXPIRES_AT = CREATED_AT + (24 * 60 * 60 * 1000);

            const ifUuidExist = await Uuid.findOne({ userId: user._id });
            if (!ifUuidExist) {
                const uuidCreate = new Uuid({
                    userId: user._id,
                    uuid: [{
                        _id: uuid,
                        token: accessToken,
                        createdAt: CREATED_AT,
                        expiresAt: EXPIRES_AT 
                    }]
                });

                const insertUuid = await uuidCreate.save();

                if (!insertUuid) throw createError.BadRequest("Something went wrong.");
                return res.status(200).json({
                    status: 200,
                    message: "Login successfull",
                    data: {
                        id: user._id,
                        token: { accessToken, refreshToken }
                    }
                });
            }

            const arr = ifUuidExist.uuid;
            arr.push({ _id: uuid, token: accessToken, createdAt: CREATED_AT, expiresAt: EXPIRES_AT });
            const updateUuid = await Uuid.updateOne({ _id: ifUuidExist._id }, {
                $set: {
                    uuid: arr,
                }
            });
            if (updateUuid) return res.status(200).json({
                status: 200,
                message: "Login successfull",
                data: {
                    id: user._id,
                    token: { accessToken, refreshToken }
                }
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

            const data = await Uuid.findOne({ userId: id });
            if (!data) throw createError.NotFound("Token not in DB.");
            const index = data.uuid.findIndex(item => item._id === uuid);

            const arr = data.uuid.splice(index, 1);

            const updateUuid = await Uuid.updateOne({ _id: data._id }, {
                $set: {
                    uuid: data.uuid
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
            const { id } = req.userRefresh;
            const user = await Uuid.findOne({
                uuid: {
                    $elemMatch: {
                        _id: id
                    }
                }
            });

            if (!user?.uuid) throw createError.NotFound("Token not found in db.");

            const index = user.uuid.findIndex(item => item._id === id);

            const arr = user.uuid.splice(index, 1);

            const uuid = createUuid();

            const userData = await User.findOne({ _id: user.userId });

            const accessToken = await createAccessToken({ user: userData, uuid: uuid });

            const refreshToken = await createRefreshToken(uuid);

            const CREATED_AT = new Date().getTime();
            
            const EXPIRES_AT = CREATED_AT + (24 * 60 * 60 * 1000);

            user.uuid.push({ _id: uuid, token: accessToken, createdAt: CREATED_AT, expiresAt: EXPIRES_AT });

            const updateUuid = await Uuid.updateOne({ _id: user._id }, {
                $set: {
                    uuid: user.uuid
                }
            });

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

            const [data] = await Uuid.find({ userId: id });

            const tokenData = data.uuid;

            const promises = [];

            tokenData.forEach(item => {
                promises.push(redisService.setLoggedOutToken(item.token));
            });

            const result = await Promise.all(promises);
            const deletedData = await Uuid.deleteOne({ userId: id });

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