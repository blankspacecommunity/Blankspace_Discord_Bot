import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { database } from '../utils/database.js';
import { XPManager } from '../utils/xpManager.js';
import { config } from '../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('submissions')
        .setDescription('View pending task submissions')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number (default: 1)')
                .setRequired(false)
                .setMinValue(1))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        // Check if user has moderator role
        const moderatorRoleId = config.xpSystem.roles.moderator;
        if (moderatorRoleId && !interaction.member.roles.cache.has(moderatorRoleId)) {
            return await interaction.reply({
                content: '❌ You do not have permission to use this command.',
                ephemeral: true
            });
        }

        const page = interaction.options.getInteger('page') || 1;
        const itemsPerPage = 5;

        try {
            const allSubmissions = database.getPendingSubmissions(interaction.guild.id);
            
            if (allSubmissions.length === 0) {
                return await interaction.reply({
                    content: '📭 No pending submissions found!',
                    ephemeral: true
                });
            }

            const totalPages = Math.ceil(allSubmissions.length / itemsPerPage);
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const submissions = allSubmissions.slice(startIndex, endIndex);

            const embed = new EmbedBuilder()
                .setTitle('📋 Pending Task Submissions')
                .setColor(0xffa500)
                .setDescription(`Page ${page} of ${totalPages} • ${allSubmissions.length} total submissions`)
                .setTimestamp()
                .setFooter({ text: 'Use the buttons below to approve/reject submissions' });

            for (const submission of submissions) {
                let fieldValue = '';
                
                if (submission.task_title) {
                    fieldValue += `**Task:** ${submission.task_title}\n`;
                    fieldValue += `**Reward:** ${XPManager.formatXP(submission.task_xp_reward)} XP\n`;
                } else {
                    fieldValue += `**Manual Submission**\n`;
                }
                
                fieldValue += `**Evidence:** ${submission.evidence}\n`;
                fieldValue += `**Submitted:** <t:${Math.floor(new Date(submission.created_at).getTime() / 1000)}:R>`;

                try {
                    const user = await interaction.client.users.fetch(submission.user_id);
                    embed.addFields({
                        name: `🆔 ${submission.id} • ${user.username}`,
                        value: fieldValue,
                        inline: false
                    });
                } catch (error) {
                    embed.addFields({
                        name: `🆔 ${submission.id} • Unknown User`,
                        value: fieldValue,
                        inline: false
                    });
                }
            }

            // Create navigation and action buttons
            const components = [];
            
            // Action buttons for first submission
            if (submissions.length > 0) {
                const firstSubmission = submissions[0];
                const actionRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`approve_${firstSubmission.id}`)
                            .setLabel(`Approve #${firstSubmission.id}`)
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('✅'),
                        new ButtonBuilder()
                            .setCustomId(`reject_${firstSubmission.id}`)
                            .setLabel(`Reject #${firstSubmission.id}`)
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('❌'),
                        new ButtonBuilder()
                            .setCustomId(`detail_${firstSubmission.id}`)
                            .setLabel('View Details')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('👁️')
                    );
                components.push(actionRow);
            }

            // Navigation buttons
            if (totalPages > 1) {
                const navRow = new ActionRowBuilder();
                
                if (page > 1) {
                    navRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`submissions_page_${page - 1}`)
                            .setLabel('Previous')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('⬅️')
                    );
                }
                
                if (page < totalPages) {
                    navRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`submissions_page_${page + 1}`)
                            .setLabel('Next')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('➡️')
                    );
                }
                
                if (navRow.components.length > 0) {
                    components.push(navRow);
                }
            }

            await interaction.reply({ 
                embeds: [embed], 
                components: components,
                ephemeral: true 
            });

        } catch (error) {
            console.error('Error fetching submissions:', error);
            await interaction.reply({
                content: '❌ Error fetching submission data.',
                ephemeral: true
            });
        }
    }
};
