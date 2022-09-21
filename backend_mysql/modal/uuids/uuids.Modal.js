"use strict;"
const {sequelize,Sequelize} = require("../../connection/sql.connection");
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

/**
 * UuidModel - UuidSchema
 * @author Sibasish Das <sibasishdas@globussoft.in>
 */

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
        allowNull: false,
    },
    token : {
        type : Sequelize.TEXT('long'),
        allowNull: false,

    },
    refreshtoken_expires_time : {
        type :  Sequelize.INTEGER,
        allowNull: false,

    },
    },
    {
        timestamps: true
      
    });
module.exports = UuidSchema;
