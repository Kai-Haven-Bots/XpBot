import {Sequelize, TEXT} from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define("settings", {
        key: {
            type: TEXT,
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