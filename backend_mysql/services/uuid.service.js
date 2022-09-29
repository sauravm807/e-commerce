"use strict;"
const { v4: uuidv4 } = require('uuid');

module.exports = {
    createUuid: function () {
        return uuidv4();
    }
};