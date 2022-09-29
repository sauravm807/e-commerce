"use strict";

module.exports = function (sequelize, DataTypes) {
  return sequelize.define("users", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER(),
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      // validate: {
      //     is: /^[0-9a-f]{64}$/i
      //   }
    },
    fullName: {
      type: DataTypes.STRING
    },
    firstName: {
      type: DataTypes.STRING
    },
    lastName: {
      type: DataTypes.STRING
    },
    phoneNo: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.STRING
    },
    wrongPassCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  });
};

