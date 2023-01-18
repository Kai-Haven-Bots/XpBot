import {Client, EmbedBuilder, PermissionsBitField} from "discord.js";
import {createExpCard, createLeaderboard} from "./CommandOperations";
import {sequelize} from "../index";
import {increament, locked} from "../CaptureExperience/ExpOperations";

export const commandsListener = async (client: Client) => {
    client.on('messageCreate', async (msg) => {
       try{
           const args = msg.content.split(" ");
           const commandName = args[0].toLowerCase();
           switch (commandName){
               case "!rank":
               case "!exp":
                   msg.react("🎯").catch(err => {});
                   if(msg.member === null) return;
                   let levelMember = null;
                   if(args[1] !== undefined){
                       try{
                           levelMember = await msg.guild?.members.fetch(args[1].replace("<", "").replace("@", "").replace(">", ""));
                       }catch (err){
                           console.log(err)
                           levelMember = msg.member;
                       }
                   }else{
                       levelMember = msg.member;
                   }
                   if(locked.has(levelMember?.id as string)) {
                       msg.react("⏰").catch(err => {});
                       msg.react("💤").catch(err => {});
                       msg.react("🌙").catch(err => {});
                       return;
                   }

                   if(levelMember)
                   createExpCard(sequelize, levelMember ).then( card => {
                       const embed = new EmbedBuilder()
                           .setDescription(card)
                       msg.reply({embeds: [embed], allowedMentions: {repliedUser: false}});
                   })
                   break;
               case "!addpoints":
                   msg.react("🎯").catch(err => {});
                   if(!msg.member?.permissions.has(PermissionsBitField.Flags.Administrator)){
                       msg.react("⛔").catch(err => {});
                       return;
                   }
                   const id = args[1].replace("<", "").replace("@", "").replace(">", "").replace("&", "");
                   if(!isNumeric(id)){
                       msg.react("⛔").catch(err => {});
                       return;
                   }

                   if(locked.has(id as string)) {
                       msg.react("⏰").catch(err => {});
                       msg.react("💤").catch(err => {});
                       msg.react("🌙").catch(err => {});
                   }

                   let amount: number;

                   if(!isNumeric(args[2])){
                       msg.react("⛔").catch(err => {});
                       return;
                   }
                   amount = Number(args[2]);

                   if(!id) return;
                   try{
                      await client.users.fetch(id);
                       try{
                           await incrementWithLock(id, amount, client, "859736561830592522");
                           msg.react("✅").catch(err => {});
                       }catch (err){
                           msg.react("⛔").catch(err => {});
                           console.log(err)
                       }
                   }catch (err){
                       try{
                            await msg.guild?.roles.fetch(id)
                           let members = await msg.guild?.members.fetch();
                           if(!members) return;
                           for (const member of members.filter(mem => mem.roles.cache.has(id))) {
                               await incrementWithLock(id, amount, client, "859736561830592522");
                           }
                           msg.react("✅").catch(err => {});
                       }catch (err){
                           msg.react("⛔").catch(err => {});
                           return;
                       }
                   }
                   break;

               case "!levels":
               case "!leaderboard":
                    let pageString = args[1];
                    let page: number;
                    if(!pageString || !isNumeric(pageString)) {
                        page = 1;
                    }else{
                        page = Number(pageString);
                    }
                    msg.reply({embeds: [await createLeaderboard(sequelize, page)], allowedMentions: {repliedUser: false}})
           }
       }catch (err) {
           msg.react("⛔").catch(err => {});
       }
    })
}

function isNumeric(str: string) {
    return /^\d+$/.test(str);
}
async function incrementWithLock(id: string, amount: number, client: Client, guildId: string) {
    while (locked.has(id)) {
        // Wait for the next iteration of the event loop
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    locked.set(id, true);
    await increament(id, amount);
    locked.delete(id);
}
