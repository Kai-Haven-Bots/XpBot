import {Sequelize} from "sequelize";
import * as fs from "fs";
import * as path from "path";
import {Client, EmbedBuilder, IntentsBitField, Role, TextBasedChannel} from "discord.js";
import {captureListener} from "./CaptureExperience/Listener";
import {commandsListener} from "./Commands/Listener";
import {logger} from "sequelize/types/utils/logger";

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
sequelize.sync({alter: true})

export const client = new Client({
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.GuildMembers]
})

client.once('ready', async () => {
    console.log("ready");
    captureListener(client)
    commandsListener(client)
})

client.on('messageCreate', (msg) => {
    if(!msg.content.startsWith("!rank")) return;
})

client.login(process.env._TOKEN);