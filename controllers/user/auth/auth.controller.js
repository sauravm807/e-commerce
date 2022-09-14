"use strict;"
//pakages imports
const createError = require('http-errors');
const { faker } = require('@faker-js/faker');

// modals imports
const User = require("../../../modal/user/User.modal");
const Uuid = require("../../../modal/uuids/uuids.Modal");

// services imports
const { userValidateSchemaRegister, userValidateSchemaLogin } = require("../../../validation/user.validation");
const { encryptPassword, matchPassword } = require("../../../services/bcrypt.service");
const { createUuid } = require("../../../services/uuid.service");
const {
    createAccessToken,
    verifyAccessToken,
    createRefreshToken,
    verifyRefreshToken
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
                const phoneNo = faker.phone.number('+91 #### ### ###');
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
            console.log(user)
            
            if (!user) throw createError.NotFound("Email not found.");

            const isMatch = await matchPassword({ password: userData.password, hash: user.password });
            if (!isMatch) throw createError.Unauthorized("Password do not match.");

            const accessToken = await createAccessToken(user._id); // create access token with payload id
            const uuid = createUuid();
            const refreshToken = await createRefreshToken(uuid); // create refresh token with payload uuid

            const ifUuidExist = await Uuid.findOne({ userId: user._id });
            if (!ifUuidExist) {
                const uuidCreate = new Uuid({ userId: user._id, uuid: uuid });

                const insertUuid = await uuidCreate.save();

                if (!insertUuid) throw createError.BadRequest("Something went wrong.");
                return res.status(200).json({
                    status: 200,
                    message: "Login successfull",
                    token: { accessToken, refreshToken }
                });
            }
            const arr = ifUuidExist.uuid;
            arr.push(uuid);
            const updateUuid = await Uuid.updateOne({ _id: ifUuidExist._id }, {
                $set: {
                    uuid: arr
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
    * getUserData - to get currently logged in user data
    * @param {*} req 
    * @param {*} res 
    * @param {*} next 
    * @author Saurav Vishal <sauravvishal@globussoft.in>
    */
    async getUserData(req, res, next) {
        try {
            if (!req.user) createError.NotFound("Access token required");
            const { id, email, fullName, firstName, lastName, address, phoneNo } = req.user;
            res.status(200).json({
                code: 200,
                data: { id, email, fullName, firstName, lastName, address, phoneNo }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController;