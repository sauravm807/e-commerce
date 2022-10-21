"use strict";

module.exports = function (sequelize, Sequelize) {
    return sequelize.define("message", {
        id: {
            type: Sequelize.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
            unique: true,
            allowNull: false
        },
        chat_id: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references: {
                model: 'chats',
                key: 'id'
            }
        },
        sid: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        rid: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'

            }
        },
        c_date: {
            type: Sequelize.INTEGER(11),
            // defaultValue: Sequelize.fn('NOW'),
            allowNull: false
        },
        message: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        is_seen: {
            type: Sequelize.INTEGER(11),
            defaultValue: 0,
            allowNull: false
        },
        delete_for_me: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            defaultValue: 0
        },
        permanently_deleted: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            defaultValue: 0
        }
    }, {
        createdAt: false,
        updatedAt: false
    });
};