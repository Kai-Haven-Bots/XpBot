import {INTEGER, Sequelize, TEXT} from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define("rewards", {
        roleId: {
            type: TEXT
        },
        level: {
            type: INTEGER
        }
    }, {timestamps: false})
}