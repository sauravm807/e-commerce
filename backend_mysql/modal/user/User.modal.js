"use strict;"
const {sequelize,Sequelize} = require("../../connection/sql.connection");
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// db.users = require(".././modal/user/User.modal") (sequelize, Sequelize);

    const User = sequelize.define("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(),
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        // validate: {
        //     is: /^[0-9a-f]{64}$/i
        //   }
      },
      fullName: {
        type: Sequelize.STRING
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      repeatPassword: {
        type: Sequelize.STRING
      },
      phoneNo: {
        type: Sequelize.INTEGER
      },
      address: {
        type: Sequelize.STRING
      },
      wrongPassCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
    });
module.exports = User;
  
