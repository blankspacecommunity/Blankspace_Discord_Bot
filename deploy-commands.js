import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { pathToFileURL, fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];

// Load all command files
const commandsPath = join(__dirname, 'src', 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => 
    file.endsWith('.js') && file !== 'index.js'
);

console.log('📝 Loading commands for deployment...');

for (const file of commandFiles) {
    const filePath = pathToFileURL(join(commandsPath, file)).href;
    try {
        const command = await import(filePath);
        if (command.default && command.default.data) {
            commands.push(command.default.data.toJSON());
            console.log(`✅ Loaded: ${command.default.data.name}`);
        }
    } catch (error) {
        console.error(`❌ Error loading ${file}:`, error);
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
    try {
        console.log(`🚀 Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
})();
