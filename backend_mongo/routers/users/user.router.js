"use strict;"
const userRouter = require("express").Router();

const authController = require("../../controllers/user/auth/auth.controller");
const userController = require("../../controllers/user/user.controller");

const { authenticateAccessToken, authenticateRefreshToken, deleteToken } = require("../../middleware/auth.middleware");

userRouter.post("/register", authController.registerOneUser);

userRouter.post("/register/multiple/random/:no", authController.registerMultipleRandomUser);

userRouter.post("/login", authController.userLogin);

userRouter.post("/get/tokens", authenticateRefreshToken, authController.generateTokens);

userRouter.use(authenticateAccessToken);

userRouter.delete("/logout", deleteToken, authController.userLogout);

userRouter.delete("/logout/all-tokens", authController.userLogoutAllTokens);

userRouter.get("/me", userController.getUserData);

userRouter.post("/upload/propic", userController.uploadProfilePic);

userRouter.post("/search", userController.searchUser);

userRouter.get("/friends", userController.getUsers);

module.exports = userRouter;