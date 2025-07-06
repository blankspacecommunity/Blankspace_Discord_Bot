import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export default {
    customId: 'submit_task',
    
    async execute(interaction) {
        // Extract task ID from button customId (format: submit_task_123)
        const taskId = interaction.customId.split('_')[2];
        
        if (!taskId) {
            return await interaction.reply({
                content: '❌ Error: Invalid task ID.',
                ephemeral: true
            });
        }

        const modal = new ModalBuilder()
            .setCustomId(`submit_task_evidence_${taskId}`)
            .setTitle('Submit Task Evidence');

        const evidenceInput = new TextInputBuilder()
            .setCustomId('evidence')
            .setLabel('Evidence of Completion')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Provide links, screenshots, or description of your completed task...')
            .setMinLength(10)
            .setMaxLength(1000)
            .setRequired(true);

        const additionalNotesInput = new TextInputBuilder()
            .setCustomId('notes')
            .setLabel('Additional Notes (Optional)')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Any additional information or context...')
            .setMaxLength(500)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(evidenceInput);
        const secondActionRow = new ActionRowBuilder().addComponents(additionalNotesInput);

        modal.addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(modal);
    }
};
