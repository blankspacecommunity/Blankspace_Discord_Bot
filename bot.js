import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import dotenv from 'dotenv';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
    ],
});

// Create a collection for commands
client.commands = new Collection();

// Load commands
const loadCommands = async () => {
    const commandsPath = join(__dirname, 'src', 'commands');
    const commandFiles = readdirSync(commandsPath).filter(file => 
        file.endsWith('.js') && file !== 'index.js'
    );

    for (const file of commandFiles) {
        const filePath = pathToFileURL(join(commandsPath, file)).href;
        try {
            const command = await import(filePath);
            if (command.default && command.default.data && command.default.execute) {
                client.commands.set(command.default.data.name, command.default);
                console.log(`✅ Loaded command: ${command.default.data.name}`);
            } else {
                console.log(`⚠️  Command ${file} is missing required properties`);
            }
        } catch (error) {
            console.error(`❌ Error loading command ${file}:`, error);
        }
    }
};

// Load events
const loadEvents = async () => {
    const eventsPath = join(__dirname, 'src', 'events');
    const eventFiles = readdirSync(eventsPath).filter(file => 
        file.endsWith('.js') && file !== 'index.js'
    );

    for (const file of eventFiles) {
        const filePath = pathToFileURL(join(eventsPath, file)).href;
        try {
            const event = await import(filePath);
            if (event.default) {
                if (event.default.once) {
                    client.once(event.default.name, (...args) => event.default.execute(...args));
                } else {
                    client.on(event.default.name, (...args) => event.default.execute(...args));
                }
                console.log(`✅ Loaded event: ${event.default.name}`);
            }
        } catch (error) {
            console.error(`❌ Error loading event ${file}:`, error);
        }
    }
};

// Initialize bot
const init = async () => {
    try {
        console.log('🚀 Starting Discord Bot...');
        
        await loadCommands();
        await loadEvents();
        
        // Login to Discord
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.error('❌ Failed to start bot:', error);
        process.exit(1);
    }
};

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

// Start the bot
init();