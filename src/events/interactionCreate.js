import { Events } from 'discord.js';
import { Logger } from '../utils/logger.js';

export default {
    name: Events.InteractionCreate,
    
    async execute(interaction) {
        try {
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);
                
                if (!command) {
                    Logger.warn(`No command matching ${interaction.commandName} was found.`);
                    return;
                }
                
                Logger.info(`Executing command: ${interaction.commandName} by ${interaction.user.tag}`);
                await command.execute(interaction);
                
            } else if (interaction.isButton()) {
                const button = interaction.client.components.buttons.get(interaction.customId);
                
                if (!button) {
                    Logger.warn(`No button matching ${interaction.customId} was found.`);
                    return;
                }
                
                Logger.info(`Button clicked: ${interaction.customId} by ${interaction.user.tag}`);
                await button.execute(interaction);
                
            } else if (interaction.isModalSubmit()) {
                const modal = interaction.client.components.modals.get(interaction.customId);
                
                if (!modal) {
                    Logger.warn(`No modal matching ${interaction.customId} was found.`);
                    return;
                }
                
                Logger.info(`Modal submitted: ${interaction.customId} by ${interaction.user.tag}`);
                await modal.execute(interaction);
                
            } else if (interaction.isStringSelectMenu()) {
                const selectMenu = interaction.client.components.selectMenus.get(interaction.customId);
                
                if (!selectMenu) {
                    Logger.warn(`No select menu matching ${interaction.customId} was found.`);
                    return;
                }
                
                Logger.info(`Select menu used: ${interaction.customId} by ${interaction.user.tag}`);
                await selectMenu.execute(interaction);
            }
            
        } catch (error) {
            Logger.error(`Error executing interaction: ${error.message}`);
            console.error(error);
            
            const errorMessage = {
                content: 'There was an error while executing this interaction!',
                ephemeral: true
            };
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }
};