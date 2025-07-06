import { Events } from 'discord.js';
import { Logger } from '../utils/logger.js';

export default {
    name: Events.Error,
    
    execute(error) {
        Logger.error(`Client error: ${error.message}`);
        console.error(error);
    }
};