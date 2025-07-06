import { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    StringSelectMenuBuilder,
    ComponentType,
    AttachmentBuilder
} from 'discord.js';
import { XPManager } from '../utils/xpManager.js';
import { config } from '../../config/config.js';
import { RankCardGenerator } from '../utils/rankCardGenerator.js';

export default {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('View the server XP leaderboard with customizable display options')
        .addStringOption(option =>
            option.setName('display')
                .setDescription('How to display the leaderboard')
                .setRequired(false)
                .addChoices(
                    { name: '📊 Standard Embed', value: 'embed' },
                    { name: '🎨 Custom Rank Cards', value: 'cards' },
                    { name: '🖼️ Leaderboard Image', value: 'image' },
                    { name: '👤 Your Rank Card', value: 'personal' }
                ))
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Number of users to show (default: 10, max: 25)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(25))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('View a specific user\'s rank card')
                .setRequired(false)),

    async execute(interaction) {
        const displayType = interaction.options.getString('display') || 'embed';
        const limit = interaction.options.getInteger('limit') || config.xpSystem.leaderboard.maxEntries;
        const targetUser = interaction.options.getUser('user');
        
        await interaction.deferReply();

        try {
            const rankGenerator = new RankCardGenerator();

            // Handle specific user rank card
            if (displayType === 'personal' || targetUser) {
                const user = targetUser || interaction.user;
                await this.handlePersonalRank(interaction, user, rankGenerator);
                return;
            }

            const leaderboard = await XPManager.getLeaderboard(interaction.guild.id, limit);
            
            if (leaderboard.length === 0) {
                return await interaction.editReply({
                    content: '📊 No users found in the leaderboard yet!',
                });
            }

            switch (displayType) {
                case 'cards':
                    await this.handleRankCards(interaction, leaderboard, rankGenerator);
                    break;
                case 'image':
                    await this.handleLeaderboardImage(interaction, leaderboard, rankGenerator);
                    break;
                case 'embed':
                default:
                    await this.handleEmbedDisplay(interaction, leaderboard);
                    break;
            }

        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            await interaction.editReply({
                content: '❌ Error fetching leaderboard data.',
            });
        }
    },

    async handlePersonalRank(interaction, user, rankGenerator) {
        try {
            // Get user's rank
            const fullLeaderboard = await XPManager.getLeaderboard(interaction.guild.id, 1000);
            const userRank = fullLeaderboard.findIndex(u => u.user_id === user.id) + 1;
            
            if (userRank === 0) {
                return await interaction.editReply({
                    content: `${user.id === interaction.user.id ? 'You are' : `${user.displayName} is`} not ranked yet. Complete some tasks to get on the leaderboard!`,
                });
            }

            const userProfile = await XPManager.getUserProfile(user.id, interaction.guild.id);
            
            // Enhance user data with Discord info
            const enhancedUserData = {
                ...userProfile,
                username: user.displayName,
                discriminator: user.discriminator,
                globalName: user.globalName
            };

            // Generate rank card
            const rankCard = await rankGenerator.generateRankCard(
                enhancedUserData,
                user.displayAvatarURL({ extension: 'png', size: 256 }),
                userRank
            );

            // Create enhanced embed
            const personalEmbed = new EmbedBuilder()
                .setTitle(`🎯 ${user.displayName}'s Rank Card`)
                .setColor(0x7289DA)
                .setDescription(`**Rank:** #${userRank} • **Level:** ${userProfile.level} • **XP:** ${XPManager.formatXP(userProfile.xp)}`)
                .setImage('attachment://rank-card.png')
                .setTimestamp()
                .setFooter({ 
                    text: `${interaction.guild.name} • Requested by ${interaction.user.displayName}`,
                    iconURL: interaction.guild.iconURL()
                });

            // Interactive components
            const components = this.createPersonalRankComponents(user, userRank);

            await interaction.editReply({
                embeds: [personalEmbed],
                files: [rankCard],
                components: components
            });

        } catch (error) {
            console.error('Error generating personal rank:', error);
            await interaction.editReply({
                content: '❌ Error generating your rank card.',
            });
        }
    },

    async handleRankCards(interaction, leaderboard, rankGenerator) {
        let currentPage = 0;
        const cardsPerPage = 3;
        const totalPages = Math.ceil(leaderboard.length / cardsPerPage);

        const generateCardsPage = async (page) => {
            const startIndex = page * cardsPerPage;
            const endIndex = Math.min(startIndex + cardsPerPage, leaderboard.length);
            const pageData = leaderboard.slice(startIndex, endIndex);

            const cards = [];
            const embeds = [];

            for (let i = 0; i < pageData.length; i++) {
                const userData = pageData[i];
                const rank = startIndex + i + 1;
                
                try {
                    const discordUser = await interaction.client.users.fetch(userData.user_id);
                    const enhancedUserData = {
                        ...userData,
                        username: discordUser.displayName,
                        discriminator: discordUser.discriminator
                    };

                    const card = await rankGenerator.generateRankCard(
                        enhancedUserData,
                        discordUser.displayAvatarURL({ extension: 'png', size: 256 }),
                        rank
                    );

                    cards.push(card);

                    const cardEmbed = new EmbedBuilder()
                        .setTitle(`🏆 Rank #${rank} - ${discordUser.displayName}`)
                        .setColor(rank === 1 ? 0xFFD700 : rank === 2 ? 0xC0C0C0 : rank === 3 ? 0xCD7F32 : 0x7289DA)
                        .setImage(`attachment://rank-card-${i}.png`)
                        .addFields([
                            { name: '📊 Level', value: userData.level.toString(), inline: true },
                            { name: '⭐ XP', value: XPManager.formatXP(userData.xp), inline: true },
                            { name: '📝 Submissions', value: userData.approved_submissions.toString(), inline: true }
                        ]);

                    // Rename the attachment for multiple cards
                    card.setName(`rank-card-${i}.png`);
                    embeds.push(cardEmbed);
                } catch (error) {
                    console.error(`Error generating card for user ${userData.user_id}:`, error);
                }
            }

            return { embeds, files: cards };
        };

        const { embeds, files } = await generateCardsPage(currentPage);
        const components = this.createPaginationComponents(currentPage, totalPages, 'cards');

        const response = await interaction.editReply({
            content: `📊 **Rank Cards** - Page ${currentPage + 1} of ${totalPages}`,
            embeds: embeds,
            files: files,
            components: components
        });

        // Handle pagination
        if (totalPages > 1) {
            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 300000 // 5 minutes
            });

            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    return buttonInteraction.reply({ content: 'These buttons are not for you!', ephemeral: true });
                }

                const action = buttonInteraction.customId.split('_')[1];
                
                switch (action) {
                    case 'first':
                        currentPage = 0;
                        break;
                    case 'prev':
                        currentPage = Math.max(0, currentPage - 1);
                        break;
                    case 'next':
                        currentPage = Math.min(totalPages - 1, currentPage + 1);
                        break;
                    case 'last':
                        currentPage = totalPages - 1;
                        break;
                }

                const { embeds: newEmbeds, files: newFiles } = await generateCardsPage(currentPage);
                const newComponents = this.createPaginationComponents(currentPage, totalPages, 'cards');

                await buttonInteraction.update({
                    content: `📊 **Rank Cards** - Page ${currentPage + 1} of ${totalPages}`,
                    embeds: newEmbeds,
                    files: newFiles,
                    components: newComponents
                });
            });
        }
    },

    async handleLeaderboardImage(interaction, leaderboard, rankGenerator) {
        try {
            // Enhance leaderboard data with Discord usernames
            const enhancedLeaderboard = [];
            for (const userData of leaderboard) {
                try {
                    const discordUser = await interaction.client.users.fetch(userData.user_id);
                    enhancedLeaderboard.push({
                        ...userData,
                        username: discordUser.displayName
                    });
                } catch (error) {
                    enhancedLeaderboard.push({
                        ...userData,
                        username: 'Unknown User'
                    });
                }
            }

            const leaderboardImage = await rankGenerator.generateLeaderboardCard(
                enhancedLeaderboard,
                interaction.guild.name
            );

            const leaderboardEmbed = new EmbedBuilder()
                .setTitle('🏆 Server XP Leaderboard')
                .setColor(0xFFD700)
                .setDescription(`Top ${leaderboard.length} members by XP`)
                .setImage('attachment://leaderboard.png')
                .setTimestamp()
                .setFooter({ 
                    text: `${interaction.guild.name} • ${leaderboard.length} ranked members`,
                    iconURL: interaction.guild.iconURL()
                });

            const components = this.createLeaderboardComponents();

            await interaction.editReply({
                embeds: [leaderboardEmbed],
                files: [leaderboardImage],
                components: components
            });

        } catch (error) {
            console.error('Error generating leaderboard image:', error);
            await interaction.editReply({
                content: '❌ Error generating leaderboard image.',
            });
        }
    },

    async handleEmbedDisplay(interaction, leaderboard) {
        try {
            const standardEmbed = new EmbedBuilder()
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

            standardEmbed.setDescription(description);

            // Add current user's rank if they're not in the top results
            const currentUserRank = leaderboard.findIndex(user => user.user_id === interaction.user.id) + 1;
            if (currentUserRank === 0) {
                // User not in top results, find their actual rank
                const fullLeaderboard = await XPManager.getLeaderboard(interaction.guild.id, 1000);
                const actualRank = fullLeaderboard.findIndex(user => user.user_id === interaction.user.id) + 1;
                
                if (actualRank > 0) {
                    const userProfile = await XPManager.getUserProfile(interaction.user.id, interaction.guild.id);
                    standardEmbed.addFields({
                        name: '📍 Your Rank',
                        value: `#${actualRank} • ${XPManager.formatLevel(userProfile.level)} • ${XPManager.formatXP(userProfile.xp)} XP`,
                        inline: false
                    });
                }
            }

            // Add interactive components
            const components = this.createEmbedComponents();

            await interaction.editReply({ 
                embeds: [standardEmbed],
                components: components
            });

        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            await interaction.editReply({
                content: '❌ Error fetching leaderboard data.',
            });
        }
    },

    createPersonalRankComponents(user, rank) {
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('refresh_rank')
                    .setLabel('🔄 Refresh')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('view_leaderboard')
                    .setLabel('🏆 View Leaderboard')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('my_submissions')
                    .setLabel('📝 My Submissions')
                    .setStyle(ButtonStyle.Success)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('rank_options')
                    .setPlaceholder('🎯 Choose an action...')
                    .addOptions([
                        {
                            label: '🎨 Custom Rank Card',
                            description: 'Generate a personalized rank card',
                            value: 'personal_card',
                            emoji: '🎨'
                        },
                        {
                            label: '📊 Detailed Stats',
                            description: 'View detailed statistics',
                            value: 'detailed_stats',
                            emoji: '📊'
                        },
                        {
                            label: '🏆 Compare with Others',
                            description: 'Compare your rank with other users',
                            value: 'compare_users',
                            emoji: '⚖️'
                        }
                    ])
            );

        return [row1, row2];
    },

    createPaginationComponents(currentPage, totalPages, type) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`${type}_first`)
                    .setLabel('⏮️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId(`${type}_prev`)
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId(`${type}_page`)
                    .setLabel(`${currentPage + 1}/${totalPages}`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId(`${type}_next`)
                    .setLabel('▶️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === totalPages - 1),
                new ButtonBuilder()
                    .setCustomId(`${type}_last`)
                    .setLabel('⏭️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === totalPages - 1)
            );

        return [row];
    },

    createLeaderboardComponents() {
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('refresh_leaderboard')
                    .setLabel('🔄 Refresh')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('my_rank')
                    .setLabel('👤 My Rank')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('top_contributors')
                    .setLabel('⭐ Top Contributors')
                    .setStyle(ButtonStyle.Success)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('leaderboard_filter')
                    .setPlaceholder('🎯 Filter leaderboard...')
                    .addOptions([
                        {
                            label: '🏆 All Time',
                            description: 'Show all-time leaderboard',
                            value: 'all_time',
                            emoji: '🏆'
                        },
                        {
                            label: '📅 This Month',
                            description: 'Show this month\'s top performers',
                            value: 'monthly',
                            emoji: '📅'
                        },
                        {
                            label: '📈 Most Active',
                            description: 'Show users with most submissions',
                            value: 'most_active',
                            emoji: '📈'
                        },
                        {
                            label: '🎯 Level Range',
                            description: 'Filter by level range',
                            value: 'level_range',
                            emoji: '🎯'
                        }
                    ])
            );

        return [row1, row2];
    },

    createEmbedComponents() {
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('switch_to_cards')
                    .setLabel('🎨 View as Cards')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('switch_to_image')
                    .setLabel('🖼️ View as Image')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('my_rank_card')
                    .setLabel('👤 My Rank Card')
                    .setStyle(ButtonStyle.Success)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('leaderboard_size')
                    .setPlaceholder('📊 Choose leaderboard size...')
                    .addOptions([
                        {
                            label: 'Top 5',
                            description: 'Show top 5 users',
                            value: '5',
                            emoji: '🏆'
                        },
                        {
                            label: 'Top 10',
                            description: 'Show top 10 users',
                            value: '10',
                            emoji: '🥇'
                        },
                        {
                            label: 'Top 15',
                            description: 'Show top 15 users',
                            value: '15',
                            emoji: '📊'
                        },
                        {
                            label: 'Top 25',
                            description: 'Show top 25 users',
                            value: '25',
                            emoji: '📈'
                        }
                    ])
            );

        return [row1, row2];
    }
};
