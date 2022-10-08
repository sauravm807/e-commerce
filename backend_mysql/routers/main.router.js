"use strict;"
const router = require("express").Router();

const userRouter = require("./users/user.router");

router.use("/user", userRouter);

module.exports = router;