"use strict";
const Sequelize = require('sequelize');
const sequelize = new Sequelize('ecommercedb', 'root',
'', {
	host: 'localhost',
	dialect: 'mysql',
	operationsAliases: false,
	pool: {
	max: 10,
	min: 5,
	acquire: 30000,
	idle: 10000
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