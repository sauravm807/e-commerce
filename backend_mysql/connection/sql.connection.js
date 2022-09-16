"use strict";
const Sequelize = require('sequelize');
const Sequelize1 = new Sequelize('ecommercedb', 'root',
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
const db = {};

db.Sequelize = Sequelize;
// db.sequelize = sequelize;

// db.tutorials = require("./tutorial.model.js") (sequelize, Sequelize);

module.exports = Sequelize1;