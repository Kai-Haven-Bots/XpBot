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
client.login(process.env._TOKEN);