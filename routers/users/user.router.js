"use strict;"
const userRouter = require("express").Router();

const authController = require("../../controllers/user/auth/auth.controller");

const { authenticateAccessToken } = require("../../middleware/auth.middleware");

userRouter.post("/register", authController.registerOneUser);

userRouter.post("/register/multiple/random/:no", authController.registerMultipleRandomUser);

userRouter.post("/login", authController.userLogin);

userRouter.use(authenticateAccessToken);

userRouter.post("/get/userData", authController.getUserData);

module.exports = userRouter;