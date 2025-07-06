import { EmbedBuilder } from 'discord.js';

export default {
    customId: 'test_info',
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('ℹ️ Test Command Information')
            .setDescription('Here\'s detailed information about the test command and its capabilities:')
            .addFields(
                { 
                    name: '🎯 Purpose', 
                    value: 'The test command is designed to verify bot functionality and provide system diagnostics.', 
                    inline: false 
                },
                { 
                    name: '🛠️ Available Tests', 
                    value: '• **Basic Test** - General functionality check\n• **System Info** - Bot system information\n• **Random Number** - Random number generation\n• **Bot Status** - Current bot statistics\n• **Color Test** - Embed color testing', 
                    inline: false 
                },
                { 
                    name: '⚙️ Features', 
                    value: '• Interactive buttons\n• Real-time system monitoring\n• Random data generation\n• Colorful embed responses\n• Performance metrics', 
                    inline: false 
                },
                { 
                    name: '📈 Usage Stats', 
                    value: `• Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB\n• Uptime: ${this.formatUptime(process.uptime())}\n• Node.js: ${process.version}`, 
                    inline: false 
                },
                { 
                    name: '🔧 Tips', 
                    value: '• Use different test types for various diagnostics\n• Check system info regularly for monitoring\n• Random tests are great for fun interactions!', 
                    inline: false 
                }
            )
            .setTimestamp()
            .setFooter({ 
                text: `Info requested by ${interaction.user.displayName}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.update({ embeds: [embed], components: [] });
    },

    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m ${secs}s`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }
};
