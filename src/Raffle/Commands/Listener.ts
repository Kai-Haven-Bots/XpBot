import {Client, EmbedBuilder, PermissionsBitField} from "discord.js";
import {createRaffle, deleteRaffle} from "./RaffleCommandOperations";
import {sequelize} from "../../index";
import {pickWinner} from "../RaffleOperations";

export const raffleCommandListener = async (client: Client) => {
    client.on('messageCreate', async msg => {
        try {
            if (msg.member === null) return;
            if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
            const args = msg.content.split(" ");

            switch (args[0].toLowerCase()) {
                case "!rafflecreate":
                    const name = args[1];
                    const userId = msg.author.id;
                    const msgId = msg.reference?.messageId;
                    const channelId = msg.channelId;
                    const every = args[2].toLowerCase();
                    if (every !== "daily" && every !== "weekly") {
                        msg.react("⛔").catch(err => {
                        });
                        return;
                    }
                    if (!name || !userId || !msgId || !every) {
                        msg.react("⛔").catch(err => {
                        });
                        return;
                    }
                    createRaffle(name, userId, channelId, msgId, every, sequelize)
                        .then(() => {
                            msg.react("✅").catch(err => {
                            });
                        })
                        .catch(err => {
                            console.log(err)
                            msg.react("⛔").catch(err => {
                            });
                        });
                    break;
                case "!raffledraw":
                    let winner = (await pickWinner(sequelize))?.get("userId");
                    const embed = new EmbedBuilder()
                        .setTitle("Congratulations to the winner! 🎉🎊")
                        .setDescription(`**We are thrilled to announce that the <@${winner}> have won the raffle. We hope you enjoy your prize! :gift:**`)
                    await msg.reply({content: `<@${winner}>`, embeds: [embed], allowedMentions: {repliedUser: false}});
                    break;
                case "!raffledelete":
                    const RMName = args[1];
                    if (!RMName) {
                        msg.react("⛔").catch(err => {
                        });
                        return
                    }
                    await deleteRaffle(RMName, sequelize);
                    msg.react("✅").catch(err => {
                    });
            }
        } catch (err) {
            console.log(err);
        }
    })
}