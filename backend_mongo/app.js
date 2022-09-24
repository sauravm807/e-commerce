"use strict;"
const express = require("express");

const app = express();

const createError = require('http-errors');

const cors = require('cors')

const morgan = require('morgan');

require('dotenv').config()

const PORT = process.env.PORT || 3000;

const router = require("./routers/main.router");

require("./connection/mongo.connection");

require("./connection/redis.connection");

require("./services/cronJobs/cron.init")();

app.use(cors());

app.use(express.static('public'));

app.use(express.json({
    limit: "50mb",
    type: 'application/json'
}));

app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}));

app.use(morgan('dev'));

const server = app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

require("./services/socket/socket.init")(server);

/**
 * to generate secret key for tokens
 */
// const { generateSecretKey } = require("./secret_key_generator/secret");
// generateSecretKey();

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
    console.log(err.message);
    return res.status(err.status || 500).json({
        error: {
            status: err.status || 500,
            message: !err.status || err.status === 500 ? "Internal server error" : err.message
        }
    });
});

