import {CHAR, INTEGER, Sequelize, TEXT} from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define("multipliers", {
        roleId: {
            type: CHAR(40),
            allowNull: false
        },
        multiplier: {
            type: INTEGER,
            defaultValue: 1
        },
        base: {
            type: INTEGER,
            defaultValue: 1
        },
        extra: {
            type: INTEGER,
            defaultValue: 0
        }
    }, {
        timestamps: false,
        indexes: [
            {
                fields: ['roleId'],
                unique: true
            }
        ]

    })
}