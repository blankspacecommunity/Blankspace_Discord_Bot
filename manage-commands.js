import { REST, Routes } from 'discord.js';
import { config } from './config/config.js';
import { Logger } from './src/utils/logger.js';

/**
 * Utility to manage and unregister specific Discord slash commands
 * Usage: node manage-commands.js [command1] [command2] ...
 */

async function manageCommands() {
    try {
        const rest = new REST({ version: '10' }).setToken(config.token);
        
        // Get command names to unregister from command line arguments
        const commandsToUnregister = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
        const isConfirm = process.argv.includes('--confirm') || process.argv.includes('-y');
        const listAll = process.argv.includes('--list') || process.argv.includes('-l');
        
        if (process.argv.includes('--help') || process.argv.includes('-h')) {
            showHelp();
            return;
        }

        // Get all registered commands
        let registeredCommands;
        if (config.guildId) {
            registeredCommands = await rest.get(
                Routes.applicationGuildCommands(config.clientId, config.guildId)
            );
        } else {
            registeredCommands = await rest.get(
                Routes.applicationCommands(config.clientId)
            );
        }

        // If --list flag is used, show all commands and exit
        if (listAll) {
            Logger.info(`📋 Currently registered commands (${registeredCommands.length}):`);
            registeredCommands.forEach((cmd, index) => {
                Logger.info(`  ${index + 1}. ${cmd.name} - ${cmd.description}`);
            });
            return;
        }

        // If no commands specified, show help
        if (commandsToUnregister.length === 0) {
            Logger.warn('⚠️  No commands specified to unregister.');
            Logger.info('Use --list to see all registered commands, or specify command names to unregister.');
            Logger.info('Example: node manage-commands.js oldcommand1 oldcommand2 --confirm');
            return;
        }

        // Find commands to delete
        const commandsToDelete = registeredCommands.filter(cmd => 
            commandsToUnregister.includes(cmd.name)
        );

        const notFoundCommands = commandsToUnregister.filter(cmdName => 
            !registeredCommands.some(cmd => cmd.name === cmdName)
        );

        if (notFoundCommands.length > 0) {
            Logger.warn(`⚠️  Commands not found: ${notFoundCommands.join(', ')}`);
        }

        if (commandsToDelete.length === 0) {
            Logger.error('❌ No matching commands found to delete.');
            return;
        }

        Logger.info(`Found ${commandsToDelete.length} commands to delete:`);
        commandsToDelete.forEach(cmd => {
            Logger.info(`  - ${cmd.name}: ${cmd.description}`);
        });

        if (!isConfirm) {
            Logger.warn('⚠️  Add --confirm or -y flag to actually delete these commands.');
            return;
        }

        // Delete specified commands
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
                
                // Add delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                Logger.error(`❌ Failed to delete command ${command.name}: ${error.message}`);
            }
        }

        Logger.success(`🎉 Successfully deleted ${deletedCount} commands.`);

    } catch (error) {
        Logger.error(`Error managing commands: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

function showHelp() {
    console.log(`
🛠️  Discord Bot Command Management Utility

Usage: node manage-commands.js [options] [command1] [command2] ...

Options:
  --list, -l             List all currently registered commands
  --confirm, -y          Actually delete the specified commands (required for deletion)
  --help, -h             Show this help message

Examples:
  node manage-commands.js --list                    # List all registered commands
  node manage-commands.js leaderboard               # Dry run - shows what would be deleted
  node manage-commands.js leaderboard --confirm     # Actually delete the 'leaderboard' command
  node manage-commands.js cmd1 cmd2 cmd3 -y        # Delete multiple commands

⚠️  Warning: This will permanently delete the specified commands!
`);
}

manageCommands();
