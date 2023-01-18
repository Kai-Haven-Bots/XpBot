import {Sequelize} from "sequelize";
import cron, {getTasks, schedule} from 'node-cron';
import {convertToCronFormat, pickWinner} from "../RaffleOperations";
import {client, sequelize} from "../../index";
import {EmbedBuilder, Guild, GuildChannel, GuildTextBasedChannel, User} from "discord.js";

export const createRaffle = async (name: string, starterUserId: string, channelId: string, messageId: string, every: "weekly" | "daily", sequelize: Sequelize) => {
   const raffles = sequelize.model("raffles") ;
   let raffle = await raffles.findOne({
       where: {
           name: name,
           messageId: messageId
       }
   })
    if(raffle === null){
        const r = await raffles.create({
            name: name,
            starterUserId: starterUserId,
            channelId: channelId,
            messageId: messageId,
            every: every
        })
        scheduleRaffles(name, starterUserId, channelId, messageId, every);
    }
}

export const syncRaffles = async (sequelize: Sequelize) => {
    const all = await sequelize.model("raffles").findAll();
    all.forEach(model => {
        const name = model.get("name") as string
        const starterUserId = model.get("starterUserId") as string
        const messageId = model.get("messageId") as string
        const every = model.get("every") as "weekly" | "daily"
        const channelId = model.get("channelId") as string

        getTasks().get(name)?.stop();
        scheduleRaffles(name, starterUserId, channelId, messageId, every);
    })
}

const scheduleRaffles = (name: string, starterUserId: string, channelId: string, messageId: string, every: "weekly" | "daily") => {
    schedule(convertToCronFormat(every), async () => {
        try{
            await raffleOperation(name, starterUserId, channelId, messageId)
        }catch (err){
            console.log(err)
        }
    }, {name: name})
}

export const deleteRaffle = async (name: string, sequelize: Sequelize) => {
    try{
        getTasks().get(name)?.stop();
        await sequelize.model("raffles").destroy({
            where: {
                name: name
            }
        })
    }catch (err) {
        console.log(err)
    }
}

export const raffleOperation  = async (name: string, starterUserId: string, channelId: string, messageId: string) => {
    let winner = (await pickWinner(sequelize))?.get("userId") as string;

    let winnerUser: User = await client.users.fetch(winner);
    do {
        winnerUser = await client.users.fetch(winner);
    }while (winnerUser.bot)

    const embed = new EmbedBuilder()
        .setTitle("Congratulations to the winner! 🎉🎊")
        .setDescription(`**We are thrilled to announce that the <@${winner}> have won the raffle. We hope you enjoy your prize! :gift:**`)
    let channel = await client.channels.fetch(channelId) as GuildTextBasedChannel;
    const msg = await channel.messages.fetch(messageId);

    let thread ;
    if(msg.hasThread){
        thread = msg.thread
    }else{
        thread = await msg.startThread({
            name: `${name} winner!`
        })
    }
    thread?.send({embeds: [embed], content: `<@${winner}>`})

    const staff = await client.users.fetch(starterUserId);
    const staffDm  = await staff.createDM()
    const notification = new EmbedBuilder()
        .setTitle("Raffle winner! 🥳")
        .setDescription(`**
            user: <@${winner}> 
            raffle: ${name},
            channel: <#${channelId}>,
            message: https://discord.com/channels/${msg.guildId}/${channelId}/${messageId}
        **`)
    await staffDm.send({embeds: [notification]});
    const winLogs = (await client.channels.fetch("1065183875556446258")) as GuildTextBasedChannel;
    await winLogs.send({embeds: [notification]});

    const user = await client.users.fetch(winner as string);
    const userDm = await user.createDM();

    const userBed = new EmbedBuilder()
        .setTitle("Congratulations🎊")
        .setDescription(`**Congratulations on winning the daily raffle! Please contact <@${starterUserId}> or dm any online admin and your prize will be processed within 72 hours! 🎉
To know more please proceed to <#${channelId}> or https://discord.com/channels/${msg.guildId}/${channelId}/${messageId}**`)
        .setColor("#FFFF00");
    userDm.send({
        embeds: [userBed]
    })
}
