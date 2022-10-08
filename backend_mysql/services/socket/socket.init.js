"use strict";

const { Server } = require("socket.io");
let users = [];
let disconnectedUsers = [];
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

            const index = disconnectedUsers.findIndex(elem => elem.userId === userId);
            if (index > -1) disconnectedUsers.splice(index, 1);
           
            io.emit("update users", { users, disconnectedUsers });
        });

        socket.on('disconnect', async () => {
            const userId = connections.find(elem => elem.socketId === socket.id)?.userId;
            const currTime = Math.round(new Date().getTime() / 1000);
            await dbOperation.update(`Update usermeta set last_login = ${currTime} where user_id = ${userId};`);
            connections = connections.filter(elem => elem.socketId !== socket.id);
            const index = connections.findIndex(elem => elem.userId === userId);
            if (index && index === -1) {
                const i = users.findIndex(elem => elem.userId === userId);
                if (i !== -1) {
                    const updatedUsers = users.splice(i, 1);
                    disconnectedUsers.push(updatedUsers[0]);
                    disconnectedUsers[disconnectedUsers.length - 1].lastLogin = currTime;
                }
            }
            
            io.emit("update users", { users, disconnectedUsers });
        });

        socket.on('logout all', async (id) => {
            const currTime = Math.round(new Date().getTime() / 1000);
            await dbOperation.update(`Update usermeta set last_login = ${currTime} where user_id = ${id};`);
            const index = users.findIndex(elem => elem.userId === id);
            const usersDisconnected = users.splice(index, 1);
            disconnectedUsers.push(usersDisconnected[0]);
            disconnectedUsers[disconnectedUsers.length - 1].lastLogin = currTime;
            connections = connections.filter(elem => elem.userId !== id);
            
            io.emit("update users", { users, disconnectedUsers });
        });
    });
}
