import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { XPManager } from '../utils/xpManager.js';
import { database } from '../utils/database.js';
import { config } from '../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('Manage user XP (Admin only)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add XP to a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to give XP to')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount of XP to add')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(1000))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for XP award')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove XP from a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to remove XP from')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount of XP to remove')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(1000))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for XP removal')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set a user\'s XP to a specific amount')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to set XP for')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('XP amount to set')
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(100000))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for XP adjustment')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Reset a user\'s XP to 0')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to reset XP for')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for XP reset')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Check if user has moderator role
        const moderatorRoleId = config.xpSystem.roles.moderator;
        if (moderatorRoleId && !interaction.member.roles.cache.has(moderatorRoleId) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({
                content: '❌ You do not have permission to use this command.',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        try {
            let result;
            let actionDescription;

            switch (subcommand) {
                case 'add': {
                    const amount = interaction.options.getInteger('amount');
                    result = await XPManager.awardXP(
                        targetUser.id,
                        interaction.guild.id,
                        amount,
                        reason,
                        interaction.user.id
                    );
                    actionDescription = `Added ${XPManager.formatXP(amount)} XP`;
                    break;
                }

                case 'remove': {
                    const amount = interaction.options.getInteger('amount');
                    result = await XPManager.awardXP(
                        targetUser.id,
                        interaction.guild.id,
                        -amount,
                        reason,
                        interaction.user.id
                    );
                    actionDescription = `Removed ${XPManager.formatXP(amount)} XP`;
                    break;
                }

                case 'set': {
                    const amount = interaction.options.getInteger('amount');
                    const currentProfile = await XPManager.getUserProfile(targetUser.id, interaction.guild.id);
                    const difference = amount - currentProfile.xp;
                    
                    result = await XPManager.awardXP(
                        targetUser.id,
                        interaction.guild.id,
                        difference,
                        reason,
                        interaction.user.id
                    );
                    actionDescription = `Set XP to ${XPManager.formatXP(amount)}`;
                    break;
                }

                case 'reset': {
                    const currentProfile = await XPManager.getUserProfile(targetUser.id, interaction.guild.id);
                    const difference = -currentProfile.xp;
                    
                    result = await XPManager.awardXP(
                        targetUser.id,
                        interaction.guild.id,
                        difference,
                        reason,
                        interaction.user.id
                    );
                    actionDescription = 'Reset XP to 0';
                    break;
                }
            }

            const embed = new EmbedBuilder()
                .setTitle('⚙️ XP Management')
                .setColor(0x3498db)
                .addFields(
                    { name: '👤 User', value: `<@${targetUser.id}>`, inline: true },
                    { name: '🔧 Action', value: actionDescription, inline: true },
                    { name: '📝 Reason', value: reason, inline: false },
                    { name: '📊 XP Change', value: `${XPManager.formatXP(result.oldXP)} → ${XPManager.formatXP(result.newXP)}`, inline: true },
                    { name: '🎚️ Level Change', value: `${XPManager.formatLevel(result.oldLevel)} → ${XPManager.formatLevel(result.newLevel)}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `Action by ${interaction.user.username}` });

            if (result.levelUp) {
                embed.addFields({
                    name: '🎉 Level Up!',
                    value: `${targetUser.username} reached ${XPManager.formatLevel(result.newLevel)}!`,
                    inline: false
                });
            } else if (result.newLevel < result.oldLevel) {
                embed.addFields({
                    name: '📉 Level Down',
                    value: `${targetUser.username} dropped to ${XPManager.formatLevel(result.newLevel)}`,
                    inline: false
                });
            }

            await interaction.reply({ embeds: [embed] });

            // Log to verification logs channel if configured
            const logChannelId = config.xpSystem.channels.verificationLogs;
            if (logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('📋 XP Management Log')
                        .setColor(0x3498db)
                        .addFields(
                            { name: 'User', value: `<@${targetUser.id}>`, inline: true },
                            { name: 'Admin', value: `<@${interaction.user.id}>`, inline: true },
                            { name: 'Action', value: actionDescription, inline: true },
                            { name: 'Reason', value: reason, inline: false },
                            { name: 'XP Change', value: `${XPManager.formatXP(result.oldXP)} → ${XPManager.formatXP(result.newXP)}`, inline: true },
                            { name: 'Level Change', value: `${XPManager.formatLevel(result.oldLevel)} → ${XPManager.formatLevel(result.newLevel)}`, inline: true }
                        )
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed] });
                }
            }

        } catch (error) {
            console.error('Error managing XP:', error);
            await interaction.reply({
                content: `❌ Error managing XP: ${error.message}`,
                ephemeral: true
            });
        }
    }
};
