"use strict";

module.exports = function (sequelize, Sequelize) {
    return sequelize.define("uuid", {
        user_id: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'

            }
        },
        uuid: {
            type: Sequelize.STRING(255),
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        token: {
            type: Sequelize.TEXT('long'),
            allowNull: false,
        },
        refreshtoken_expires_time: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        created_at: {
            type: Sequelize.INTEGER(11),
            // defaultValue: Sequelize.fn('NOW'),
            allowNull: false
        }
    }, {
        createdAt: "created_at",
        updatedAt: false
    });
};