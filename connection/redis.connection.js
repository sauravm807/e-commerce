"use strict";

const createError = require('http-errors');
const redis = require('redis');

module.exports = function () {
    const client = redis.createClient({
        socket: {
            host: 'localhost',
            port: 6379
        }
    });
    
    client.on('connect', function () {
        console.log('Connected to Redis!');
    });
    
    client.on('error', err => {
        console.log('Error ' + err);
        throw createError.InternalServerError("Internal server error.")
    });
}
