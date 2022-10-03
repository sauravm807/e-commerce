"use strict";

const { Server } = require("socket.io");
let users = [];
let connections = [];

module.exports = function (server) {
    const io = new Server(server, {
        cors: {
            origins: ['http://localhost:4200']
        }
    });

    io.on('connection', (socket) => {
        socket.on('joinUser', (userId) => {
            users.push(userId);
            connections.push({ socketId: socket.id, userId });
            const set = new Set(users);
            users = [...set];

            io.emit("update users", users);
        });

        socket.on('disconnect', () => {
            const user = connections.find(elem => elem.socketId === socket.id);

            connections = connections.filter(elem => elem.socketId !== socket.id);

            const index = connections.findIndex(elem => elem.userId === user?.userId);

            if (index === -1) {
                const i = users.indexOf(user?.userId);
                users.splice(i, 1);
            }

            io.emit("update users", users);
        });

        socket.on('logout all', (id) => {
            const index = users.indexOf(id);
            users.splice(index, 1);
            connections = connections.filter(elem => elem.userId !== id);
            io.emit("update users", users);
        });
    });
}