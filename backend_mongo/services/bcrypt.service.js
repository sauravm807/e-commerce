"use strict;"
const bcrypt = require('bcrypt');
const saltRounds = 10;
const createError = require('http-errors');

module.exports = {
    encryptPassword: function (password) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, saltRounds)
                .then(hash => resolve(hash))
                .catch(err => {
                    reject("Internal server error.");
                });
        });
    },

    matchPassword: function ({ password, hash }) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hash)
                .then(match => resolve(match))
                .catch(err => {
                    reject("Internal server error.");
                });
        });
    }
};