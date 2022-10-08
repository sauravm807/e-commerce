"use strict;"
const jwt = require('jsonwebtoken');

module.exports = {
  createAccessToken: function ({ user, uuid }) {
    return new Promise((resolve, reject) => {
      jwt.sign({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        firstName: user.first_name,
        lastName: user.last_name,
        uuid: uuid
      }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: 1 * 60 * 60 }, function (err, token) {
        if (err) reject("Internal server error");
        resolve(token);
      });
    });
  },

  verifyAccessToken: function (token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, function (err, decoded) {
        if (err) resolve(false)
        resolve(decoded);
      });
    });
  },

  createRefreshToken: function ({ userId, uuid }) {
    return new Promise((resolve, reject) => {
      jwt.sign({
        userId: userId,
        id: uuid
      }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: 1 * 24 * 60 * 60 }, function (err, token) {
        if (err) reject("Internal server error");
        resolve(token);
      });
    });
  },

  verifyRefreshToken: function (token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.REFRESH_TOKEN_SECRET_KEY, function (err, decoded) {
        if (err) resolve(false);
        resolve(decoded);
      });
    });
  }
};