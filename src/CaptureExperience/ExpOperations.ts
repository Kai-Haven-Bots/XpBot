import {client, sequelize} from "../index";
import {Client, Collection, Role} from "discord.js";
import {setLastMessageAt} from "../Raffle/RaffleOperations";

export const locked = new Map<string, boolean>();

export const increament = async (userId: string, amount: number) => {
    try {
        await sequelize.transaction(async t => {
            //adding lock so no other process can make change on our user
            locked.set(userId, true);

            const members = sequelize.model("members");
            //retrieving the member from database
            const [member, created] = await members.findOrCreate({
                where: {userId: userId}
            })
            //getting their initial stats
            let level = created ? 1 : member.get("level") as number;
            let exp = created ? 0 : member.get("exp") as number;

            //variables to find out later what to increment
            const initialExp = exp;
            const initialLevel = level;

            //calculating their required stats to level up
            let requiredExp = requiredPoints(level + 1);
            let currentExp = exp + amount;


            while (currentExp >= requiredExp) {
                level++;
                //we deduct the current exp since we added +1 level for that much exp
                currentExp -= requiredExp;
                //getting the next level requirement
                requiredExp = requiredPoints(level + 1)

                //giving them level rewards
                giveReward(userId, level)
            }

            //calculating how much to increment
            const incrementExp = currentExp - initialExp;
            const incrementLevel = level - initialLevel;

            await member.increment('exp', {by: incrementExp, transaction: t});
            await member.increment('level', {by: incrementLevel, transaction: t});

            setLastMessageAt(userId, sequelize)

            //removing lock
            locked.delete(userId);

        })
    } catch (err) {
        console.log(err);
    }
}


const giveReward = async (userId: string, level: number) => {
    const rewards = sequelize.model("rewards");
    const reward = await rewards.findOne({where: {level}});
    if (reward) {
        let guild = await client.guilds.fetch("859736561830592522");
        guild.members.fetch(userId).then(user => {
            user.roles.add(reward.get("roleId") as string);
        }).catch(err => {
            console.log(err)
        });
    }
}
export const calculatePoints = async (rating: number, roles: Collection<string, Role>, userId: string): Promise<number> => {
    let multiplyBy = 0;
    let basePoint = 1;
    let extraPoint = 0;

    let cached = calculateCache.get(userId);
    if (cached && calculateCacheValidator(cached)) {
        multiplyBy = cached?.multiplier;
        basePoint = cached.base;
        extraPoint = cached.extra;
    } else {
        const multipliers = sequelize.model("multipliers")
        for (const role of roles) {
            const multiplier = await multipliers.findOne({
                where: {
                    roleId: role[0]
                }
            })
            if (multiplier !== null) {
                const roleMultiplyBy = multiplier.get("multiplier") as number
                const roleBase = multiplier.get("base") as number;
                const roleExtra = multiplier.get("extra") as number;

                if (roleBase > basePoint) basePoint = roleBase;
                if (roleExtra > extraPoint) extraPoint = roleExtra;
                if (roleMultiplyBy > multiplyBy) multiplyBy = roleMultiplyBy;
            }
        }
        if (multiplyBy < 1) multiplyBy = 1;
        calculateCache.set(userId, {
            expire: (new Date().getTime()) + 60_000,
            multiplier: multiplyBy,
            extra: extraPoint,
            base: basePoint
        })
    }


    let points;
    points = (rating * multiplyBy) + extraPoint
    if (basePoint > points) points = basePoint;
    return points;
}

export const rate = async (message: string): Promise<number> => {
    const returnData = {wordCount: 0, emojiCount: 0, whWordCount: 0, mentionCount: 0};
    message = message.toLowerCase();
    const args = message.split(" ");
    args.forEach((word) => {
        if (word.includes("<") || word.includes("#") || word.includes("@"))
            returnData.mentionCount += 1;
        if (word.startsWith("wh") || word.startsWith("ho") || word.endsWith("?"))
            returnData.whWordCount += 1;
        if (word.includes(":") || containsEmoji(word))
            returnData.emojiCount += 1;
    });
    if (args.length !== 0)
        returnData.wordCount = args.length / 10;
    if (returnData.wordCount > 3)
        returnData.wordCount = 3;
    if (returnData.emojiCount > 0)
        returnData.emojiCount = 2;
    if (returnData.whWordCount > 2)
        returnData.whWordCount = 4;
    if (returnData.mentionCount > 0)
        returnData.mentionCount = 1;
    const eqr = returnData.wordCount + returnData.emojiCount + returnData.whWordCount + returnData.mentionCount;
    let points = 0;
    if (eqr <= 4) {
        points = 1;
    } else if (eqr <= 6.9) {
        points = 3;
    } else if (eqr >= 7) {
        points = 5;
    }
    return points;
};
const containsEmoji = (word: string) => {
    // This regular expression will match any Unicode emoji character
    const emojiRegex = /[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff]/g;
    // Test the word against the regular expression
    return emojiRegex.test(word);
};

export const requiredPoints = (level: number): number => {
    let result;
    if (level > 10) {
        result = 1000
    } else {
        result = (level - 1) * 100
    }
    return result;
}

export class FixedSizeMap<K, V> {
    private readonly maxSize: number;
    private map: Map<K, V>;
    private keys: K[];

    constructor(maxSize: number) {
        this.maxSize = maxSize;
        this.map = new Map();
        this.keys = [];
    }

    set(key: K, value: V): void {
        if (this.keys.length >= this.maxSize) {
            this.removeOldest();
        }
        if (!this.map.has(key)) {
            this.keys.push(key);
        }
        this.map.set(key, value);
    }

    get(key: K): V | undefined {
        return this.map.get(key);
    }

    has(key: K): boolean {
        return this.map.has(key);
    }

    private removeOldest(): void {
        const oldestKey = this.keys.shift();
        this.map.delete(oldestKey as K);
    }
}

export const calculateCache = new FixedSizeMap<string, bonuses>(100);
const calculateCacheValidator = (cache: bonuses): boolean => {
    return (cache.expire > new Date().getTime())
}