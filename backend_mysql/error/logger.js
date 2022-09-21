const { createLogger, format, transports } = require('winston');
const path = require("path");

/**
 * logger
 * @author Sibasish Das <sibasishdas@globussoft.in>
 */

module.exports = createLogger({
transports:
    new transports.File({
    filename: `${path.join(__dirname,'/err.log')}`,
    format:format.combine(
        format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
        format.align(),
        format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
    )}),
});