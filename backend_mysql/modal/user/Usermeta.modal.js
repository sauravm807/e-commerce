"use strict";

module.exports = function (sequelize, Sequelize) {
    return sequelize.define("usermeta", {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER(11),
        },
        user_id: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        full_name: {
            type: Sequelize.STRING
        },
        first_name: {
            type: Sequelize.STRING
        },
        last_name: {
            type: Sequelize.STRING
        },
        pro_pic: {
            type: Sequelize.STRING
        },
        phone_no: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        address: {
            type: Sequelize.STRING
        },
        last_login: {
            type: Sequelize.INTEGER(11)
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