import { Events } from 'discord.js';
import { Logger } from '../utils/logger.js';

export default {
    name: Events.ClientReady,
    once: true,
    
    execute(client) {
        Logger.success(`Ready! Logged in as ${client.user.tag}`);
        Logger.info(`Bot is now online and ready to serve ${client.guilds.cache.size} guild(s)`);
    }
};