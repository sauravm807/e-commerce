"use strict";

const initModel = require('../modal/init.modal');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB, process.env.DB_USERNAME,
    process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    operationsAliases: false,
    logging: false,
    pool: {
        max: 10,
        min: 5,
        acquire: process.env.DB_POOL_ACQUIRE,
        idle: process.env.DB_POOL_IDLE
    }
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// db.models = initModel.initModels(sequelize);
db.models = initModel.initModels(sequelize, Sequelize);

db.sequelize.sync({ force: false })
    .then(() => console.log("re-sync done."));
class DbOperation {
    async select(query) {
        try {
            if (query) {
                return await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
            }
            else
                return null;
        } catch (e) {
            return null;
        }
    }

    async insert(query) {
        try {
            if (query) {
                return await sequelize.query(query, { type: Sequelize.QueryTypes.INSERT });
            }
            else
                return null;
        } catch (e) {
            return null;
        }
    }

    async update(query) {
        try {
            if (query) {
                return await sequelize.query(query, { type: Sequelize.QueryTypes.UPDATE });
            }
            else
                return null;
        } catch (e) {
            return null;
        }
    }

    async delete(query) {
        try {
            if (query) {
                return await sequelize.query(query, { type: Sequelize.QueryTypes.DELETE });
            }
            else
                return null;
        } catch (e) {
            return null;
        }
    }
}

module.exports = new DbOperation;