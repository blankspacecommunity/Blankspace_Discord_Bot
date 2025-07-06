import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { config } from '../../../config/config.js';

export default {
    customId: config.components.buttons.showModal,
    
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId(config.components.modals.test)
            .setTitle('Test Modal');

        const textInput = new TextInputBuilder()
            .setCustomId('text_input')
            .setLabel('Enter some text')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Type something here...')
            .setRequired(true)
            .setMaxLength(100);

        const firstActionRow = new ActionRowBuilder().addComponents(textInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
    }
};