import {INTEGER, Sequelize, TEXT} from "sequelize";

export const model = (sequelize:Sequelize) => {
    sequelize.define("members", {
        userId: {
            type: TEXT,
            allowNull: false
        },
        exp: {
            type: INTEGER,
            defaultValue: 0
        },
        level: {
            type: INTEGER,
            defaultValue: 1
        },
        messages: {
            type: INTEGER,
            defaultValue: 0
        }
    }, {
        timestamps: false,
        indexes: [
            {
                fields: ['userId'],
                unique: true
            }
        ]
    })
}