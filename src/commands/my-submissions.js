import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { database } from '../utils/database.js';
import { XPManager } from '../utils/xpManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('my-submissions')
        .setDescription('View your task submissions and their status')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number (default: 1)')
                .setRequired(false)
                .setMinValue(1))
        .addStringOption(option =>
            option.setName('status')
                .setDescription('Filter by submission status')
                .setRequired(false)
                .addChoices(
                    { name: 'All', value: 'all' },
                    { name: 'Pending', value: 'PENDING' },
                    { name: 'Approved', value: 'APPROVED' },
                    { name: 'Rejected', value: 'REJECTED' }
                )),

    async execute(interaction) {
        const page = interaction.options.getInteger('page') || 1;
        const statusFilter = interaction.options.getString('status') || 'all';
        const itemsPerPage = 5;

        try {
            // Get user's submitted tasks
            let userSubmissions = database.getUserSubmittedTasks(interaction.guild.id, interaction.user.id);
            
            // Apply status filter
            if (statusFilter !== 'all') {
                userSubmissions = userSubmissions.filter(submission => submission.submission_status === statusFilter);
            }
            
            if (userSubmissions.length === 0) {
                const filterText = statusFilter === 'all' ? '' : ` with status "${statusFilter}"`;
                return await interaction.reply({
                    content: `📭 No task submissions found${filterText}!\n\n💡 Use \`/tasks\` to see available tasks you can submit.`,
                    ephemeral: true
                });
            }

            const totalPages = Math.ceil(userSubmissions.length / itemsPerPage);
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const submissions = userSubmissions.slice(startIndex, endIndex);

            // Create status emoji mapping
            const statusEmojis = {
                'PENDING': '⏳',
                'APPROVED': '✅',
                'REJECTED': '❌'
            };

            const statusColors = {
                'PENDING': 0xffa500,
                'APPROVED': 0x00ff00,
                'REJECTED': 0xff0000,
                'all': 0x3498db
            };

            const filterText = statusFilter === 'all' ? 'All Submissions' : `${statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()} Submissions`;
            
            const embed = new EmbedBuilder()
                .setTitle(`📄 Your Task Submissions - ${filterText}`)
                .setColor(statusColors[statusFilter] || statusColors.all)
                .setDescription(`Page ${page} of ${totalPages} • ${userSubmissions.length} total submissions`)
                .setTimestamp()
                .setFooter({ 
                    text: `${interaction.user.displayName}'s Submissions`,
                    iconURL: interaction.user.displayAvatarURL()
                });

            for (const submission of submissions) {
                const statusEmoji = statusEmojis[submission.submission_status] || '❓';
                const submittedTime = Math.floor(new Date(submission.submitted_at).getTime() / 1000);
                
                let fieldValue = '';
                fieldValue += `**Task:** ${submission.title}\n`;
                fieldValue += `**Description:** ${submission.description}\n`;
                fieldValue += `**Reward:** ${XPManager.formatXP(submission.xp_reward)} XP\n`;
                fieldValue += `**Status:** ${statusEmoji} ${submission.submission_status}\n`;
                fieldValue += `**Submitted:** <t:${submittedTime}:R>\n`;
                
                if (submission.submission_status === 'APPROVED') {
                    fieldValue += `**XP Earned:** ${XPManager.formatXP(submission.xp_awarded || submission.xp_reward)} XP ✨\n`;
                } else if (submission.submission_status === 'REJECTED') {
                    fieldValue += `**XP Earned:** 0 XP 💔\n`;
                }

                embed.addFields({
                    name: `🆔 ${submission.submission_id} • ${submission.title}`,
                    value: fieldValue,
                    inline: false
                });
            }

            // Add summary field
            const totalSubmissions = database.getUserSubmittedTasks(interaction.guild.id, interaction.user.id);
            const approvedCount = totalSubmissions.filter(s => s.submission_status === 'APPROVED').length;
            const pendingCount = totalSubmissions.filter(s => s.submission_status === 'PENDING').length;
            const rejectedCount = totalSubmissions.filter(s => s.submission_status === 'REJECTED').length;
            const totalXPEarned = totalSubmissions
                .filter(s => s.submission_status === 'APPROVED')
                .reduce((sum, s) => sum + (s.xp_awarded || s.xp_reward), 0);

            embed.addFields({
                name: '📊 Summary',
                value: `**Total:** ${totalSubmissions.length} | **Approved:** ✅ ${approvedCount} | **Pending:** ⏳ ${pendingCount} | **Rejected:** ❌ ${rejectedCount}\n**Total XP Earned:** ${XPManager.formatXP(totalXPEarned)} XP`,
                inline: false
            });

            // Create navigation buttons
            const components = [];
            if (totalPages > 1) {
                const navRow = new ActionRowBuilder();
                
                if (page > 1) {
                    navRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`my_submissions_${statusFilter}_${page - 1}`)
                            .setLabel('Previous')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('⬅️')
                    );
                }
                
                if (page < totalPages) {
                    navRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`my_submissions_${statusFilter}_${page + 1}`)
                            .setLabel('Next')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('➡️')
                    );
                }
                
                if (navRow.components.length > 0) {
                    components.push(navRow);
                }
            }

            // Add filter buttons
            const filterRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('my_submissions_all_1')
                        .setLabel('All')
                        .setStyle(statusFilter === 'all' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                        .setEmoji('📄'),
                    new ButtonBuilder()
                        .setCustomId('my_submissions_PENDING_1')
                        .setLabel('Pending')
                        .setStyle(statusFilter === 'PENDING' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                        .setEmoji('⏳'),
                    new ButtonBuilder()
                        .setCustomId('my_submissions_APPROVED_1')
                        .setLabel('Approved')
                        .setStyle(statusFilter === 'APPROVED' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                        .setEmoji('✅'),
                    new ButtonBuilder()
                        .setCustomId('my_submissions_REJECTED_1')
                        .setLabel('Rejected')
                        .setStyle(statusFilter === 'REJECTED' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                        .setEmoji('❌')
                );
            
            components.push(filterRow);

            await interaction.reply({ 
                embeds: [embed], 
                components: components,
                ephemeral: true 
            });

        } catch (error) {
            console.error('Error fetching user submissions:', error);
            await interaction.reply({
                content: '❌ Error fetching your submission data.',
                ephemeral: true
            });
        }
    }
};
