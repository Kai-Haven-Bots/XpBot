import {Sequelize} from "sequelize";

const retrieveInfo = async (userId: string, sequelize: Sequelize) => {
   const members = sequelize.model("members");
   let member = await members.findOne({
       where: {
           userId: userId
       }
   })
   if(member === null){
       member = await members.create({
           userId: userId
       })
   }

}