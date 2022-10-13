const cron = require('node-cron');
const {
    EVERY_30_SECONDS,
    EVERY_MINUTE,
    EVERY_30_MINUTES,
    EVERY_HOUR,
    EVERY_DAY
} = require('./schedule.time');

const dbOperation = require("../connection/sql.connection");


/**
 * cron-job 
 * @author Sibasish Das <sibasishdas@globussoft.in>
 */

const jobSchedule = async () => {

    /**
     * job schedule for deleting token
     * @author Sibasish Das <sibasishdas@globussoft.in>
     */

    cron.schedule(EVERY_30_MINUTES, async () => {
        try {
            console.log("cron started========")
            const data = await dbOperation.select("SELECT uuid, refreshtoken_expires_time FROM uuids;");
            data.forEach(async element => {
                console.log("element.refreshtoken_expires_time", element.refreshtoken_expires_time);
                console.log("cron time", Math.round(new Date().getTime() / 1000));
                if (element.refreshtoken_expires_time < Math.round(new Date().getTime() / 1000)) {
                    await dbOperation.delete(`DELETE FROM uuids WHERE uuid = "${element.uuid}"`);
                }
            });
        } catch (error) {
            console.log(error);
        }
    })
}

jobSchedule()


module.exports = jobSchedule;