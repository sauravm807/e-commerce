"use strict";
const redis = require('redis');

const client = redis.createClient({
    socket: {
        host: '127.0.0.1',
        port: 6379
    }
});

(async () => {
    await client.connect();
})();

client.on('error', err => {
    console.log('Error ' + err);
});

client.on('end', err => {
    console.log('Redis is disconnected.');
});

process.on('SIGINT', async () => {
    await client.quit();
});

module.exports = client;