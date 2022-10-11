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
            try {
                const currTime = Math.round(new Date().getTime() / 1000);
                await dbOperation.update(`Update usermeta set last_login = ${currTime} where user_id = ${userId};`);
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

                io.emit("updateUsers", { users, disconnectedUsers });
            } catch (error) {
                console.log(error);
            }
        });

        socket.on('logoutAll', async (id) => {
            try {
                const currTime = Math.round(new Date().getTime() / 1000);
                await dbOperation.update(`Update usermeta set last_login = ${currTime} where user_id = ${id};`);
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

        socket.on('sendMessage', async (data) => {
            try {
                let { chatId, sender, receiver, message, c_date } = data;
                c_date = Math.round(c_date / 1000);
                let query = "";
                if (chatId) {
                    query = `INSERT INTO messages (chat_id, sid, rid, c_date, message) VALUES
                                (${chatId}, ${sender}, ${receiver}, ${c_date} ,"${message}");`;

                    // const insert1 = await dbOperation.insert(query);
                    //console.log("insert /1===", insert1)
                    console.log("createdmessageData", { ...data })
                    io.emit("createdMessageData", data);
                } else {
                    query = `INSERT INTO chats (user1, user2) VALUES (${sender}, ${receiver});`;

                    // const insertedData = await dbOperation.insert(query);
                    // query = `INSERT INTO messages (chat_id, sid, rid, c_date, message) VALUES
                    //             (${insertedData[0]}, ${sender}, ${receiver}, ${c_date}, "${message}");`;

                    // const insert2 = await dbOperation.insert(query);
                    // console.log("insert1====", insert2)
                    // io.emit("createdmessageData", { ...data, chatId: insertedData[0]});
                }

            } catch (error) {
                console.log(error);
            }
        });
    });
}
