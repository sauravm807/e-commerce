"use strict;"
const router = require("express").Router();

const userRouter = require("./users/user.router");

const productRouter = require("./products/product.router");

router.use("/user", userRouter);

router.use("/product", productRouter);

module.exports = router;