type bonuses = { multiplier: number, base: number, extra: number, expire: number};
type h24 = "00" | "01" | "02" |  "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24"
type mee6Player = {
    avatar: string,
    detailed_xp: number[],
    discriminator: string,
    guild_id: string,
    id: string,
    level: number,
    message_count: number,
    username: string,
    xp: number
}