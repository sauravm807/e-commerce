const cron = require('node-cron');
const Uuid = require("../../modal/uuids/uuids.Modal");

const TOKEN_EXPIRY_TIME = '* */24 * * *';

module.exports = function () {
    cron.schedule(TOKEN_EXPIRY_TIME, async () => {
        const userData = await Uuid.find({});
        userData.forEach(user => {
            user?.uuid.forEach(async tokenData => {
                const currentTime = new Date().getTime();
                if (tokenData.expiresAt < currentTime) {
                    await Uuid.updateOne(
                        { _id: user._id },
                        { $pull: { uuid: { _id: tokenData._id } } });
                } else {
                    console.log("token valid")
                }
            })
        })
    });
}