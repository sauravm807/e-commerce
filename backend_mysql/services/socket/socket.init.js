"use strict";

const { Server } = require("socket.io");
let users = [];
let disconnectedUsers = [];
let connections = [];
const dbOperation = require("../../connection/sql.connection");
let map = new Map();

module.exports = function (server) {
    const io = new Server(server, {
        cors: {
            origins: ['http://localhost:4200']
        }
    });

    io.on('connection', (socket) => {
        socket.on('joinUser', async (userId) => {
            try {
                const currTime = Math.round(new Date().getTime() / 1000);
                await dbOperation.update(`UPDATE usermeta SET last_login = ${currTime} WHERE user_id = ${userId};`);
                users.push({ userId, lastLogin: currTime });
                connections.push({ socketId: socket.id, userId });
                users = [...new Map(users.map(item => [item['userId'], item])).values()];

                const index = disconnectedUsers.findIndex(elem => elem.userId === userId);
                if (index > -1) disconnectedUsers.splice(index, 1);

                io.emit("updateUsers", { users, disconnectedUsers });
            } catch (error) {
                console.log(error);
            }
        });

        socket.on('disconnect', async () => {
            try {
                const userId = connections.find(elem => elem.socketId === socket.id)?.userId;
                const currTime = Math.round(new Date().getTime() / 1000);
                await dbOperation.update(`UPDATE usermeta SET last_login = ${currTime} WHERE user_id = ${userId};`);
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

                io.emit("updateUsers", { users, disconnectedUsers });
            } catch (error) {
                console.log(error);
            }
        });

        socket.on('logoutAll', async (id) => {
            try {
                const currTime = Math.round(new Date().getTime() / 1000);
                await dbOperation.update(`UPDATE usermeta SET last_login = ${currTime} WHERE user_id = ${id};`);
                const index = users.findIndex(elem => elem.userId === id);
                const usersDisconnected = users.splice(index, 1);
                disconnectedUsers.push(usersDisconnected[0]);
                disconnectedUsers[disconnectedUsers.length - 1].lastLogin = currTime;
                connections = connections.filter(elem => elem.userId !== id);

                io.emit("updateUsers", { users, disconnectedUsers });
            } catch (error) {
                console.log(error);
            }
        });

        socket.on('message', async ({ data, userData }) => {
            try {
                let { chatId, sender, receiver, message, c_date, isSeen } = data;
                
                c_date = Math.round(c_date / 1000);
                if (map.get(receiver) === sender) {
                    isSeen = 1;
                    data.isSeen = 1;
                    io.emit("isConnected", 1);
                } else {
                    isSeen = 0;
                    data.isSeen = 0;
                    io.emit("isConnected", 0);
                }

                let query = "";
                if (chatId) {
                    query = `INSERT INTO messages (chat_id, sid, rid, c_date, message, is_seen) VALUES
                                (${chatId}, ${sender}, ${receiver}, ${c_date} ,"${message}", ${isSeen});`;
                    const insert1 = await dbOperation.insert(query);
                    io.emit("message", data);
                } else {
                    query = `INSERT INTO chats (user1, user2) VALUES (${sender}, ${receiver});`;
                    const insertedData = await dbOperation.insert(query);
                    
                    query = `INSERT INTO messages (chat_id, sid, rid, c_date, message, is_seen) VALUES
                                (${insertedData[0]}, ${sender}, ${receiver}, ${c_date}, "${message}", ${isSeen});`;

                    const insert2 = await dbOperation.insert(query);
                    io.emit("message", { ...data, ...userData, chatId: insertedData[0], isFirstMessage: true });
                }
            } catch (error) {
                console.log(error);
            }
        });

        socket.on("updateSeenMessage", async (user) => {
            try {
                await dbOperation.update(`UPDATE messages SET is_seen = 1 WHERE sid = ${user.sender} AND rid = ${user.receiver};`);

                io.emit("updateSeenMessage", user);
            } catch (error) {
                console.log(error);
            }
        });

        socket.on("connectedUser", (arr) => {
            map.set(arr[0], arr[1]);
        });
    });
}