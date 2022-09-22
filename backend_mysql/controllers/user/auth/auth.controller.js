"use strict;"
//pakages imports
const createError = require('http-errors');
const {
    faker
} = require('@faker-js/faker');

// modals imports
const User = require("../../../modal/user/User.modal");
const Uuid = require("../../../modal/uuids/uuids.Modal");

// services imports
const redisService = require("../../../services/redis.service");
const {
    userValidateSchemaRegister,
    userValidateSchemaLogin,
    userValidateSchemachangePassword
} = require("../../../validation/user.validation");
const {
    encryptPassword,
    matchPassword
} = require("../../../services/bcrypt.service");
const {
    createUuid
} = require("../../../services/uuid.service");
const {
    createAccessToken,
    createRefreshToken,
} = require("../../../services/jwt.service");
const sendSMS = require('../../../services/sms.service')

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
            const ifUserExist = await User.findOne({
                where: {
                    email: req.body.email
                }
            });
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
            const {
                no
            } = req.params;
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
                users.push({
                    email,
                    password,
                    fullName,
                    firstName,
                    lastName,
                    phoneNo,
                    address,
                    createdAt
                });
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
            const user = await User.findOne({
                where: {
                    email: userData.email
                }
            });

            if (!user) throw createError.NotFound("Email not found.");

            const isMatch = await matchPassword({
                password: userData.password,
                hash: user.password
            });
            const msg = await redisService.getId(user.id);
            if (msg) {
                const ttl = await redisService.getTtl(user.id);
                throw createError.BadRequest(`Login has been blocked try after ${ttl} seconds`);
            }

            if (!isMatch) {
                let count = user.wrongPassCount;
                if (count < 3) {
                    await User.update({
                        wrongPassCount: ++count
                    }, {
                        where: {
                            id: user.id
                        }
                    });
                    throw createError.Unauthorized(`Password do not match. Wrong attempt count ${count}`);
                } else {
                    const result = await redisService.setId(user.id);
                    await User.update({
                        wrongPassCount: 0
                    }, {
                        where: {
                            id: user.id
                        }
                    });
                    throw createError.BadRequest(`Login has been blocked try after one minute`);
                }
            }

            const uuid = createUuid();
            const accessToken = await createAccessToken({
                userId: user.id,
                uuid
            }); // create access token with payload id and uuid
            const refreshToken = await createRefreshToken(user.id, uuid); // create refresh token with payload uuid
            const uuidCreate = await Uuid.create({
                userId: user.id,
                uuid: uuid,
                token: accessToken,
                refreshtoken_expires_time: Math.round(new Date().getTime() / 1000) + 24 * 60 * 60
            });

            if (!uuidCreate) throw createError.BadRequest("Something went wrong.");
            return res.status(200).json({
                status: 200,
                message: "Login successfull",
                token: {
                    accessToken,
                    refreshToken
                }
            });
        } catch (error) {
            console.log(error.message);
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
            const {
                id,
                uuid
            } = req.user;

            const data = await Uuid.findAll({
                where: {
                    userId: id
                }
            });

            const tokenData = data.filter(item => item.uuid === uuid);
            if (!tokenData) throw createError.NotFound("Token not found in db.");
            const deleteUuid = await Uuid.destroy({
                where: {
                    uuid: uuid
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
            const {
                userId,
                id
            } = req.userRefresh;

            const userData = await Uuid.findAll({
                where: {
                    uuid: id
                }
            });
            if (!Object.keys(userData).length) throw createError.NotFound("Token not found in db.");

            const uuid = createUuid();

            const accessToken = await createAccessToken({
                userId: userId,
                uuid: uuid
            });

            const refreshToken = await createRefreshToken(userId, uuid);

            const uuidCreate = await Uuid.create({
                userId: userId,
                uuid: uuid,
                token: accessToken,
                refreshtoken_expires_time: Math.round(new Date().getTime() / 1000) + 24 * 60 * 60
            });

            if (!uuidCreate) throw createError.BadRequest("Something went wrong.");

            const deleteUuid = await Uuid.destroy({
                where: {
                    uuid: id
                }
            });

            res.status(200).json({
                status: 200,
                message: "Tokens generated successfully",
                token: {
                    accessToken,
                    refreshToken
                }
            });

        } catch (error) {
            next(error);
        }
    }

    async userLogoutAllTokens(req, res, next) {
        try {
            const {
                id,
                uuid
            } = req.user;

            const data = await Uuid.findAll({
                where: {
                    userId: id
                }
            });
            const promises = [];

            data.forEach(item => {
                promises.push(redisService.setLoggedOutToken(item.token));
            });

            const result = await Promise.all(promises);
            const deletedData = await Uuid.destroy({
                where: {
                    userId: id
                }
            });

            if (result.length) return res.status(200).json({
                code: 200,
                message: "User logged out from all devices"
            });

            throw createError.BadRequest("Something went wrong.");
        } catch (error) {
            next(error);
        }
    }

    async forgetPassword(req, res, next) {
        try {
            const {
                email,
                number
            } = req.body;
            if(!email && !number) throw createError.BadRequest("Email and Number is required.");

            let verifyuser = await User.findOne({
                where: {
                    email: email
                }
            });

            if (!verifyuser) throw createError.NotFound("Email not found.");

            let randomnumber = Math.floor(
                Math.random() * (100000, 999999)
            );

            let smsBody = `this is your verification code: ${randomnumber}`;
            let sms = await sendSMS('+13605646827', '+917008444956', smsBody)
            if (!sms) throw createError.BadRequest("Something went wrong!");
            console.log(sms, 'sms sent');
            let setotp = await redisService.setVerificationOtp(randomnumber.toString(), verifyuser.email);

            // let updateOtp = await User.update({
            //     verification_otp: randomnumber,
            //     otp_expires_time: OTP_expires_time
            // }, {
            //     where: {
            //         email: email
            //     }
            // })
            return res.status(200).json({
                code: 200,
                message: "OTP has been sent to your register mobile number !"
            });

        } catch (error) {
            console.log(error);
            next(error);
        }

    }

    async verifyOtp(req, res, next) {
        try {
            const {
                otp
            } = req.body;

            if(!otp) throw createError.BadRequest("OTP is required.");

            let verifyotp = await redisService.getVerificationOtp(otp.toString());
            if (verifyotp) return res.status(200).json({
                code: 200,
                message: "OTP matched!"
            });
            throw createError.NotFound("Invalid otp!");

        } catch (error) {
            console.log(error.message);
            next(error);

        }
    }

    async resendOtp(req, res, next) {
        try {
            const {
                email
            } = req.query;
            if(!email) throw createError.BadRequest("Email is required.");
            let verifyuser = await User.findOne({
                where: {
                    email: email
                }
            });

            if (!verifyuser) throw createError.NotFound("Email not found.");
            let randomnumber = Math.floor(
                Math.random() * (100000, 999999)
            );
            let smsBody = `this is your verification code: ${randomnumber}`;
            let sms = await sendSMS('+13605646827', '+917008444956', smsBody)
            if (!sms) throw createError.BadRequest("Something went wrong!");
            let setotp = await redisService.setVerificationOtp(randomnumber.toString(), verifyuser.email);

            return res.status(200).json({
                code: 200,
                message: "OTP has been sent to your register mobile number!"
            });

        } catch (error) {

            next(error)

        }
    }

   async changePasword(req, res, next) {
        try {
            const user = await userValidateSchemachangePassword.validateAsync(req.body);
            let verifyuser = await User.findOne({
                where: {
                    email: user.email
                }
            });

            if (!verifyuser) throw createError.NotFound("Email not found.");
            const password = await encryptPassword(user.password);
            user.password = password;
            let updatePassword = await User.update({
                password:  user.password
            }, {
                where: {
                    email: user.email
                }
            })
            return res.status(200).json({
                code: 200,
                message: "Password change successfully!"
            });


        } catch (error) {
            next(error)

        }
    }

}

module.exports = new AuthController;