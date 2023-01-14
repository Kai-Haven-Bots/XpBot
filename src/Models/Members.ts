import {INTEGER, Sequelize, TEXT} from "sequelize";

export const model = (sequelize:Sequelize) => {
    sequelize.define("members", {
        userId: {
            type: TEXT
        },
        exp: {
            type: INTEGER
        },
        level: {
            type: INTEGER,
            defaultValue: 1
        },
        messages: {
            type: INTEGER
        }
    }, {timestamps: false})
}