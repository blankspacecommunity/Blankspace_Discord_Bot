import { config } from '../../../config/config.js';

export default {
    customId: config.components.modals.test,
    
    async execute(interaction) {
        const textInput = interaction.fields.getTextInputValue('text_input');
        
        await interaction.reply({
            content: `You submitted: "${textInput}"`,
            ephemeral: true
        });
    }
};