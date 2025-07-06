import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';
import { EmbedUtils } from '../utils/embedUtils.js';
import { config } from '../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency and performance metrics!')
        .addBooleanOption(option =>
            option.setName('detailed')
                .setDescription('Show detailed performance metrics')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('components')
                .setDescription('Show interactive components (buttons and menus)')
                .setRequired(false)),
    
    async execute(interaction) {
        const showDetailed = interaction.options.getBoolean('detailed') || false;
        const showComponents = interaction.options.getBoolean('components') || false;
        
        const sent = await interaction.reply({ 
            content: '🏓 Pinging...', 
            fetchReply: true 
        });
        
        const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = interaction.client.ws.ping;
        
        // Determine latency status
        const getLatencyStatus = (latency) => {
            if (latency < 100) return { status: '🟢 Excellent', color: '#00ff00' };
            if (latency < 200) return { status: '🟡 Good', color: '#ffff00' };
            if (latency < 300) return { status: '🟠 Fair', color: '#ffa500' };
            return { status: '🔴 Poor', color: '#ff0000' };
        };

        const botStatus = getLatencyStatus(botLatency);
        const apiStatus = getLatencyStatus(apiLatency);

        let embed;
        
        if (showDetailed) {
            // Detailed performance metrics
            const uptime = this.formatUptime(process.uptime());
            const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
            const memoryTotal = Math.round(process.memoryUsage().heapTotal / 1024 / 1024);
            const guilds = interaction.client.guilds.cache.size;
            const users = interaction.client.users.cache.size;
            const channels = interaction.client.channels.cache.size;

            embed = new EmbedBuilder()
                .setTitle('🏓 Pong! - Detailed Performance Report')
                .setColor(botLatency < 150 ? '#00ff00' : botLatency < 300 ? '#ffff00' : '#ff0000')
                .setDescription('Comprehensive bot performance metrics and status information')
                .addFields(
                    { 
                        name: '📡 Latency Metrics', 
                        value: `**Bot Response:** ${botLatency}ms ${botStatus.status}\n**API Ping:** ${apiLatency}ms ${apiStatus.status}\n**Average:** ${Math.round((botLatency + apiLatency) / 2)}ms`, 
                        inline: true 
                    },
                    { 
                        name: '📊 System Info', 
                        value: `**Uptime:** ${uptime}\n**Memory:** ${memoryUsage}MB / ${memoryTotal}MB\n**Node.js:** ${process.version}`, 
                        inline: true 
                    },
                    { 
                        name: '🌐 Discord Stats', 
                        value: `**Servers:** ${guilds}\n**Users:** ${users}\n**Channels:** ${channels}`, 
                        inline: true 
                    },
                    { 
                        name: '⚡ Performance Rating', 
                        value: this.getPerformanceRating(botLatency, memoryUsage), 
                        inline: false 
                    }
                )
                .setTimestamp()
                .setFooter({ 
                    text: `Requested by ${interaction.user.displayName} • Bot Status: Online`,
                    iconURL: interaction.user.displayAvatarURL()
                });
        } else {
            // Simple ping response
            embed = new EmbedBuilder()
                .setTitle('🏓 Pong!')
                .setColor(botLatency < 150 ? '#00ff00' : botLatency < 300 ? '#ffff00' : '#ff0000')
                .setDescription('Bot latency and status check')
                .addFields(
                    { name: '🤖 Bot Latency', value: `${botLatency}ms ${botStatus.status}`, inline: true },
                    { name: '📡 API Latency', value: `${apiLatency}ms ${apiStatus.status}`, inline: true },
                    { name: '⏱️ Uptime', value: this.formatUptime(process.uptime()), inline: true }
                )
                .setTimestamp()
                .setFooter({ 
                    text: `Use /ping detailed:true for more info`,
                    iconURL: interaction.client.user.displayAvatarURL()
                });
        }

        let components = [];

        if (showComponents) {
            // Create enhanced buttons
            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ping_again')
                        .setLabel('🔄 Ping Again')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('ping_detailed')
                        .setLabel('📊 Detailed Stats')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(config.components.buttons.showModal)
                        .setLabel('📝 Show Modal')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(config.components.buttons.cancel)
                        .setLabel('❌ Cancel')
                        .setStyle(ButtonStyle.Danger)
                );

            // Create enhanced select menu
            const selectMenu = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(config.components.selectMenus.test)
                        .setPlaceholder('🎛️ Choose a quick action...')
                        .addOptions([
                            {
                                label: '📊 System Status',
                                description: 'Check detailed system information',
                                value: 'system_status',
                                emoji: '📊'
                            },
                            {
                                label: '🔍 Performance Test',
                                description: 'Run a comprehensive performance test',
                                value: 'performance_test',
                                emoji: '🔍'
                            },
                            {
                                label: '🌐 Network Check',
                                description: 'Test network connectivity and speed',
                                value: 'network_check',
                                emoji: '🌐'
                            },
                            {
                                label: '💾 Memory Usage',
                                description: 'View current memory consumption',
                                value: 'memory_usage',
                                emoji: '💾'
                            },
                            {
                                label: '📈 Bot Statistics',
                                description: 'Show comprehensive bot statistics',
                                value: 'bot_stats',
                                emoji: '📈'
                            }
                        ])
                );

            components = [buttons, selectMenu];
        }

        await interaction.editReply({
            content: null,
            embeds: [embed],
            components: components
        });
    },

    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    },

    getPerformanceRating(latency, memoryUsage) {
        let score = 100;
        
        // Deduct points for high latency
        if (latency > 300) score -= 40;
        else if (latency > 200) score -= 20;
        else if (latency > 100) score -= 10;
        
        // Deduct points for high memory usage
        if (memoryUsage > 500) score -= 30;
        else if (memoryUsage > 300) score -= 15;
        else if (memoryUsage > 150) score -= 5;
        
        if (score >= 90) return '🏆 Excellent (A+)';
        if (score >= 80) return '🥇 Very Good (A)';
        if (score >= 70) return '🥈 Good (B)';
        if (score >= 60) return '🥉 Fair (C)';
        return '⚠️ Needs Improvement (D)';
    }
};