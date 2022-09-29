"use strict;"
const express = require("express");

const app = express();

const createError = require('http-errors');

const morgan = require('morgan');

require('dotenv').config()

const PORT = process.env.PORT || 8088;

const router = require("./routers/main.router");

const db = require("./connection/sql.connection");
const jobSchedule = require("./cronJob/job.schedule");
const logger = require('../backend_mysql/error/logger');
const sms = require('./services/sms.service');

require("./connection/redis.connection");

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

/**
 * to generate secret key for tokens
 */
// (async function () {
//     try {
//         const { keyGenerator } = require("./secret_key_generator/secret");
//         const secretKey = await keyGenerator();
//         console.log(secretKey);
//     } catch (error) {
//         console.log(error);
//     }
// })();

app.use("/api", router);

/**
 * catch 404 and forward to error handler
 */

app.use((req, res, next) => {
    next(createError(404, "Not Found"));
    
});

/**
 * error handler
 */
app.use((err, req, res, next) => {
    console.log(err)
    logger.error(`${err.status || 500} - ${res.statusMessage} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    return res.status(err.status || 500).json({
        error: {
            status: err.status || 500,
            message: !err.status || err.status === 500 ? "Internal server error" : err.message
        }
    });
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));