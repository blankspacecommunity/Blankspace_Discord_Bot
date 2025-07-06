import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { config } from '../../../config/config.js';

export default {
    customId: 'approve',
    
    async execute(interaction) {
        // Check if user has moderator role
        const moderatorRoleId = config.xpSystem.roles.moderator;
        if (moderatorRoleId && !interaction.member.roles.cache.has(moderatorRoleId)) {
            return await interaction.reply({
                content: '❌ You do not have permission to approve submissions.',
                ephemeral: true
            });
        }

        // Extract submission ID from button customId (format: approve_123)
        const submissionId = interaction.customId.split('_')[1];
        
        if (!submissionId) {
            return await interaction.reply({
                content: '❌ Error: Invalid submission ID.',
                ephemeral: true
            });
        }

        const modal = new ModalBuilder()
            .setCustomId(`approve_submission_${submissionId}`)
            .setTitle('Approve Submission');

        const reasonInput = new TextInputBuilder()
            .setCustomId('reason')
            .setLabel('Approval Reason')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g., "Great portfolio submission!"')
            .setMaxLength(200)
            .setRequired(true);

        const xpInput = new TextInputBuilder()
            .setCustomId('custom_xp')
            .setLabel('Custom XP Amount (Optional)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Leave empty to use task default XP')
            .setMaxLength(4)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
        const secondActionRow = new ActionRowBuilder().addComponents(xpInput);

        modal.addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(modal);
    }
};
