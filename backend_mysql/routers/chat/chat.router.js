"use strict;"

const chatRouter = require("express").Router();

const chatController = require("../../controllers/chat/chat.controller");

chatRouter.get("/chatlist", chatController.getChatList);

chatRouter.get("/messages/:chatId", chatController.getMessageByChatId);

module.exports = { chatRouter };