"use strict";

module.exports = function (sequelize, Sequelize) {
  return sequelize.define("users", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER(11),
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
    created_at: {
      type: Sequelize.INTEGER(11),
      // defaultValue: Sequelize.fn('NOW'),
      allowNull: false
    },
    updated_at: {
      type: Sequelize.INTEGER(11),
      // defaultValue: Sequelize.fn('NOW'),
      allowNull: false
    }
  }, {
    createdAt: "created_at",
    updatedAt: "updated_at"
  });
};