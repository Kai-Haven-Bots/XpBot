import {Sequelize} from "sequelize";
import * as fs from "fs";
import * as path from "path";
import {Client, IntentsBitField} from "discord.js";
import {captureListener} from "./CaptureExperience/Listener";
import {commandsListener} from "./Commands/Listener";
import {raffleCommandListener} from "./Raffle/Commands/Listener";
import {syncRaffles} from "./Raffle/Commands/RaffleCommandOperations";
import {getTasks} from "node-cron";

require("dotenv")
    .config({
        path: path.join(__dirname, ".env")
    })

export const sequelize = new Sequelize("exp","root", process.env._DATABASE_PASS,{
     dialect: "mysql",
     host: "localhost",
    logging: false
})

fs.readdirSync(path.join(__dirname, "Models"))
    .forEach(file => {
        const model = require(path.join(__dirname, "Models", file))
        model.model(sequelize);
    })
sequelize.sync({alter: true}).then(async () => {
    // importLevels()
    await syncRaffles(sequelize);
})

export const client = new Client({
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.GuildMembers]
})

client.once('ready', async () => {
    console.log("ready");
    captureListener(client)
    commandsListener(client)
    raffleCommandListener(client)
})

const importLevels = async () => {
    let players:mee6Player[] = [];
    let i = 102;
    const members = sequelize.model("members");
    let arr: { userId: string; level: number; messages: number; }[] = [];
    do {
        const res = await fetch(`https://mee6.xyz/api/plugins/levels/leaderboard/859736561830592522?page=${i}`, {
            method: 'GET'
        })
        console.log(i)
        i++
        if(res.status === 429) break;
        const data = await res.json();
        players = data.players as mee6Player[];
        players.forEach( (player) => {
            arr.push({
                userId: player.id,
                level: player.level,
                messages: player.message_count
            })
        })
        if(i%30 === 0){
           try{
               await members.bulkCreate(arr)
           }catch (err){
               console.log(err);
           }
            arr = [];
        }
    }while (i < 200);
       await members.bulkCreate(arr)
    console.log(i);
}
const importRanks = async () => {
    const res = await fetch(`https://mee6.xyz/api/plugins/levels/leaderboard/859736561830592522?page=${1}`, {
        method: 'GET'
    })
    const data = await res.json();
    const arr: [] = data.role_rewards;

    const rewards_arr: any[] = [];
    arr.forEach((item: any) => {
        rewards_arr.push({
            level: item.rank,
            roleId: item.role.id
        })
    })

    const rewards = sequelize.model("rewards");
    await rewards.bulkCreate(rewards_arr)
}
client.login(process.env._TOKEN);