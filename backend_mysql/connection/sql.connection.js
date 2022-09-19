"use strict";
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB,process.env.DB_USERNAME,
	process.env.DB_PASSWORD, {
	host: process.env.DB_HOST,
	dialect: process.env.DB_DIALECT,
	operationsAliases: false,
	pool: {
	max: 10,
	min: 5,
	acquire: process.env.DB_POOL_ACQUIRE,
	idle: process.env.DB_POOL_IDLE
	}
});

/* for db synced the schema */
sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

module.exports = {sequelize,Sequelize};