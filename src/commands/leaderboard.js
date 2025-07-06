import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { XPManager } from '../utils/xpManager.js';
import { config } from '../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the server XP leaderboard')
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Number of users to show (default: 10, max: 25)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(25)),

    async execute(interaction) {
        const limit = interaction.options.getInteger('limit') || config.xpSystem.leaderboard.maxEntries;

        try {
            const leaderboard = await XPManager.getLeaderboard(interaction.guild.id, limit);
            
            if (leaderboard.length === 0) {
                return await interaction.reply({
                    content: '📊 No users found in the leaderboard yet!',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('🏆 XP Leaderboard')
                .setColor(0xffd700)
                .setDescription(`Top ${leaderboard.length} members by XP`)
                .setTimestamp()
                .setFooter({ text: `${interaction.guild.name} Leaderboard` });

            // Create leaderboard entries
            let description = '';
            const medals = ['🥇', '🥈', '🥉'];
            
            for (let i = 0; i < leaderboard.length; i++) {
                const user = leaderboard[i];
                const rank = i + 1;
                const medal = medals[i] || `**${rank}.**`;
                
                try {
                    const discordUser = await interaction.client.users.fetch(user.user_id);
                    const username = discordUser.username || 'Unknown User';
                    
                    description += `${medal} **${username}**\n`;
                    description += `└ ${XPManager.formatLevel(user.level)} • ${XPManager.formatXP(user.xp)} XP • ${user.approved_submissions} submissions\n\n`;
                } catch (error) {
                    // Handle cases where user might not be found
                    description += `${medal} **Unknown User**\n`;
                    description += `└ ${XPManager.formatLevel(user.level)} • ${XPManager.formatXP(user.xp)} XP • ${user.approved_submissions} submissions\n\n`;
                }
            }

            embed.setDescription(description);

            // Add current user's rank if they're not in the top results
            const currentUserRank = leaderboard.findIndex(user => user.user_id === interaction.user.id) + 1;
            if (currentUserRank === 0) {
                // User not in top results, find their actual rank
                const fullLeaderboard = await XPManager.getLeaderboard(interaction.guild.id, 1000);
                const actualRank = fullLeaderboard.findIndex(user => user.user_id === interaction.user.id) + 1;
                
                if (actualRank > 0) {
                    const userProfile = await XPManager.getUserProfile(interaction.user.id, interaction.guild.id);
                    embed.addFields({
                        name: '📍 Your Rank',
                        value: `#${actualRank} • ${XPManager.formatLevel(userProfile.level)} • ${XPManager.formatXP(userProfile.xp)} XP`,
                        inline: false
                    });
                }
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            await interaction.reply({
                content: '❌ Error fetching leaderboard data.',
                ephemeral: true
            });
        }
    }
};
