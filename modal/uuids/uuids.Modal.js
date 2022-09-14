"use strict;"
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UuidSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },

    uuid: { type: Array },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('uuid', UuidSchema);