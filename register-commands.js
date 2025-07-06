import { REST, Routes } from 'discord.js';
import { config } from './config/config.js';
import { Logger } from './src/utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function registerCommands() {
    try {
        Logger.info('Started refreshing application (/) commands.');

        // Load all commands
        const commands = [];
        const commandsPath = path.join(__dirname, 'src', 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const fileUrl = pathToFileURL(filePath).href;
            
            try {
                const command = await import(fileUrl);
                commands.push(command.default.data.toJSON());
                Logger.info(`Loaded command: ${command.default.data.name}`);
            } catch (error) {
                Logger.error(`Error loading command ${file}: ${error.message}`);
            }
        }

        // Register commands with Discord
        const rest = new REST({ version: '10' }).setToken(config.token);

        if (config.guildId) {
            // Register guild-specific commands (faster for testing)
            await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: commands }
            );
            Logger.success(`Successfully reloaded ${commands.length} guild application (/) commands.`);
        } else {
            // Register global commands (takes up to 1 hour to update)
            await rest.put(
                Routes.applicationCommands(config.clientId),
                { body: commands }
            );
            Logger.success(`Successfully reloaded ${commands.length} global application (/) commands.`);
        }

    } catch (error) {
        Logger.error(`Error registering commands: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

registerCommands();
