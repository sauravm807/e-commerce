"use strict;"
const createError = require('http-errors');

const { verifyAccessToken, verifyRefreshToken } = require("../services/jwt.service");
const { setLoggedOutToken, getLoggedOutToken } = require("../services/redis.service");

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

            const ifLoggedOutToken = await getLoggedOutToken(tokenFromReq);

            if (ifLoggedOutToken) throw createError.Unauthorized("Token expired");

            const payload = await verifyAccessToken(tokenFromReq);

            if (!payload) throw createError.Unauthorized("Invalid token Access Denied");

            req.user = payload;
            next();
        } catch (error) {
            next(createError.Unauthorized(error));
        }
    },

    authenticateRefreshToken: async function (req, res, next) {
        try {
            let tokenFromReq = req.body.token;
            
            if (tokenFromReq == null) throw createError.NotFound("Access Denied");

            const payload = await verifyRefreshToken(tokenFromReq);

            if (!payload) throw createError.NotFound("Invalid token Access Denied");

            req.userRefresh = payload;
            next();
        } catch (error) {
            next(createError.Unauthorized(error));
        }
    },

    deleteToken: function (req, res, next) {
        let token = req.body.token || req.query.token || req.headers['x-access-token'];
        const authHeader = req.headers['authorization'];
        token = authHeader.split(" ")[1];

        setLoggedOutToken(token);
        next();
    }
}