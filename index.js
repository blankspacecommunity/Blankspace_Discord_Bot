import { BotClient } from './src/utils/BotClient.js';
import { Logger } from './src/utils/logger.js';

async function main() {
    try {
        Logger.info('Starting Discord bot...');
        
        const client = new BotClient();
        await client.initialize();
        
        Logger.success('Bot initialized successfully!');
        
    } catch (error) {
        Logger.error(`Failed to start bot: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
    Logger.info('Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    Logger.info('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception:', error);
    process.exit(1);
});

main();
