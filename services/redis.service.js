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
    }
}