import { REST, Routes } from 'discord.js';
import { config } from './config/config.js';
import { Logger } from './src/utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CommandManager {
    constructor() {
        this.rest = new REST({ version: '10' }).setToken(config.token);
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async question(query) {
        return new Promise((resolve) => {
            this.rl.question(query, resolve);
        });
    }

    close() {
        this.rl.close();
    }

    async getRegisteredCommands() {
        if (config.guildId) {
            return await this.rest.get(
                Routes.applicationGuildCommands(config.clientId, config.guildId)
            );
        } else {
            return await this.rest.get(
                Routes.applicationCommands(config.clientId)
            );
        }
    }

    async getLocalCommands() {
        const commandsPath = path.join(__dirname, 'src', 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        const commands = [];

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const fileUrl = pathToFileURL(filePath).href;
            
            try {
                const command = await import(fileUrl);
                commands.push({
                    name: command.default.data.name,
                    description: command.default.data.description,
                    file: file
                });
            } catch (error) {
                Logger.error(`Error loading command ${file}: ${error.message}`);
            }
        }

        return commands;
    }

    async listCommands() {
        try {
            Logger.info('📋 Fetching command information...\n');
            
            const [registeredCommands, localCommands] = await Promise.all([
                this.getRegisteredCommands(),
                this.getLocalCommands()
            ]);

            Logger.info(`🌐 Registered Commands (${registeredCommands.length}):`);
            registeredCommands.forEach((cmd, index) => {
                const localExists = localCommands.find(local => local.name === cmd.name);
                const status = localExists ? '✅' : '❌ (No local file)';
                console.log(`  ${index + 1}. ${cmd.name} - ${cmd.description} ${status}`);
            });

            console.log('');
            Logger.info(`📁 Local Command Files (${localCommands.length}):`);
            localCommands.forEach((cmd, index) => {
                const registeredExists = registeredCommands.find(reg => reg.name === cmd.name);
                const status = registeredExists ? '✅' : '❌ (Not registered)';
                console.log(`  ${index + 1}. ${cmd.name} - ${cmd.description} ${status}`);
            });

            // Find orphaned commands
            const orphanedRegistered = registeredCommands.filter(reg => 
                !localCommands.find(local => local.name === reg.name)
            );
            
            const orphanedLocal = localCommands.filter(local => 
                !registeredCommands.find(reg => reg.name === local.name)
            );

            if (orphanedRegistered.length > 0) {
                console.log('');
                Logger.warn(`⚠️  Registered but no local file (${orphanedRegistered.length}):`);
                orphanedRegistered.forEach(cmd => {
                    console.log(`  - ${cmd.name}`);
                });
            }

            if (orphanedLocal.length > 0) {
                console.log('');
                Logger.warn(`⚠️  Local file but not registered (${orphanedLocal.length}):`);
                orphanedLocal.forEach(cmd => {
                    console.log(`  - ${cmd.name} (${cmd.file})`);
                });
            }

            return { registeredCommands, localCommands, orphanedRegistered, orphanedLocal };

        } catch (error) {
            Logger.error(`Error listing commands: ${error.message}`);
            throw error;
        }
    }

    async cleanupCommands(autoConfirm = false) {
        try {
            const { orphanedRegistered } = await this.listCommands();
            
            if (orphanedRegistered.length === 0) {
                Logger.success('✅ No cleanup needed. All registered commands have local files.');
                return;
            }

            if (!autoConfirm) {
                console.log('');
                const answer = await this.question(`🗑️  Delete ${orphanedRegistered.length} orphaned commands? (y/N): `);
                if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                    Logger.info('❌ Cleanup cancelled.');
                    return;
                }
            }

            Logger.info('🧹 Starting cleanup...');
            let deletedCount = 0;

            for (const command of orphanedRegistered) {
                try {
                    if (config.guildId) {
                        await this.rest.delete(
                            Routes.applicationGuildCommand(config.clientId, config.guildId, command.id)
                        );
                    } else {
                        await this.rest.delete(
                            Routes.applicationCommand(config.clientId, command.id)
                        );
                    }
                    
                    Logger.success(`✅ Deleted: ${command.name}`);
                    deletedCount++;
                    
                    // Rate limit protection
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                } catch (error) {
                    Logger.error(`❌ Failed to delete ${command.name}: ${error.message}`);
                }
            }

            Logger.success(`🎉 Cleanup complete! Deleted ${deletedCount} commands.`);

        } catch (error) {
            Logger.error(`Error during cleanup: ${error.message}`);
            throw error;
        }
    }

    async deleteSpecificCommands(commandNames, autoConfirm = false) {
        try {
            const registeredCommands = await this.getRegisteredCommands();
            const commandsToDelete = registeredCommands.filter(cmd => 
                commandNames.includes(cmd.name)
            );

            const notFound = commandNames.filter(name => 
                !registeredCommands.find(cmd => cmd.name === name)
            );

            if (notFound.length > 0) {
                Logger.warn(`⚠️  Commands not found: ${notFound.join(', ')}`);
            }

            if (commandsToDelete.length === 0) {
                Logger.error('❌ No matching commands found to delete.');
                return;
            }

            Logger.info(`Found ${commandsToDelete.length} commands to delete:`);
            commandsToDelete.forEach(cmd => {
                console.log(`  - ${cmd.name}: ${cmd.description}`);
            });

            if (!autoConfirm) {
                console.log('');
                const answer = await this.question('🗑️  Proceed with deletion? (y/N): ');
                if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                    Logger.info('❌ Deletion cancelled.');
                    return;
                }
            }

            let deletedCount = 0;
            for (const command of commandsToDelete) {
                try {
                    if (config.guildId) {
                        await this.rest.delete(
                            Routes.applicationGuildCommand(config.clientId, config.guildId, command.id)
                        );
                    } else {
                        await this.rest.delete(
                            Routes.applicationCommand(config.clientId, command.id)
                        );
                    }
                    
                    Logger.success(`✅ Deleted: ${command.name}`);
                    deletedCount++;
                    
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                } catch (error) {
                    Logger.error(`❌ Failed to delete ${command.name}: ${error.message}`);
                }
            }

            Logger.success(`🎉 Successfully deleted ${deletedCount} commands.`);

        } catch (error) {
            Logger.error(`Error deleting commands: ${error.message}`);
            throw error;
        }
    }

    async registerCommands() {
        try {
            Logger.info('📤 Loading and registering commands...');
            
            const localCommands = await this.getLocalCommands();
            const commandsPath = path.join(__dirname, 'src', 'commands');
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

            const commands = [];
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const fileUrl = pathToFileURL(filePath).href;
                
                try {
                    const command = await import(fileUrl);
                    commands.push(command.default.data.toJSON());
                    Logger.info(`📝 Loaded: ${command.default.data.name}`);
                } catch (error) {
                    Logger.error(`❌ Error loading ${file}: ${error.message}`);
                }
            }

            if (config.guildId) {
                await this.rest.put(
                    Routes.applicationGuildCommands(config.clientId, config.guildId),
                    { body: commands }
                );
                Logger.success(`✅ Registered ${commands.length} guild commands.`);
            } else {
                await this.rest.put(
                    Routes.applicationCommands(config.clientId),
                    { body: commands }
                );
                Logger.success(`✅ Registered ${commands.length} global commands.`);
            }

        } catch (error) {
            Logger.error(`Error registering commands: ${error.message}`);
            throw error;
        }
    }
}

