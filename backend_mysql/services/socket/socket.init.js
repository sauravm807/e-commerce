"use strict";

const { Server } = require("socket.io");
let users = [];
let connections = [];
const dbOperation = require("../../connection/sql.connection");

module.exports = function (server) {
    const io = new Server(server, {
        cors: {
            origins: ['http://localhost:4200']
        }
    });

    io.on('connection', (socket) => {
        socket.on('joinUser', async (userId) => {
            const currTime = Math.round(new Date().getTime() / 1000);
            await dbOperation.update(`Update usermeta set last_login = ${currTime} where user_id = ${userId};`);
            users.push({ userId, lastLogin: currTime });
            connections.push({ socketId: socket.id, userId });
            users = [...new Map(users.map(item => [item['userId'], item])).values()];
            // users = users.map(elem => {
            //     if (!elem.lastLogin) {
            //         elem = { id: elem, lastLogin: currTime };
            //     } else {
            //         const index = users.findIndex(item => item.id === elem.id);
            //         if (index !== -1) {
            //             items[index] = 1010;
            //         }
            //     }
            //     return elem;
            // });
            console.log("join users====", users)
            io.emit("update users", users);
        });

        socket.on('disconnect', () => {
            const user = connections.find(elem => elem.socketId === socket.id);
            connections = connections.filter(elem => elem.socketId !== socket.id);

            const index = connections.findIndex(elem => elem.userId === user?.userId);

            if (index && index === -1) {
                if (user?.userId) {
                    const i = users.findIndex(elem => elem.id === user?.userId);
                    users.splice(i, 1);
                }
            }
            console.log(users)
            io.emit("update users", users);
        });

        socket.on('logout all', (id) => {
            const index = users.findIndex(elem => elem.id === id);
            users.splice(index, 1);
            connections = connections.filter(elem => elem.userId !== id);
            io.emit("update users", users);
        });
    });
}
