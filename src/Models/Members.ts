import {BIGINT, CHAR, INTEGER, Sequelize} from "sequelize";

export const model = (sequelize:Sequelize) => {
    sequelize.define("members", {
        userId: {
            type: CHAR(40),
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
        },
        lastMessageAt: {
            type: BIGINT,
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