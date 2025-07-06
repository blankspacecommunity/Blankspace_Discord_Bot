import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { config } from '../../../config/config.js';

export default {
    customId: 'reject',
    
    async execute(interaction) {
        // Check if user has moderator role
        const moderatorRoleId = config.xpSystem.roles.moderator;
        if (moderatorRoleId && !interaction.member.roles.cache.has(moderatorRoleId)) {
            return await interaction.reply({
                content: '❌ You do not have permission to reject submissions.',
                ephemeral: true
            });
        }

        // Extract submission ID from button customId (format: reject_123)
        const submissionId = interaction.customId.split('_')[1];
        
        if (!submissionId) {
            return await interaction.reply({
                content: '❌ Error: Invalid submission ID.',
                ephemeral: true
            });
        }

        const modal = new ModalBuilder()
            .setCustomId(`reject_submission_${submissionId}`)
            .setTitle('Reject Submission');

        const reasonInput = new TextInputBuilder()
            .setCustomId('reason')
            .setLabel('Rejection Reason')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Please provide a clear reason for rejection...')
            .setMinLength(10)
            .setMaxLength(500)
            .setRequired(true);

        const feedbackInput = new TextInputBuilder()
            .setCustomId('feedback')
            .setLabel('Improvement Suggestions (Optional)')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Provide constructive feedback for improvement...')
            .setMaxLength(500)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
        const secondActionRow = new ActionRowBuilder().addComponents(feedbackInput);

        modal.addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(modal);
    }
};
