import { config } from '../../../config/config.js';

export default {
    customId: config.components.buttons.cancel,
    
    async execute(interaction) {
        // Disable all components in the original message
        const disabledComponents = interaction.message.components.map(row => {
            const newRow = { ...row };
            newRow.components = row.components.map(component => {
                return { ...component, disabled: true };
            });
            return newRow;
        });

        await interaction.update({
            components: disabledComponents
        });

        await interaction.followUp({
            content: 'Cancelled.',
            ephemeral: true
        });
    }
};