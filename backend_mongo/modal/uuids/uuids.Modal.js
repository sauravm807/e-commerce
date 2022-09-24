"use strict;"
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UuidSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },

    uuid: [{
        _id: String,
        token: String,
        createdAt: {
            type: Number
        },
        expiresAt : {
            type: Number
        }
    }]
});

module.exports = mongoose.model('uuid', UuidSchema);