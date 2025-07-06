import { config } from '../../../config/config.js';

export default {
    customId: config.components.selectMenus.test,
    
    async execute(interaction) {
        const selectedValue = interaction.values[0];
        
        const optionLabels = {
            'option1': 'Option 1',
            'option2': 'Option 2',
            'option3': 'Option 3'
        };
        
        const selectedLabel = optionLabels[selectedValue] || selectedValue;
        
        await interaction.reply({
            content: `You selected: ${selectedLabel}`,
            ephemeral: true
        });
    }
};