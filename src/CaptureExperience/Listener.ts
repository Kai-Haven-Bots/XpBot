import {Client, Message} from "discord.js";
import {calculatePoints, FixedSizeMap, increament, rate} from "./ExpOperations";

export const givenAt = new FixedSizeMap<string, number>(100);

export const listen = async (client: Client) => {
    client.on('messageCreate', async (msg) => {
        const member = msg.member;
        if(member === null) return;

        if(!givenAt.has(member.id)) givenAt.set(member.id, 0);
        const time = (new Date()).getTime();
        const difference = time - (givenAt.get(member.id) as number);
        if(!(difference > 1_000)) return;

        givenAt.set(member.id, time)
         addExp(msg)
    })
}

const addExp = async (msg: Message) => {
    const member = msg.member;
    if(!member) return;
    let exp = await rate(msg.content);
    increament(member.id, await calculatePoints( exp, member.roles.cache, member.id))
}