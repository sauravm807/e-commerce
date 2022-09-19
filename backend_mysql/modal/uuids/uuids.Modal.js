"use strict;"
const {sequelize,Sequelize} = require("../../connection/sql.connection");
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// db.users = require(".././modal/user/User.modal") (sequelize, Sequelize);

    const UuidSchema = sequelize.define("Uuid", {
        userId: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references : {
            model : 'users',
            key : 'id'

        }
      },
      uuid: {
        type : Sequelize.STRING(255),
        primaryKey: true,
        unique : true,
        // uuid_id: Sequelize.STRING,
        // token: Sequelize.STRING,
        allowNull: false,
        // createdAt: true
    },
    token : {
        type : Sequelize.TEXT('long'),
        allowNull: false,

    },
    },
    {
        timestamps: true
      
    });
module.exports = UuidSchema;
