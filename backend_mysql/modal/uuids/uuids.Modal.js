"use strict;"
const {sequelize,Sequelize} = require("../../connection/sql.connection");
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// db.users = require(".././modal/user/User.modal") (sequelize, Sequelize);

    const UuidSchema = sequelize.define("Uuid", {
        userId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        // references : {
        //     model : 'users',
        //     key : 'id'

        // }
      },
      uuid: {
        type : Sequelize.STRING,
        // uuid_id: Sequelize.STRING,
        // token: Sequelize.STRING,
        allowNull: false,
        // createdAt: true
    }
    },
    {
        timestamps: false
      
    });
module.exports = UuidSchema;
