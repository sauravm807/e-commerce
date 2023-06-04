"use strict";
const createError = require('http-errors');
const dbOperation = require("../../connection/sql.connection");

class ChatController {

    /**
    * searchUser - Get users with whom chat has been done if not then send random users
    * @param {*} req 
    * @param {*} res 
    * @param {*} next 
    * @author Saurav Vishal <sauravvishal@globussoft.in>
    */
    async getChatList(req, res, next) {
        try {
            const { id } = req.user;
            let query = "";
            query = `SELECT 
                        m.id, u.user_id AS userId, users.email AS email, u.full_name AS fullName, u.pro_pic AS proPic, 
                        u.last_login AS lastLogin, c.id AS chatId, m.sid, m.rid, m.c_date AS chatDate, m.message, m.is_seen AS isSeen
                    FROM chats c INNER JOIN messages m ON c.id = m.chat_id
                    INNER JOIN usermeta u ON u.user_id = m.sid OR u.user_id = m.rid
                    INNER JOIN users ON users.id = u.user_id
                    WHERE (user1 = ${id} OR user2 = ${id}) AND m.permanently_deleted = 0 AND u.user_id <> ${id} AND m.id IN 
                    (
                        SELECT MAX(m.id)
                        FROM messages m
                        GROUP BY m.chat_id
                    ) ORDER BY chatDate DESC;`;
                    
            const data = await dbOperation.select(query);

            if (!data?.length) {
                query = `SELECT 
                                u.id, u.email, um.full_name as fullName, um.pro_pic as proPic, um.last_login as lastLogin 
                            FROM users u INNER JOIN usermeta um on u.id = um.user_id 
                            WHERE u.id <> ${id} ORDER BY RAND()  LIMIT 10;`;

                const userData = await dbOperation.select(query);
                if (!userData.length) throw createError.NotFound("Users not found.");
                return res.status(200).json({
                    status: 200,
                    message: "Users found successfully.",
                    messageFound: false,
                    data: userData
                });
            }

            res.status(200).json({
                status: 200,
                message: "Users found successfully.",
                messageFound: true,
                data: data
            });
        } catch (error) {
            next(error);
        }
    }

    async getMessageByChatId(req, res, next) {
        try {
            const { chatId } = req.params;
            if (!chatId || !Number(chatId)) throw createError.NotFound("Chat id is required and should be a number.")
            let query = `SELECT 
                                m.id, m.sid AS sender, m.rid AS receiver, m.c_date, m.message, m.is_seen AS isSeen 
                            FROM messages m WHERE m.chat_id = ${chatId} ORDER BY c_date`;

            const data = await dbOperation.select(query);
            if (!data.length) throw createError.NotFound("No messages found.");
            
            res.status(200).json({
                status:200,
                message: "Messages found successfully",
                data: data
            });
        } catch (error) {
            next(error);
        }
    }

    async getMessageByUserId(req, res, next) {
        try {
            const { userId } = req.params;
            const { id } = req.user;
            if (!userId || !Number(userId)) throw createError.NotFound("User id is required and should be a number.")
            let query = `SELECT 
                            m.id, m.chat_id AS chatId, m.sid AS sender, m.rid AS receiver, m.c_date, m.message, m.is_seen AS isSeen
                        FROM messages m WHERE (m.sid = ${id} AND m.rid = ${userId}) OR (m.sid = ${userId} AND m.rid = ${id})`;

            const data = await dbOperation.select(query);
            if (!data.length) throw createError.NotFound("No messages found.");
            
            res.status(200).json({
                status:200,
                message: "Messages found successfully",
                chatId: data[0].chatId,
                data: data
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ChatController; 