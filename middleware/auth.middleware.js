"use strict;"
const createError = require('http-errors');

const { verifyAccessToken, verifyRefreshToken } = require("../services/jwt.service");

const User = require("../modal/user/User.modal");

module.exports = {
    authenticateAccessToken: async function (req, res, next) {
        try {
            let tokenFromReq = req.body.token || req.query.token || req.headers['x-access-token'];
            if (req.headers['authorization']) {
                const authHeader = req.headers['authorization'];
                if (!authHeader) throw createError.Unauthorized("Access Denied token required");
                tokenFromReq = authHeader.split(" ")[1];
            }

            if (tokenFromReq == null) throw createError.NotFound("Access Denied");
            
            const payload = await verifyAccessToken(tokenFromReq);
            
            const user = await User.findOne({ _id: payload.id });

            payload["email"] = user.email;
            payload["fullName"] = user.fullName;
            payload["firstName"] = user.firstName;
            payload["lastName"] = user.lastName;
            payload["address"] = user.address;
            payload["phoneNo"] = user.phoneNo;
            
            req.user = payload;
            next();
        } catch (error) {
            next(createError.Unauthorized(error));
        }
    },  

    authenticateRefreshToken: async function (req, res, next) {
        try {
            let tokenFromReq = req.body.token || req.query.token || req.headers['x-access-token'];
            if (req.headers['authorization']) {
                const authHeader = req.headers['authorization'];
                if (!authHeader) throw createError.Unauthorized("Access Denied token required");
                tokenFromReq = authHeader.split(" ")[1];
            }

            if (tokenFromReq == null) throw createError.NotFound("Access Denied");

            const payload = verifyRefreshToken(tokenFromReq);

            req.user = payload;
            next();
        } catch (error) {
            next(createError.Unauthorized(error));
        }
    }
}