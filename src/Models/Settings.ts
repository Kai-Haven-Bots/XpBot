import {Sequelize, TEXT} from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define("settings", {
        key: {
            type: TEXT
        },
        value: {
            type: TEXT
        }
    }, {timestamps: false})
}