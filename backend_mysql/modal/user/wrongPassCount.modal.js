"use strict";

module.exports = function (sequelize, Sequelize) {
    return sequelize.define("wrong_password", {
        user_id: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            unique: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        wrong_pass_count: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
};