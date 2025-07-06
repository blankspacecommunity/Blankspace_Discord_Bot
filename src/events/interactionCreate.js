import { Events } from 'discord.js';
import { Logger } from '../utils/logger.js';
import { XPManager } from '../utils/xpManager.js';
import { database } from '../utils/database.js';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config/config.js';

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
                await handleButtonInteraction(interaction);
                
            } else if (interaction.isModalSubmit()) {
                await handleModalInteraction(interaction);
                
            } else if (interaction.isStringSelectMenu()) {
                // Handle rank command components first
                await handleRankComponents(interaction);
                if (interaction.replied || interaction.deferred) return;
                
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

async function handleButtonInteraction(interaction) {
    const customId = interaction.customId;
    
    // Handle rank command components
    await handleRankComponents(interaction);
    if (interaction.replied || interaction.deferred) return;
    
    // Handle dynamic task submission buttons
    if (customId.startsWith('submit_task_')) {
        const button = interaction.client.components.buttons.get('submit_task');
        if (button) {
            Logger.info(`Task submission button clicked: ${customId} by ${interaction.user.tag}`);
            await button.execute(interaction);
            return;
        }
    }
    
    // Handle approve/reject buttons
    if (customId.startsWith('approve_')) {
        const button = interaction.client.components.buttons.get('approve');
        if (button) {
            Logger.info(`Approve button clicked: ${customId} by ${interaction.user.tag}`);
            await button.execute(interaction);
            return;
        }
    }
    
    if (customId.startsWith('reject_')) {
        const button = interaction.client.components.buttons.get('reject');
        if (button) {
            Logger.info(`Reject button clicked: ${customId} by ${interaction.user.tag}`);
            await button.execute(interaction);
            return;
        }
    }
    
    // Handle submissions page navigation
    if (customId.startsWith('submissions_page_')) {
        const page = parseInt(customId.split('_')[2]);
        const submissionsCommand = interaction.client.commands.get('submissions');
        if (submissionsCommand) {
            // Create a mock interaction for the submissions command
            const mockOptions = {
                getInteger: (name) => name === 'page' ? page : null
            };
            const mockInteraction = { ...interaction, options: mockOptions };
            await submissionsCommand.execute(mockInteraction);
            return;
        }
    }
    
    // Handle tasks page navigation
    if (customId.startsWith('tasks_page_')) {
        const page = parseInt(customId.split('_')[2]);
        const tasksCommand = interaction.client.commands.get('tasks');
        if (tasksCommand) {
            // Create a mock interaction for the tasks command
            const mockOptions = {
                getInteger: (name) => name === 'page' ? page : null
            };
            const mockInteraction = { ...interaction, options: mockOptions };
            await tasksCommand.execute(mockInteraction);
            return;
        }
    }
    
    // Handle submission detail view
    if (customId.startsWith('detail_')) {
        const submissionId = parseInt(customId.split('_')[1]);
        await showSubmissionDetail(interaction, submissionId);
        return;
    }
    
    // Handle static buttons
    const button = interaction.client.components.buttons.get(customId);
    if (button) {
        Logger.info(`Button clicked: ${customId} by ${interaction.user.tag}`);
        await button.execute(interaction);
    } else {
        Logger.warn(`No button matching ${customId} was found.`);
    }
}

async function handleModalInteraction(interaction) {
    const customId = interaction.customId;
    
    // Handle task evidence submission
    if (customId.startsWith('submit_task_evidence_')) {
        const taskId = parseInt(customId.split('_')[3]);
        await handleTaskEvidenceSubmission(interaction, taskId);
        return;
    }
    
    // Handle submission approval
    if (customId.startsWith('approve_submission_')) {
        const submissionId = parseInt(customId.split('_')[2]);
        await handleSubmissionApproval(interaction, submissionId);
        return;
    }
    
    // Handle submission rejection
    if (customId.startsWith('reject_submission_')) {
        const submissionId = parseInt(customId.split('_')[2]);
        await handleSubmissionRejection(interaction, submissionId);
        return;
    }
    
    // Handle static modals
    const modal = interaction.client.components.modals.get(customId);
    if (modal) {
        Logger.info(`Modal submitted: ${customId} by ${interaction.user.tag}`);
        await modal.execute(interaction);
    } else {
        Logger.warn(`No modal matching ${customId} was found.`);
    }
}

async function handleTaskEvidenceSubmission(interaction, taskId) {
    try {
        const evidence = interaction.fields.getTextInputValue('evidence');
        const notes = interaction.fields.getTextInputValue('notes') || '';
        
        const fullEvidence = notes ? `${evidence}\n\nNotes: ${notes}` : evidence;
        
        // Create submission in database
        const result = database.createSubmission(
            interaction.user.id,
            interaction.guild.id,
            taskId,
            fullEvidence,
            interaction.message?.id
        );
        
        const submissionId = result.lastInsertRowid;
        
        // Get task details
        const task = database.getTask(taskId);
        
        const embed = new EmbedBuilder()
            .setTitle('✅ Task Submitted Successfully!')
            .setColor(0x00ff00)
            .addFields(
                { name: '🆔 Submission ID', value: submissionId.toString(), inline: true },
                { name: '📋 Task', value: task?.title || 'Unknown Task', inline: true },
                { name: '💰 Potential Reward', value: XPManager.formatXP(task?.xp_reward || 0), inline: true },
                { name: '📝 Evidence', value: evidence.length > 500 ? evidence.substring(0, 500) + '...' : evidence, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Your submission is now pending moderator review' });
        
        if (notes) {
            embed.addFields({ name: '📄 Additional Notes', value: notes, inline: false });
        }
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
        
        // Post to submissions channel if configured
        const submissionsChannelId = config.xpSystem.channels.submissions;
        if (submissionsChannelId) {
            const submissionsChannel = interaction.guild.channels.cache.get(submissionsChannelId);
            if (submissionsChannel) {
                const publicEmbed = new EmbedBuilder()
                    .setTitle('📤 New Task Submission')
                    .setColor(0xffa500)
                    .addFields(
                        { name: '👤 User', value: `<@${interaction.user.id}>`, inline: true },
                        { name: '🆔 Submission ID', value: submissionId.toString(), inline: true },
                        { name: '📋 Task', value: task?.title || 'Unknown Task', inline: true },
                        { name: '💰 Potential Reward', value: XPManager.formatXP(task?.xp_reward || 0), inline: true },
                        { name: '📝 Evidence', value: evidence.length > 500 ? evidence.substring(0, 500) + '...' : evidence, inline: false }
                    )
                    .setTimestamp();
                
                if (notes) {
                    publicEmbed.addFields({ name: '📄 Additional Notes', value: notes, inline: false });
                }
                
                await submissionsChannel.send({ embeds: [publicEmbed] });
            }
        }
        
    } catch (error) {
        console.error('Error handling task submission:', error);
        await interaction.reply({
            content: `❌ Error submitting task: ${error.message}`,
            ephemeral: true
        });
    }
}

async function handleSubmissionApproval(interaction, submissionId) {
    try {
        const reason = interaction.fields.getTextInputValue('reason');
        const customXPInput = interaction.fields.getTextInputValue('custom_xp');
        const customXP = customXPInput ? parseInt(customXPInput) : null;
        
        if (customXP !== null && (!Number.isInteger(customXP) || customXP < 1 || customXP > 1000)) {
            return await interaction.reply({
                content: '❌ Custom XP must be a number between 1 and 1000.',
                ephemeral: true
            });
        }
        
        const result = await XPManager.verifySubmission(
            submissionId,
            true,
            interaction.user.id,
            reason,
            customXP
        );
        
        const embed = new EmbedBuilder()
            .setTitle('✅ Submission Approved!')
            .setColor(0x00ff00)
            .addFields(
                { name: '🆔 Submission ID', value: submissionId.toString(), inline: true },
                { name: '👤 User', value: `<@${result.submission.user_id}>`, inline: true },
                { name: '💰 XP Awarded', value: XPManager.formatXP(result.submission.xp_awarded), inline: true },
                { name: '📝 Reason', value: reason, inline: false }
            )
            .setTimestamp();
        
        if (result.xpResult?.levelUp) {
            embed.addFields({
                name: '🎉 Level Up!',
                value: `User reached ${XPManager.formatLevel(result.xpResult.newLevel)}!`,
                inline: false
            });
        }
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
        
        // Send notification to user
        try {
            const user = await interaction.client.users.fetch(result.submission.user_id);
            const userEmbed = new EmbedBuilder()
                .setTitle('🎉 Task Approved!')
                .setColor(0x00ff00)
                .setDescription(`Your task submission has been approved!`)
                .addFields(
                    { name: '📋 Task', value: result.submission.task_title || 'Task Submission', inline: false },
                    { name: '💰 XP Earned', value: XPManager.formatXP(result.submission.xp_awarded), inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setTimestamp();
            
            if (result.xpResult?.levelUp) {
                userEmbed.addFields({
                    name: '🎉 Level Up!',
                    value: `Congratulations! You've reached ${XPManager.formatLevel(result.xpResult.newLevel)}!`,
                    inline: false
                });
            }
            
            await user.send({ embeds: [userEmbed] });
        } catch (error) {
            console.error('Could not send DM to user:', error);
        }
        
    } catch (error) {
        console.error('Error approving submission:', error);
        await interaction.reply({
            content: `❌ Error approving submission: ${error.message}`,
            ephemeral: true
        });
    }
}

async function handleSubmissionRejection(interaction, submissionId) {
    try {
        const reason = interaction.fields.getTextInputValue('reason');
        const feedback = interaction.fields.getTextInputValue('feedback') || '';
        
        const fullReason = feedback ? `${reason}\n\nFeedback: ${feedback}` : reason;
        
        const result = await XPManager.verifySubmission(
            submissionId,
            false,
            interaction.user.id,
            fullReason
        );
        
        const embed = new EmbedBuilder()
            .setTitle('❌ Submission Rejected')
            .setColor(0xff0000)
            .addFields(
                { name: '🆔 Submission ID', value: submissionId.toString(), inline: true },
                { name: '👤 User', value: `<@${result.submission.user_id}>`, inline: true },
                { name: '📝 Reason', value: reason, inline: false }
            )
            .setTimestamp();
        
        if (feedback) {
            embed.addFields({ name: '💡 Feedback', value: feedback, inline: false });
        }
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
        
        // Send notification to user
        try {
            const user = await interaction.client.users.fetch(result.submission.user_id);
            const userEmbed = new EmbedBuilder()
                .setTitle('❌ Task Rejected')
                .setColor(0xff0000)
                .setDescription(`Your task submission has been rejected.`)
                .addFields(
                    { name: '📋 Task', value: result.submission.task_title || 'Task Submission', inline: false },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setTimestamp();
            
            if (feedback) {
                userEmbed.addFields({ name: '💡 Feedback for Improvement', value: feedback, inline: false });
            }
            
            await user.send({ embeds: [userEmbed] });
        } catch (error) {
            console.error('Could not send DM to user:', error);
        }
        
    } catch (error) {
        console.error('Error rejecting submission:', error);
        await interaction.reply({
            content: `❌ Error rejecting submission: ${error.message}`,
            ephemeral: true
        });
    }
}

async function showSubmissionDetail(interaction, submissionId) {
    try {
        const submission = database.getSubmission(submissionId);
        
        if (!submission) {
            return await interaction.reply({
                content: '❌ Submission not found.',
                ephemeral: true
            });
        }
        
        const user = await interaction.client.users.fetch(submission.user_id);
        
        const embed = new EmbedBuilder()
            .setTitle(`📋 Submission Details #${submissionId}`)
            .setColor(0x3498db)
            .addFields(
                { name: '👤 User', value: `${user.username} (<@${submission.user_id}>)`, inline: true },
                { name: '📋 Task', value: submission.task_title || 'Manual Submission', inline: true },
                { name: '💰 Potential Reward', value: XPManager.formatXP(submission.task_xp_reward || 0), inline: true },
                { name: '📝 Evidence', value: submission.evidence.length > 1000 ? submission.evidence.substring(0, 1000) + '...' : submission.evidence, inline: false },
                { name: '📅 Submitted', value: `<t:${Math.floor(new Date(submission.created_at).getTime() / 1000)}:F>`, inline: true },
                { name: '📊 Status', value: submission.status, inline: true }
            )
            .setTimestamp();
        
        if (submission.task_description) {
            embed.addFields({ name: '📖 Task Description', value: submission.task_description.length > 500 ? submission.task_description.substring(0, 500) + '...' : submission.task_description, inline: false });
        }
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
        
    } catch (error) {
        console.error('Error showing submission detail:', error);
        await interaction.reply({
            content: '❌ Error fetching submission details.',
            ephemeral: true
        });
    }
}

async function handleRankComponents(interaction) {
    const customId = interaction.customId;
    
    // Handle rank command button interactions
    if (customId === 'refresh_rank') {
        await handleRefreshRank(interaction);
        return;
    }
    
    if (customId === 'view_leaderboard') {
        await handleViewLeaderboard(interaction);
        return;
    }
    
    if (customId === 'my_submissions') {
        await handleMySubmissions(interaction);
        return;
    }
    
    if (customId === 'refresh_leaderboard') {
        await handleRefreshLeaderboard(interaction);
        return;
    }
    
    if (customId === 'my_rank') {
        await handleMyRank(interaction);
        return;
    }
    
    if (customId === 'top_contributors') {
        await handleTopContributors(interaction);
        return;
    }
    
    if (customId === 'switch_to_cards') {
        await handleSwitchToCards(interaction);
        return;
    }
    
    if (customId === 'switch_to_image') {
        await handleSwitchToImage(interaction);
        return;
    }
    
    if (customId === 'my_rank_card') {
        await handleMyRankCard(interaction);
        return;
    }
    
    // Handle rank command select menu interactions
    if (customId === 'rank_options') {
        await handleRankOptions(interaction);
        return;
    }
    
    if (customId === 'leaderboard_filter') {
        await handleLeaderboardFilter(interaction);
        return;
    }
    
    if (customId === 'leaderboard_size') {
        await handleLeaderboardSize(interaction);
        return;
    }
}

async function handleRefreshRank(interaction) {
    try {
        const rankCommand = interaction.client.commands.get('rank');
        if (rankCommand) {
            await rankCommand.execute(interaction);
        }
    } catch (error) {
        console.error('Error refreshing rank:', error);
        await interaction.reply({
            content: '❌ Error refreshing rank data.',
            ephemeral: true
        });
    }
}

async function handleViewLeaderboard(interaction) {
    try {
        const rankCommand = interaction.client.commands.get('rank');
        if (rankCommand) {
            // Create a mock interaction for the rank command with embed display
            const mockOptions = {
                getString: (name) => name === 'display' ? 'embed' : null,
                getInteger: (name) => null,
                getUser: (name) => null
            };
            const mockInteraction = { ...interaction, options: mockOptions };
            await rankCommand.execute(mockInteraction);
        }
    } catch (error) {
        console.error('Error viewing leaderboard:', error);
        await interaction.reply({
            content: '❌ Error viewing leaderboard.',
            ephemeral: true
        });
    }
}

async function handleMySubmissions(interaction) {
    try {
        const mySubmissionsCommand = interaction.client.commands.get('my-submissions');
        if (mySubmissionsCommand) {
            await mySubmissionsCommand.execute(interaction);
        }
    } catch (error) {
        console.error('Error viewing my submissions:', error);
        await interaction.reply({
            content: '❌ Error viewing your submissions.',
            ephemeral: true
        });
    }
}

async function handleRefreshLeaderboard(interaction) {
    try {
        const rankCommand = interaction.client.commands.get('rank');
        if (rankCommand) {
            await rankCommand.execute(interaction);
        }
    } catch (error) {
        console.error('Error refreshing leaderboard:', error);
        await interaction.reply({
            content: '❌ Error refreshing leaderboard.',
            ephemeral: true
        });
    }
}

async function handleMyRank(interaction) {
    try {
        const rankCommand = interaction.client.commands.get('rank');
        if (rankCommand) {
            // Create a mock interaction for the rank command with personal display
            const mockOptions = {
                getString: (name) => name === 'display' ? 'personal' : null,
                getInteger: (name) => null,
                getUser: (name) => null
            };
            const mockInteraction = { ...interaction, options: mockOptions };
            await rankCommand.execute(mockInteraction);
        }
    } catch (error) {
        console.error('Error viewing my rank:', error);
        await interaction.reply({
            content: '❌ Error viewing your rank.',
            ephemeral: true
        });
    }
}

async function handleTopContributors(interaction) {
    try {
        const leaderboardCommand = interaction.client.commands.get('leaderboard');
        if (leaderboardCommand) {
            await leaderboardCommand.execute(interaction);
        } else {
            await interaction.reply({
                content: '🏆 Top Contributors feature coming soon!',
                ephemeral: true
            });
        }
    } catch (error) {
        console.error('Error viewing top contributors:', error);
        await interaction.reply({
            content: '❌ Error viewing top contributors.',
            ephemeral: true
        });
    }
}

async function handleSwitchToCards(interaction) {
    try {
        const rankCommand = interaction.client.commands.get('rank');
        if (rankCommand) {
            // Create a mock interaction for the rank command with cards display
            const mockOptions = {
                getString: (name) => name === 'display' ? 'cards' : null,
                getInteger: (name) => null,
                getUser: (name) => null
            };
            const mockInteraction = { ...interaction, options: mockOptions };
            await rankCommand.execute(mockInteraction);
        }
    } catch (error) {
        console.error('Error switching to cards view:', error);
        await interaction.reply({
            content: '❌ Error switching to cards view.',
            ephemeral: true
        });
    }
}

async function handleSwitchToImage(interaction) {
    try {
        const rankCommand = interaction.client.commands.get('rank');
        if (rankCommand) {
            // Create a mock interaction for the rank command with image display
            const mockOptions = {
                getString: (name) => name === 'display' ? 'image' : null,
                getInteger: (name) => null,
                getUser: (name) => null
            };
            const mockInteraction = { ...interaction, options: mockOptions };
            await rankCommand.execute(mockInteraction);
        }
    } catch (error) {
        console.error('Error switching to image view:', error);
        await interaction.reply({
            content: '❌ Error switching to image view.',
            ephemeral: true
        });
    }
}

async function handleMyRankCard(interaction) {
    try {
        const rankCommand = interaction.client.commands.get('rank');
        if (rankCommand) {
            // Create a mock interaction for the rank command with personal display
            const mockOptions = {
                getString: (name) => name === 'display' ? 'personal' : null,
                getInteger: (name) => null,
                getUser: (name) => null
            };
            const mockInteraction = { ...interaction, options: mockOptions };
            await rankCommand.execute(mockInteraction);
        }
    } catch (error) {
        console.error('Error viewing my rank card:', error);
        await interaction.reply({
            content: '❌ Error viewing your rank card.',
            ephemeral: true
        });
    }
}

async function handleRankOptions(interaction) {
    const selectedValue = interaction.values[0];
    
    try {
        switch (selectedValue) {
            case 'personal_card':
                await handleMyRankCard(interaction);
                break;
            case 'detailed_stats':
                await interaction.reply({
                    content: '📊 Detailed statistics feature coming soon!',
                    ephemeral: true
                });
                break;
            case 'compare_users':
                await interaction.reply({
                    content: '⚖️ User comparison feature coming soon!',
                    ephemeral: true
                });
                break;
            default:
                await interaction.reply({
                    content: '❓ Unknown option selected.',
                    ephemeral: true
                });
        }
    } catch (error) {
        console.error('Error handling rank options:', error);
        await interaction.reply({
            content: '❌ Error processing your selection.',
            ephemeral: true
        });
    }
}

async function handleLeaderboardFilter(interaction) {
    const selectedValue = interaction.values[0];
    
    try {
        switch (selectedValue) {
            case 'all_time':
                await handleRefreshLeaderboard(interaction);
                break;
            case 'monthly':
                await interaction.reply({
                    content: '📅 Monthly leaderboard feature coming soon!',
                    ephemeral: true
                });
                break;
            case 'most_active':
                await interaction.reply({
                    content: '📈 Most active users feature coming soon!',
                    ephemeral: true
                });
                break;
            case 'level_range':
                await interaction.reply({
                    content: '🎯 Level range filter feature coming soon!',
                    ephemeral: true
                });
                break;
            default:
                await interaction.reply({
                    content: '❓ Unknown filter selected.',
                    ephemeral: true
                });
        }
    } catch (error) {
        console.error('Error handling leaderboard filter:', error);
        await interaction.reply({
            content: '❌ Error processing filter selection.',
            ephemeral: true
        });
    }
}

async function handleLeaderboardSize(interaction) {
    const selectedValue = interaction.values[0];
    const limit = parseInt(selectedValue);
    
    try {
        const rankCommand = interaction.client.commands.get('rank');
        if (rankCommand) {
            // Create a mock interaction for the rank command with specified limit
            const mockOptions = {
                getString: (name) => null,
                getInteger: (name) => name === 'limit' ? limit : null,
                getUser: (name) => null
            };
            const mockInteraction = { ...interaction, options: mockOptions };
            await rankCommand.execute(mockInteraction);
        }
    } catch (error) {
        console.error('Error handling leaderboard size:', error);
        await interaction.reply({
            content: '❌ Error processing size selection.',
            ephemeral: true
        });
    }
}