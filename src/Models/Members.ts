import {INTEGER, Sequelize, TEXT} from "sequelize";

export const model = (sequelize:Sequelize) => {
    sequelize.define("members", {
        userId: {
            type: TEXT
        },
        exp: {
            type: INTEGER
        },
        messageCount: {
            type: INTEGER
        }
    }, {timestamps: false})
}