import {CHAR, INTEGER, Sequelize} from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define("messages", {
        userId: {
            type: CHAR(30),
            allowNull: false
        },
        lastMessageAt: {
            type: INTEGER,
            defaultValue: 0
        }
    }, {timestamps: false, indexes: [
            {fields: ['userId']}
        ]})
}