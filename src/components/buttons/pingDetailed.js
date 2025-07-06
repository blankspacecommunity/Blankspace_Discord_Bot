import { EmbedBuilder } from 'discord.js';

export default {
    customId: 'ping_detailed',
    async execute(interaction) {
        const botLatency = Date.now() - interaction.createdTimestamp;
        const apiLatency = interaction.client.ws.ping;
        
        const formatUptime = (seconds) => {
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
        };

        const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const memoryTotal = Math.round(process.memoryUsage().heapTotal / 1024 / 1024);
        const guilds = interaction.client.guilds.cache.size;
        const users = interaction.client.users.cache.size;
        const channels = interaction.client.channels.cache.size;
        
        const embed = new EmbedBuilder()
            .setTitle('📊 Detailed Bot Statistics')
            .setColor('#3498db')
            .setDescription('Comprehensive performance and system information')
            .addFields(
                { 
                    name: '📡 Latency & Performance', 
                    value: `**Bot Response:** ${botLatency}ms\n**API Ping:** ${apiLatency}ms\n**Average:** ${Math.round((botLatency + apiLatency) / 2)}ms`, 
                    inline: true 
                },
                { 
                    name: '💾 Memory & System', 
                    value: `**Used:** ${memoryUsage}MB\n**Total:** ${memoryTotal}MB\n**Usage:** ${Math.round((memoryUsage / memoryTotal) * 100)}%`, 
                    inline: true 
                },
                { 
                    name: '🌐 Discord Network', 
                    value: `**Servers:** ${guilds}\n**Users:** ${users}\n**Channels:** ${channels}`, 
                    inline: true 
                },
                { 
                    name: '⚙️ System Information', 
                    value: `**Platform:** ${process.platform}\n**Node.js:** ${process.version}\n**Architecture:** ${process.arch}`, 
                    inline: true 
                },
                { 
                    name: '⏱️ Runtime Information', 
                    value: `**Uptime:** ${formatUptime(process.uptime())}\n**Process ID:** ${process.pid}\n**Started:** <t:${Math.floor((Date.now() - process.uptime() * 1000) / 1000)}:R>`, 
                    inline: true 
                },
                { 
                    name: '📈 Performance Score', 
                    value: this.calculatePerformanceScore(botLatency, apiLatency, memoryUsage), 
                    inline: true 
                }
            )
            .setTimestamp()
            .setFooter({ 
                text: `Detailed stats requested by ${interaction.user.displayName}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.update({ embeds: [embed], components: [] });
    },

    calculatePerformanceScore(botLatency, apiLatency, memoryUsage) {
        let score = 100;
        const avgLatency = (botLatency + apiLatency) / 2;
        
        // Latency scoring
        if (avgLatency > 300) score -= 40;
        else if (avgLatency > 200) score -= 25;
        else if (avgLatency > 100) score -= 15;
        else if (avgLatency > 50) score -= 5;
        
        // Memory scoring
        if (memoryUsage > 500) score -= 30;
        else if (memoryUsage > 300) score -= 20;
        else if (memoryUsage > 150) score -= 10;
        
        const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';
        const emoji = score >= 90 ? '🏆' : score >= 80 ? '🥇' : score >= 70 ? '🥈' : score >= 60 ? '🥉' : '⚠️';
        
        return `${emoji} ${score}/100 (Grade: ${grade})`;
    }
};
