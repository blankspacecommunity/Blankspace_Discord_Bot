import { Events, ActivityType } from 'discord.js';

const event = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
        console.log(`📊 Connected to ${client.guilds.cache.size} servers`);
        console.log(`👥 Serving ${client.users.cache.size} users`);
        
        // Set bot activity/status
        client.user.setActivity({
            name: '/ping | Node.js Bot',
            type: ActivityType.Playing,
        });
        
        // Log some additional info
        console.log(`🚀 Bot started at ${new Date().toLocaleString()}`);
        console.log(`📝 Loaded ${client.commands.size} commands`);
    },
};

export default event;