async function main() {
    const manager = new CommandManager();
    const args = process.argv.slice(2);
    
    try {
        if (args.includes('--help') || args.includes('-h')) {
            showHelp();
            return;
        }

        if (args.includes('--list') || args.includes('-l')) {
            await manager.listCommands();
        } else if (args.includes('--cleanup') || args.includes('-c')) {
            const autoConfirm = args.includes('--confirm') || args.includes('-y');
            await manager.cleanupCommands(autoConfirm);
        } else if (args.includes('--register') || args.includes('-r')) {
            await manager.registerCommands();
        } else if (args.includes('--delete') || args.includes('-d')) {
            const autoConfirm = args.includes('--confirm') || args.includes('-y');
            const commandNames = args.filter(arg => !arg.startsWith('-'));
            
            if (commandNames.length === 0) {
                Logger.error('❌ No command names provided for deletion.');
                showHelp();
                return;
            }
            
            await manager.deleteSpecificCommands(commandNames, autoConfirm);
        } else {
            Logger.info('ℹ️  Use --help to see available options.');
            await manager.listCommands();
        }

    } catch (error) {
        Logger.error(`Fatal error: ${error.message}`);
        console.error(error);
        process.exit(1);
    } finally {
        manager.close();
    }
}

function showHelp() {
    console.log(`
🛠️  Discord Bot Command Management Utility

Usage: node command-manager.js [options] [command-names...]

Options:
  --list, -l                 List all registered and local commands
  --cleanup, -c              Remove registered commands without local files
  --register, -r             Register/update all local commands
  --delete, -d [names...]    Delete specific commands by name
  --confirm, -y              Auto-confirm actions (skip prompts)
  --help, -h                 Show this help message

Examples:
  node command-manager.js --list                    # List all commands
  node command-manager.js --cleanup                 # Interactive cleanup
  node command-manager.js --cleanup --confirm       # Auto cleanup
  node command-manager.js --register                # Register all commands
  node command-manager.js --delete leaderboard      # Delete specific command
  node command-manager.js --delete cmd1 cmd2 -y     # Delete multiple commands

⚠️  Warning: Deletion operations are permanent!
`);
}

main();
