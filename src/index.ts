import {Sequelize} from "sequelize";
import * as fs from "fs";
import * as path from "path";
import {Client, EmbedBuilder, IntentsBitField, Role, TextBasedChannel} from "discord.js";
import {calculatePoints, increament, rate, requiredPoints} from "./CaptureExperience/ExpOperations";
import {listen} from "./CaptureExperience/Listener";

require("dotenv")
    .config({
        path: path.join(__dirname, ".env")
    })

export const sequelize = new Sequelize({
    storage: "xp.db",
    dialect: "sqlite",
    logging: false
})

fs.readdirSync(path.join(__dirname, "Models"))
    .forEach(file => {
        const model = require(path.join(__dirname, "Models", file))
        model.model(sequelize); 
    })
sequelize.sync({alter: true}).then(() => {
    console.log("Models synced")
})

export const client = new Client({
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent]
})

// increament("haha", 100);
client.once('ready', async () => {
    console.log("Ready");
    listen(client)
    const server = await client.guilds.fetch("818373020816637952");
    const channel = (await  server.channels.fetch("961677956399394867")) as TextBasedChannel;
    const embed = new EmbedBuilder()
        .setDescription("```scss\n" +
            "\n" +
            "ㅤRank #5 Level 54;ㅤ\n" +
            "ㅤ[==========>   ]  75%ㅤ\n" +
            "ㅤ20k/32.9k exp \n" +
            "```")

    // channel.send({embeds: [embed]});
})
client.login(process.env._TOKEN).then(() => {
    console.log("Logged in");
})