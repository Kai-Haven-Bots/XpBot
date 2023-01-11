import {Sequelize} from "sequelize";
import * as fs from "fs";
import * as path from "path";
import {Client, EmbedBuilder, IntentsBitField, TextBasedChannel} from "discord.js";

require("dotenv")
    .config({
        path: path.join(__dirname, ".env")
    })

const sequelize = new Sequelize({
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

const client = new Client({
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent]
})






client.once('ready', async () => {
    console.log("Ready");

    const server = await client.guilds.fetch("818373020816637952");
    const channel = (await  server.channels.fetch("961677956399394867")) as TextBasedChannel;
    const embed = new EmbedBuilder()
        .setDescription("```scss\n" +
            "\n" +
            "ㅤRank #5 Level 54;ㅤ\n" +
            "ㅤ[==========>   ]  75%ㅤ\n" +
            "ㅤ20k/32.9k exp \n" +
            "```")
    channel.send({embeds: [embed]});
})

client.login(process.env._TOKEN).then(() => {
    console.log("Logged in");
})