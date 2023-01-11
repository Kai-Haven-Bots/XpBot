import {INTEGER, Sequelize, TEXT} from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define("multipliers", {
        roleId: {
            type: TEXT
        },
        multiplier: {
            type: INTEGER
        }
    }, {timestamps: false})
}