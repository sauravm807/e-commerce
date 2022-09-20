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

app.use(cors())

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

const server = app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

const io = require('socket.io')(server, {
    cors: {
        origins: ['http://localhost:4200']
    }
});

io.on('connection', (socket) => {
    console.log('a user connected with id :', socket.id);
    console.log('if user connected :', socket.connected);
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('my message', (msg) => {
        console.log('message: ' + msg);
    });

    // socket.on('my message', (msg) => {
    //     io.emit('my broadcast', `server: ${msg}`);
    // });
});

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

