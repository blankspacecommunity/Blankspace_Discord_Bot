import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { EmbedUtils } from '../utils/embedUtils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Test command with various interactive features!')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of test to run')
                .setRequired(false)
                .addChoices(
                    { name: 'Basic Test', value: 'basic' },
                    { name: 'System Info', value: 'system' },
                    { name: 'Random Number', value: 'random' },
                    { name: 'Bot Status', value: 'status' },
                    { name: 'Color Test', value: 'colors' }
                )),

    async execute(interaction) {
        const testType = interaction.options.getString('type') || 'basic';
        
        let embed;
        let components = [];

        switch (testType) {
            case 'basic':
                embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Basic Test Successful!')
                    .setDescription('This is a basic test command. Everything is working correctly!')
                    .addFields(
                        { name: '🤖 Bot Status', value: 'Online and Ready', inline: true },
                        { name: '⏱️ Uptime', value: this.formatUptime(process.uptime()), inline: true },
                        { name: '💾 Memory Usage', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`, inline: true }
                    )
                    .setTimestamp();
                break;

            case 'system':
                embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('🖥️ System Information')
                    .setDescription('Current bot system information:')
                    .addFields(
                        { name: '📊 Node.js Version', value: process.version, inline: true },
                        { name: '🔧 Platform', value: process.platform, inline: true },
                        { name: '⚡ Architecture', value: process.arch, inline: true },
                        { name: '🕒 Bot Uptime', value: this.formatUptime(process.uptime()), inline: true },
                        { name: '💾 Memory Usage', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`, inline: true },
                        { name: '📈 Memory Total', value: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`, inline: true }
                    )
                    .setTimestamp();
                break;

            case 'random':
                const randomNum = Math.floor(Math.random() * 1000) + 1;
                const luckyNumber = Math.floor(Math.random() * 100) + 1;
                const dice1 = Math.floor(Math.random() * 6) + 1;
                const dice2 = Math.floor(Math.random() * 6) + 1;
                
                embed = new EmbedBuilder()
                    .setColor('#e74c3c')
                    .setTitle('🎲 Random Number Generator')
                    .setDescription('Here are your random numbers!')
                    .addFields(
                        { name: '🔢 Random Number (1-1000)', value: randomNum.toString(), inline: true },
                        { name: '🍀 Lucky Number (1-100)', value: luckyNumber.toString(), inline: true },
                        { name: '🎯 Dice Roll', value: `🎲 ${dice1} + 🎲 ${dice2} = **${dice1 + dice2}**`, inline: true }
                    )
                    .setTimestamp();
                break;

            case 'status':
                const guilds = interaction.client.guilds.cache.size;
                const users = interaction.client.users.cache.size;
                const channels = interaction.client.channels.cache.size;
                
                embed = new EmbedBuilder()
                    .setColor('#9b59b6')
                    .setTitle('📊 Bot Status Report')
                    .setDescription('Current bot statistics and status:')
                    .addFields(
                        { name: '🏠 Servers', value: guilds.toString(), inline: true },
                        { name: '👥 Users', value: users.toString(), inline: true },
                        { name: '📺 Channels', value: channels.toString(), inline: true },
                        { name: '🏓 Ping', value: `${interaction.client.ws.ping}ms`, inline: true },
                        { name: '⏱️ Uptime', value: this.formatUptime(process.uptime()), inline: true },
                        { name: '🤖 Status', value: '✅ Operational', inline: true }
                    )
                    .setTimestamp();
                break;

            case 'colors':
                const colors = [
                    { name: 'Red', value: '#ff0000', color: 0xff0000 },
                    { name: 'Green', value: '#00ff00', color: 0x00ff00 },
                    { name: 'Blue', value: '#0000ff', color: 0x0000ff },
                    { name: 'Purple', value: '#800080', color: 0x800080 },
                    { name: 'Orange', value: '#ffa500', color: 0xffa500 }
                ];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                
                embed = new EmbedBuilder()
                    .setColor(randomColor.color)
                    .setTitle('🎨 Color Test')
                    .setDescription('Testing embed colors!')
                    .addFields(
                        { name: '🎯 Selected Color', value: `**${randomColor.name}**`, inline: true },
                        { name: '🎨 Hex Code', value: randomColor.value, inline: true },
                        { name: '✨ Random?', value: 'Yes!', inline: true }
                    )
                    .setTimestamp();
                break;

            default:
                embed = EmbedUtils.createInfoEmbed('Test Command', 'Select a test type to run!');
        }

        // Add interactive buttons for basic test
        if (testType === 'basic') {
            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('test_again')
                        .setLabel('🔄 Test Again')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('test_random')
                        .setLabel('🎲 Random Test')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('test_info')
                        .setLabel('ℹ️ More Info')
                        .setStyle(ButtonStyle.Success)
                );
            components.push(buttons);
        }

        embed.setFooter({ 
            text: `Test requested by ${interaction.user.displayName}`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ 
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
