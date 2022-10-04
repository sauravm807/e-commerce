"use strict;"
//pakages imports
const createError = require('http-errors');
const { faker } = require('@faker-js/faker');

const dbOperation = require("../../../connection/sql.connection");

// services imports
const redisService = require("../../../services/redis.service");
const { userValidateSchemaRegister, userValidateSchemaLogin, userValidateSchemachangePassword } = require("../../../validation/user.validation");
const { encryptPassword, matchPassword } = require("../../../services/bcrypt.service");
const { createUuid } = require("../../../services/uuid.service");
const { createAccessToken, createRefreshToken, } = require("../../../services/jwt.service");
const sendSMS = require('../../../services/sms.service');
const { getColumnValues } = require("../../../services/utility.service");

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

            const query = `SELECT 
                                u.email, um.phone_no 
                            FROM users u INNER JOIN usermeta um ON u.id = um.user_id 
                            WHERE email = "${userData.email}" OR phone_no = "${userData.phoneNo}";`;
            const ifUserExist = await dbOperation.select(query);
            if (ifUserExist?.length) throw createError.Conflict(`Email or Phone Number is already present.`);

            const password = await encryptPassword(userData.password);
            userData.password = password;
            delete userData.repeatPassword;

            const user = {
                email: userData.email,
                password: userData.password,
                created_at: Math.floor(new Date().getTime() / 1000),
                updated_at: Math.floor(new Date().getTime() / 1000)
            };

            const { columns, values } = getColumnValues(user);

            const query1 = `INSERT INTO users ${columns} VALUES ${values}`;

            const insertUser = await dbOperation.insert(query1);

            const userMeta = {
                user_id: insertUser[0],
                full_name: userData.fullName,
                first_name: userData.firstName,
                last_name: userData.lastName,
                phone_no: userData.phoneNo,
                address: userData.address,
                created_at: Math.floor(new Date().getTime() / 1000),
                updated_at: Math.floor(new Date().getTime() / 1000)
            };

            const userMetaValue = getColumnValues(userMeta);

            const query2 = `INSERT INTO usermeta ${userMetaValue.columns} VALUES ${userMetaValue.values}`;

            const insertUserMeta = await dbOperation.insert(query2);

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
            let userVal = "";
            let userMetaVal = "";
            for (let i = 0; i < no; i++) {
                const fullName = faker.name.fullName();
                const firstName = fullName.split(" ")[0];
                const lastName = fullName.split(" ")[1];
                const email = faker.internet.email(fullName).toLowerCase();
                const phoneNo = faker.phone.number('+91##########');
                const createdAtStr = faker.date.between('2021-09-30 10:10:07', '2022-09-30 10:10:07').toISOString().slice(0, 19).replace('T', ' ');;
                const createdAt = new Date(createdAtStr).getTime() / 1000
                const address = `${faker.address.buildingNumber()} ${faker.address.cardinalDirection()} ${faker.address.city()} ${faker.address.state()}`;
                const password = await encryptPassword(email);
                const user = {
                    email: email,
                    password: password,
                    created_at: createdAt,
                    updated_at: createdAt
                };

                const { columns, values } = getColumnValues(user);

                const query1 = `INSERT INTO users ${columns} VALUES ${values}`;

                const insertUser = await dbOperation.insert(query1);

                const userMeta = {
                    user_id: insertUser[0],
                    full_name: fullName,
                    first_name: firstName,
                    last_name: lastName,
                    phone_no: phoneNo,
                    address: address,
                    created_at: createdAt,
                    updated_at: createdAt
                };

                const userMetaValue = getColumnValues(userMeta);

                const query2 = `INSERT INTO usermeta ${userMetaValue.columns} VALUES ${userMetaValue.values}`;

                const insertUserMeta = await dbOperation.insert(query2);
            }

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

            const query = `SELECT id,email,password,wrongPassCount,fullName,firstName,lastName FROM users WHERE email = "${userData.email}";`;

            let [user] = await dbOperation.select(query);

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
                    const query = `UPDATE users SET wrongPassCount = ${++count} WHERE id = ${user.id};`;
                    await dbOperation.update(query);
                    throw createError.Unauthorized(`Password do not match. Wrong attempt count ${count}.`);
                } else {
                    const result = await redisService.setId(user.id);
                    const query = `UPDATE users SET wrongPassCount = 0 WHERE id = ${user.id};`;
                    await dbOperation.update(query);
                    throw createError.BadRequest(`Login has been blocked try after one minute`);
                }
            }

            const uuid = createUuid();
            const accessToken = await createAccessToken({ user, uuid }); // create access token with payload id and uuid

            const refreshToken = await createRefreshToken({ userId: user.id, uuid }); // create refresh token with payload uuid

            const expiryTime = Math.round(new Date().getTime() / 1000) + 24 * 60 * 60

            const insertQry = `INSERT INTO uuids (userId, uuid, token, refreshtoken_expires_time) VALUES (${user.id},"${uuid}","${accessToken}",${expiryTime});`;

            const insertData = await dbOperation.insert(insertQry);

            if (!insertData || insertData[1] <= 0) throw createError.BadRequest("Something went wrong.");

            res.status(200).json({
                status: 200,
                message: "Login successfull",
                data: {
                    id: user.id,
                    token: { accessToken, refreshToken }
                }
            });
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
            let query = `SELECT * FROM uuids WHERE uuid = "${uuid}";`;

            const [tokenData] = await dbOperation.select(query);

            if (!tokenData) throw createError.NotFound("Token not found in db.");

            query = `DELETE FROM uuids WHERE uuid = "${uuid}";`;
            await dbOperation.delete(query);

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

            let query = `SELECT userId FROM uuids WHERE uuid = "${id}";`;

            const [isuuidPres] = await dbOperation.select(query);

            if (!isuuidPres) throw createError.NotFound("Token not found in db.");

            query = `SELECT id,email,password,wrongPassCount,fullName,firstName,lastName FROM users WHERE id = ${userId};`;

            const [userData] = await dbOperation.select(query);

            const uuid = createUuid();

            const accessToken = await createAccessToken({ user: userData, uuid: uuid });

            const refreshToken = await createRefreshToken({ userId, uuid });

            const expiryTime = Math.round(new Date().getTime() / 1000) + 24 * 60 * 60;

            query = `INSERT INTO uuids (userId,uuid,token,refreshtoken_expires_time) VALUES (${userId},"${uuid}","${accessToken}",${expiryTime});`

            const insertData = await dbOperation.insert(query);

            if (!insertData || insertData[1] <= 0) throw createError.BadRequest("Something went wrong.");

            query = `DELETE FROM uuids WHERE uuid = "${id}";`;

            await dbOperation.delete(query);

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
            const { id } = req.user;

            let query = `SELECT * FROM uuids WHERE userId = ${id};`;

            const data = await dbOperation.select(query);

            const promises = [];

            data.forEach(item => {
                promises.push(redisService.setLoggedOutToken(item.token));
            });

            const result = await Promise.all(promises);

            query = `DELETE FROM uuids WHERE userId = ${id};`;

            await dbOperation.delete(query);

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
            if (!email && !number) throw createError.BadRequest("Email and Number is required.");

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

            if (!otp) throw createError.BadRequest("OTP is required.");

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
            if (!email) throw createError.BadRequest("Email is required.");
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
                password: user.password
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