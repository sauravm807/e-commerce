"use strict";

module.exports = function (sequelize, Sequelize) {
    return sequelize.define("chat", {
        id: {
            type: Sequelize.INTEGER(11),
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false
        },
        user1: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'

            }
        },
        user2: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'

            }
        }
    }, {
        indexes: [
            {
                unique: true,
                fields: ['user1', 'user2']
            }
        ],
        createdAt: false,
        updatedAt: false
    });
};