import {CHAR, INTEGER, Sequelize, STRING} from "sequelize";

export const model = (sequelize: Sequelize) => {
   sequelize.define("raffles", {
      name: {
         type: STRING,
         allowNull: false
      },
      starterUserId: {
         type: CHAR(30),
         allowNull: false
      },
      messageId: {
         type: CHAR(50),
         allowNull: false
      },
      runEvery: {
         type: INTEGER,
         allowNull: false
      }
   }, {
      timestamps: false,
      indexes: [

      ]
   })
}