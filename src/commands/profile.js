import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { XPManager } from '../utils/xpManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your or another user\'s XP profile')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to view (leave empty for yourself)')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const isOwnProfile = targetUser.id === interaction.user.id;

        try {
            const profile = await XPManager.getUserProfile(targetUser.id, interaction.guild.id);
            
            if (!profile) {
                return await interaction.reply({
                    content: '❌ Unable to fetch profile data.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const progressBar = XPManager.createProgressBar(profile.progress.progress);
            const nextLevelXP = XPManager.getNextLevelXP(profile.level);

            const embed = new EmbedBuilder()
                .setTitle(`${isOwnProfile ? 'Your' : `${targetUser.username}'s`} Profile`)
                .setColor(0x3498db)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { 
                        name: '📊 Level & XP', 
                        value: `**Level:** ${XPManager.formatLevel(profile.level)}\n**XP:** ${XPManager.formatXP(profile.xp)}`, 
                        inline: true 
                    },
                    { 
                        name: '📈 Progress', 
                        value: nextLevelXP 
                            ? `${progressBar} ${profile.progress.progress}%\n**Next Level:** ${XPManager.formatXP(profile.progress.needed)} XP needed`
                            : '🏆 **MAX LEVEL REACHED!**', 
                        inline: true 
                    },
                    { 
                        name: '📝 Submissions', 
                        value: `**Total:** ${profile.total_submissions}\n**Approved:** ${profile.approved_submissions}`, 
                        inline: true 
                    },
                    { 
                        name: '🎯 Success Rate', 
                        value: profile.total_submissions > 0 
                            ? `${Math.round((profile.approved_submissions / profile.total_submissions) * 100)}%`
                            : 'No submissions yet', 
                        inline: true 
                    },
                    { 
                        name: '💰 Total XP Earned', 
                        value: XPManager.formatXP(profile.total_xp_earned), 
                        inline: true 
                    },
                    { 
                        name: '📅 Member Since', 
                        value: `<t:${Math.floor(new Date(profile.created_at).getTime() / 1000)}:R>`, 
                        inline: true 
                    }
                )
                .setTimestamp()
                .setFooter({ text: `Profile for ${targetUser.username}`, iconURL: targetUser.displayAvatarURL() });

            // Add rank information
            const leaderboard = await XPManager.getLeaderboard(interaction.guild.id, 100);
            const userRank = leaderboard.findIndex(user => user.user_id === targetUser.id) + 1;
            
            if (userRank > 0) {
                embed.addFields({
                    name: '🏆 Server Rank',
                    value: `#${userRank} out of ${leaderboard.length} members`,
                    inline: true
                });
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching profile:', error);
            await interaction.reply({
                content: '❌ Error fetching profile data.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
