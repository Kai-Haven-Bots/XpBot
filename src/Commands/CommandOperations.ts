import {Op, Sequelize} from "sequelize";
import {EmbedBuilder, Guild, GuildMember} from "discord.js";
import {increament, requiredPoints} from "../CaptureExperience/ExpOperations";
import {client} from "../index";

export const createExpCard = async ( sequelize: Sequelize, msgMember: GuildMember): Promise<string> => {
    const userId = msgMember.user.id;
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
   const all = await members.findAll({
       order: [['level', 'DESC']],
       where: {
           level: {
               [Op.gte]: member.get("level")
           }
       }
   })
    const rank = all.length;
    let name = msgMember.user.username + "#" + msgMember.user.discriminator ;
    let level =  member.get("level") as number;
    let currentExp = member.get("exp") as number;
    let requiredExp = requiredPoints(level + 1);
    let percentage = (currentExp/requiredExp)*100;

    if(currentExp>=requiredExp){
        console.log({userId, percentage, currentExp, requiredExp});
        return "Try again";
    }

    let count = Math.floor(percentage/10);
    if(count < 0) count = 0;
    let progressBar = "[" + "=".repeat(count) + ">" + " ".repeat(10-count) + "]";

    let template =
        ` ⭐ Rank #${rank} ⭐
 
 ${name} 
 🚀 Level ${level} 🚀

 ${progressBar} ${Math.round(percentage)}% ${currentExp}/${requiredExp} EXP`;

    return "```js\n" + template + "```";

}
export const createLeaderboard = async (sequelize: Sequelize, page: number): Promise<EmbedBuilder> => {
    const members = await sequelize.models.members.findAll({
        order: [['level', 'DESC']],
        limit: 30
    });

    let leaderboard = "";
    leaderboard += " --  Name         Level\n";

    let rank = 1;
    const formatter = "`";
    let rankText = "";

    members.forEach((member) => {
        if(3 >= rank){
          rankText = "1000"  + rank;
        }else{
            rankText = rank + "";
        }
        leaderboard += `${rankText}. <@${member.get("userId")}> ${formatter}${member.get("level")}${formatter}\n`;
        rank++;
    });
    leaderboard = leaderboard.replace("10001.", "🥇").replace("10002.", "🥈").replace("10003.", "🥉");

    const embed = new EmbedBuilder()
        .setTitle("⚔️ Leaderboard ⚔️")
        .setColor('#FFFFFF')
        .setDescription(leaderboard);

    return embed;
};
