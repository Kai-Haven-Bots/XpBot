import {Model, Op, Sequelize} from "sequelize";

export async function pickWinner(sequelize: Sequelize): Promise<Model | undefined> {
    try{
        const oneDayInMilliseconds = 86400000;
        const now = Date.now();
        // Find all members in the "members" table
        const members = await sequelize.model("members").findAll({
            where: {
                lastMessageAt: {
                    [Op.gte]: now - oneDayInMilliseconds
                }
            }
        });

        // Create an array to store the entries for each member
        let entries: Model[] = [];

        // Loop through each member and add their level number of entries to the entries array
        members.forEach(member => {
            for (let i = 0; i < (member.get("level") as number); i++) {
                entries.push(member);
            }
        });
        // Use the Math.random() function to randomly select an index from the entries array
        const winnerIndex = Math.floor(Math.random() * entries.length);

        // Return the member at the randomly selected index
        return entries[winnerIndex];
    }catch (err){
        console.log(err);
    }
}

export async function setLastMessageAt(userId: string, sequelize: Sequelize): Promise<void> {
    // Find the member with the matching userId
    try{
        let member = await sequelize.model("members").findOne({
            where: {
                userId: userId
            }
        });
        if (member === null) {
            sequelize.transaction(async t => {
                await sequelize.model("members").create({
                    userId: userId,
                    lastMessageAt: Date.now()
                }, {transaction: t});
            })
            return;
        }
        // Update the member's lastMessageAt attribute with the current time
        await member.update({
            lastMessageAt: Date.now()
        });
    }catch (err){
        console.log("error on raffle operation")
        console.log(err);
    }
}

export function convertToCronFormat(every: "daily" | "weekly"): string {
   switch (every){
       case "daily": return "0 0 * * *";
       case "weekly": return "0 0 * * 6";
   }
}

