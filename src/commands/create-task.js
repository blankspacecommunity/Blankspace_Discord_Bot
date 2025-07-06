import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { XPManager } from '../utils/xpManager.js';
import { config } from '../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('create-task')
        .setDescription('Create a new task for the community')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Title of the task')
                .setRequired(true)
                .setMaxLength(100))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Detailed description of the task')
                .setRequired(true)
                .setMaxLength(1000))
        .addIntegerOption(option =>
            option.setName('xp_reward')
                .setDescription('XP reward for completing the task')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(1000))
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

        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const xpReward = interaction.options.getInteger('xp_reward');

        try {
            // Create task in database
            const result = await XPManager.createTask(
                title,
                description,
                xpReward,
                interaction.user.id,
                interaction.guild.id
            );

            const taskId = result.lastInsertRowid;

            // Create task embed
            const taskEmbed = new EmbedBuilder()
                .setTitle('📝 New Task Available!')
                .setColor(0x00ff00)
                .addFields(
                    { name: '📋 Task', value: title, inline: false },
                    { name: '📖 Description', value: description, inline: false },
                    { name: '💰 XP Reward', value: XPManager.formatXP(xpReward), inline: true },
                    { name: '👤 Created by', value: `<@${interaction.user.id}>`, inline: true },
                    { name: '🆔 Task ID', value: taskId.toString(), inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Submit your completed task in #task-submissions' });

            // Create submit button
            const submitButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`submit_task_${taskId}`)
                        .setLabel('Submit Task')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('📤')
                );

            // Post to tasks channel if configured
            const tasksChannelId = config.xpSystem.channels.tasks;
            if (tasksChannelId) {
                const tasksChannel = interaction.guild.channels.cache.get(tasksChannelId);
                if (tasksChannel) {
                    await tasksChannel.send({ 
                        embeds: [taskEmbed], 
                        components: [submitButton] 
                    });
                    
                    await interaction.reply({
                        content: `✅ Task created successfully and posted in <#${tasksChannelId}>!`,
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: '✅ Task created successfully, but tasks channel not found. Please configure TASKS_CHANNEL_ID.',
                        embeds: [taskEmbed],
                        ephemeral: true
                    });
                }
            } else {
                await interaction.reply({
                    content: '✅ Task created successfully! Here\'s a preview:',
                    embeds: [taskEmbed],
                    components: [submitButton]
                });
            }

        } catch (error) {
            console.error('Error creating task:', error);
            await interaction.reply({
                content: `❌ Error creating task: ${error.message}`,
                ephemeral: true
            });
        }
    }
};
