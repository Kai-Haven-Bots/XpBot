import {Client, Message} from "discord.js";
import {calculatePoints, FixedSizeMap, increament, locked, rate} from "./ExpOperations";
import {setLastMessageAt} from "../Raffle/RaffleOperations";
import {sequelize} from "../index";

export const givenAt = new FixedSizeMap<string, number>(100);

export const captureListener = async (client: Client) => {
    client.on('messageCreate', async (msg) => {
        try{
            const member = msg.member;
            if(member === null) return;
            if(msg.channel.isDMBased()) return;
            if(msg.author.bot) return;

            if(!givenAt.has(member.id)) givenAt.set(member.id, 0);
            const time = (new Date()).getTime();
            const difference = time - (givenAt.get(member.id) as number);
            if(!(difference > 2_000)) return;
            if(locked.has(member.id)) return;

            givenAt.set(member.id, time)
            addExp(msg).catch(err => {
                console.log(err)
            })
            setLastMessageAt(msg.author.id, sequelize).catch(err => {
            })
        }catch (err){
            console.log(err)
        }
    })
}

const addExp = async (msg: Message) => {
    const member = msg.member;
    if(!member) return;
    let exp = await rate(msg.content);
    await increament(member.id, await calculatePoints( exp, member.roles.cache, member.id), msg.client, msg.guildId as string)

}