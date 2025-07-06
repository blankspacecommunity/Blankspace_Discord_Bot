import { REST, Routes } from 'discord.js';
import { config } from './config/config.js';
import { Logger } from './src/utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function unregisterCommands() {
    try {
        Logger.info('Starting command cleanup process...');

        const rest = new REST({ version: '10' }).setToken(config.token);

        // Get currently registered commands from Discord
        let registeredCommands;
        if (config.guildId) {
            registeredCommands = await rest.get(
                Routes.applicationGuildCommands(config.clientId, config.guildId)
            );
            Logger.info(`Found ${registeredCommands.length} registered guild commands.`);
        } else {
            registeredCommands = await rest.get(
                Routes.applicationCommands(config.clientId)
            );
            Logger.info(`Found ${registeredCommands.length} registered global commands.`);
        }

        // Get current local command files
        const commandsPath = path.join(__dirname, 'src', 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        const localCommandNames = commandFiles.map(file => path.basename(file, '.js'));

        Logger.info(`Found ${localCommandNames.length} local command files: ${localCommandNames.join(', ')}`);

        // Find commands that are registered but no longer exist locally
        const commandsToDelete = registeredCommands.filter(cmd => 
            !localCommandNames.includes(cmd.name)
        );

        if (commandsToDelete.length === 0) {
            Logger.success('✅ No unused commands found. All registered commands have corresponding files.');
            return;
        }

        Logger.info(`Found ${commandsToDelete.length} unused commands to delete:`);
        commandsToDelete.forEach(cmd => {
            Logger.info(`  - ${cmd.name} (ID: ${cmd.id})`);
        });

        // Ask for confirmation (in a real scenario, you might want to make this interactive)
        const shouldDelete = process.argv.includes('--confirm') || process.argv.includes('-y');
        
        if (!shouldDelete) {
            Logger.warn('⚠️  Add --confirm or -y flag to actually delete the commands.');
            Logger.info('Commands that would be deleted:');
            commandsToDelete.forEach(cmd => {
                Logger.info(`  - ${cmd.name}`);
            });
            return;
        }

        // Delete unused commands
        let deletedCount = 0;
        for (const command of commandsToDelete) {
            try {
                if (config.guildId) {
                    await rest.delete(
                        Routes.applicationGuildCommand(config.clientId, config.guildId, command.id)
                    );
                } else {
                    await rest.delete(
                        Routes.applicationCommand(config.clientId, command.id)
                    );
                }
                
                Logger.success(`✅ Deleted command: ${command.name}`);
                deletedCount++;
                
                // Add a small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                Logger.error(`❌ Failed to delete command ${command.name}: ${error.message}`);
            }
        }

        Logger.success(`🎉 Successfully deleted ${deletedCount} unused commands.`);

        // Optionally, list all remaining commands
        if (process.argv.includes('--list-remaining')) {
            const remainingCommands = registeredCommands.filter(cmd => 
                localCommandNames.includes(cmd.name)
            );
            
            Logger.info('\n📋 Remaining registered commands:');
            remainingCommands.forEach(cmd => {
                Logger.info(`  - ${cmd.name}: ${cmd.description}`);
            });
        }

    } catch (error) {
        Logger.error(`Error during command cleanup: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

// Handle command line options
function showHelp() {
    console.log(`
🛠️  Discord Bot Command Cleanup Utility

Usage: node unregister-commands.js [options]

Options:
  --confirm, -y           Actually delete the unused commands (required for deletion)
  --list-remaining        Show remaining commands after cleanup
  --help, -h             Show this help message

Examples:
  node unregister-commands.js                    # Dry run - shows what would be deleted
  node unregister-commands.js --confirm          # Actually delete unused commands
  node unregister-commands.js -y --list-remaining # Delete and show remaining commands

⚠️  Warning: This will permanently delete commands that don't have corresponding files!
`);
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showHelp();
    process.exit(0);
}

// Run the cleanup
unregisterCommands();
