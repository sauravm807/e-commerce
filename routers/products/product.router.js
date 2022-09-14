"use strict;"
const productRouter = require("express").Router();

productRouter.get("/", (req, res) => {
    res.status(200).json({
        code: 200,
        message: "products router"
    })
});

module.exports = productRouter;