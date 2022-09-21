const client = require("../connection/redis.connection");

module.exports = {
    setId: function (id) {
        return new Promise(async (resolve, reject) => {
            const result = await client.set(id.toString(), "wrong_password", { EX: 1 * 60 });
            if (result === "OK") resolve(true);
            resolve(false);
        });
    },

    getId: function (id) {
        return new Promise(async (resolve, reject) => {
            const result = await client.get(id.toString());
            if (result === "wrong_password") resolve(true);
            resolve(false)
        });
    },

    getTtl: function (id) {
        return new Promise(async (resolve, reject) => {
            const result = await client.TTL(id.toString());
            console.log(result)
            resolve(result);
        });
    },

    setLoggedOutToken: function (token) {
        return new Promise(async (resolve, reject) => {
            const result = await client.set(token.toString(), "logged_out", { EX: 75 * 60 });
            if (result === "OK") resolve(true);
            resolve(false);
        });
    },

    getLoggedOutToken: function (token) {
        return new Promise(async (resolve, reject) => {
            const result = await client.keys(token.toString());
            if (result[0] == token) {
                resolve(true)
            } else {
                resolve(false)
            }
        });
    },
    setVerificationOtp: function (otp,email) {
        return new Promise(async (resolve, reject) => {
            const result = await client.set(otp,email,{EX : 1 * 60 });
            if (result === "OK") resolve(true);
            resolve(false);
        });
    },
    getVerificationOtp: function (otp) {
        return new Promise(async (resolve, reject) => {
            const result = await client.keys(otp);
            if (result[0] == otp) {
                resolve(true)
            } else {
                resolve(false)
            }
        });
    },
}