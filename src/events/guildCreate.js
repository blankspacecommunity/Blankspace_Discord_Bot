import { Events } from 'discord.js';

const event = {
    name: Events.GuildCreate,
    async execute(guild) {
        console.log(`✅ Joined new guild: ${guild.name} (ID: ${guild.id})`);
        console.log(`👥 Guild has ${guild.memberCount} members`);
        
        // You can add welcome logic here, like sending a message to the system channel
        try {
            const systemChannel = guild.systemChannel;
            if (systemChannel && systemChannel.permissionsFor(guild.members.me).has(['SendMessages'])) {
                await systemChannel.send(
                    '👋 Hello! Thanks for adding me to your server!\n' +
                    'Use `/ping` to test if I\'m working and `/info` to see what I can do!'
                );
            }
        } catch (error) {
            console.error('❌ Could not send welcome message:', error);
        }
    },
};

export default event;
