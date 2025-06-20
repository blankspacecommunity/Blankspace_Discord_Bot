import { Events } from 'discord.js';

const event = {
    name: Events.GuildDelete,
    async execute(guild) {
        console.log(`❌ Left guild: ${guild.name} (ID: ${guild.id})`);
        console.log(`👥 Guild had ${guild.memberCount} members`);
    },
};

export default event;
