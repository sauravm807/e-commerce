"use strict;"
const express = require("express");

const app = express();

const createError = require('http-errors');

const cors = require('cors');

const morgan = require('morgan');

require('dotenv').config();

const PORT = process.env.PORT || 8088;

const router = require("./routers/main.router");

const db = require("./connection/sql.connection");
const jobSchedule = require("./cronJob/job.schedule");
const sms = require('./services/sms.service');

require("./connection/redis.connection");

app.use(cors());

app.use(express.json({
    limit: "50mb",
    type: 'application/json'
}));

app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}));

// app.use(morgan('dev'));

app.use(express.static('public'));

const server = app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

require("./services/socket/socket.init")(server);

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
    // console.log(err)
    return res.status(err.status || 500).json({
        error: {
            status: err.status || 500,
            message: !err.status || err.status === 500 ? "Internal server error" : err.message
        }
    });
});