import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { XPManager } from '../utils/xpManager.js';
import { config } from '../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Verify a user\'s task submission and award XP')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to verify')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('xp')
                .setDescription('Amount of XP to award')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(1000))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the XP award')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('submission_id')
                .setDescription('ID of the submission to verify (optional)')
                .setRequired(false))
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

        const targetUser = interaction.options.getUser('user');
        const xpAmount = interaction.options.getInteger('xp');
        const reason = interaction.options.getString('reason');
        const submissionId = interaction.options.getInteger('submission_id');

        try {
            // Award XP
            const result = await XPManager.awardXP(
                targetUser.id,
                interaction.guild.id,
                xpAmount,
                reason,
                interaction.user.id,
                submissionId
            );

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle('✅ XP Awarded!')
                .setColor(0x00ff00)
                .setDescription(`**${targetUser.username}** has been awarded **${XPManager.formatXP(xpAmount)} XP**`)
                .addFields(
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Previous XP', value: XPManager.formatXP(result.oldXP), inline: true },
                    { name: 'New XP', value: XPManager.formatXP(result.newXP), inline: true },
                    { name: 'Level', value: `${XPManager.formatLevel(result.oldLevel)} → ${XPManager.formatLevel(result.newLevel)}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `Verified by ${interaction.user.username}` });

            if (result.levelUp) {
                embed.addFields({
                    name: '🎉 Level Up!',
                    value: `${targetUser.username} has reached ${XPManager.formatLevel(result.newLevel)}!`,
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
                        .setTitle('📋 XP Verification Log')
                        .setColor(0x3498db)
                        .addFields(
                            { name: 'User', value: `<@${targetUser.id}>`, inline: true },
                            { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
                            { name: 'XP Awarded', value: XPManager.formatXP(xpAmount), inline: true },
                            { name: 'Reason', value: reason, inline: false },
                            { name: 'Level Change', value: `${XPManager.formatLevel(result.oldLevel)} → ${XPManager.formatLevel(result.newLevel)}`, inline: true }
                        )
                        .setTimestamp();

                    if (submissionId) {
                        logEmbed.addFields({ name: 'Submission ID', value: submissionId.toString(), inline: true });
                    }

                    await logChannel.send({ embeds: [logEmbed] });
                }
            }

        } catch (error) {
            console.error('Error verifying submission:', error);
            await interaction.reply({
                content: `❌ Error verifying submission: ${error.message}`,
                ephemeral: true
            });
        }
    }
};
