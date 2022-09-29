"use strict";

module.exports = function (sequelize, DataTypes) {
    return sequelize.define("Uuid", {
        userId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'

            }
        },
        uuid: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        token: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
        refreshtoken_expires_time: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
        {
            timestamps: true
        });
};
