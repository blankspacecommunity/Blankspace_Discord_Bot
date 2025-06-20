import { SlashCommandBuilder, EmbedBuilder, version as djsVersion } from 'discord.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const command = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Shows information about the bot'),
    
    async execute(interaction) {
        const client = interaction.client;
        
        // Read package.json for version info
        let botVersion = '1.0.0';
        try {
            const packagePath = join(__dirname, '..', '..', 'package.json');
            const packageData = JSON.parse(readFileSync(packagePath, 'utf8'));
            botVersion = packageData.version;
        } catch (error) {
            console.error('Could not read package.json:', error);
        }
        
        // Calculate uptime
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime % 60);
        
        const uptimeString = [
            days > 0 ? `${days}d` : '',
            hours > 0 ? `${hours}h` : '',
            minutes > 0 ? `${minutes}m` : '',
            `${seconds}s`
        ].filter(Boolean).join(' ');
        
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🤖 Bot Information')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: '📊 Stats', value: `**Servers:** ${client.guilds.cache.size}\n**Users:** ${client.users.cache.size}\n**Commands:** ${client.commands.size}`, inline: true },
                { name: '⚡ Performance', value: `**Uptime:** ${uptimeString}\n**Ping:** ${client.ws.ping}ms\n**Memory:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
                { name: '🔧 Technical', value: `**Node.js:** ${process.version}\n**Discord.js:** v${djsVersion}\n**Bot Version:** v${botVersion}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ 
                text: `Requested by ${interaction.user.displayName}`, 
                iconURL: interaction.user.displayAvatarURL() 
            });

        await interaction.reply({ embeds: [embed] });
    },
};

export default command;