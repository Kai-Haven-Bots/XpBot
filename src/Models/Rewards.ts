import {CHAR, INTEGER, Sequelize, TEXT} from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define("rewards", {
        roleId: {
            type: CHAR(40),
            allowNull: false
        },
        level: {
            type: INTEGER,
            allowNull: false
        }
    }, {
        timestamps: false,
        indexes: [
            {
                fields: ['level'],
                unique: true
            }
        ]
    })
}