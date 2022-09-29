"use strict";

module.exports = function (sequelize, Sequelize) {
    return sequelize.define("uuid", {
        userId: {
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
        createdAt: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        },
        updatedAt: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        }
    });
};