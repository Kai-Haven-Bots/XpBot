import {CHAR, Sequelize, TEXT} from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define("settings", {
        key: {
            type: CHAR(40),
            allowNull: false
        },
        value: {
            type: TEXT,
            allowNull: false
        }
    }, {
        timestamps: false,
        indexes: [
            {
                fields: ['key'],
                unique: true
            }
        ]
    })
}