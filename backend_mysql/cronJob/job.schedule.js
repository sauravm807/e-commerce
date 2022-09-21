const {
    func
} = require('joi');
const cron = require('node-cron');
const logger = require('../error/logger');
const {
    EVERY_30_SECONDS,
    EVERY_MINUTE,
    EVERY_30_MINUTES,
    EVERY_HOUR,
    EVERY_DAY
} = require('./schedule.time');
const Uuid = require("../modal/uuids/uuids.Modal");


/**
 * cron-job 
 * @author Sibasish Das <sibasishdas@globussoft.in>
 */

const jobSchedule = async () => {


    /**
     * job schedule for deleting token
     * @author Sibasish Das <sibasishdas@globussoft.in>
     */

    cron.schedule(EVERY_DAY, async () => {
        try {
            console.log('cron started');
            const data = await Uuid.findAll({});
            data.forEach(async element => {
                if (element.refreshtoken_expires_time < Math.round(new Date().getTime() / 1000)) {
                    let deleteToken = await Uuid.destroy({
                        where: {
                            uuid: element.uuid
                        }
                    });
                }

            })
        } catch (error) {
            logger.error(`${error.status || 500} - ${error.message} - 'error in deleting'`);
        }

    })

    cron.schedule(EVERY_30_SECONDS, async () => {
        try {
            console.log('cron started 2 ');

        } catch (error) {
            logger.error(`${error.status || 500} - ${error.message} - 'error in deleting'`);
        }

    })


}

jobSchedule()


module.exports = jobSchedule;