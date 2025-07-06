import { EmbedBuilder } from 'discord.js';

export default {
    customId: 'ping_again',
    async execute(interaction) {
        const sent = Date.now();
        const botLatency = sent - interaction.createdTimestamp;
        const apiLatency = interaction.client.ws.ping;
        
        const getLatencyStatus = (latency) => {
            if (latency < 100) return { status: '🟢 Excellent', color: '#00ff00' };
            if (latency < 200) return { status: '🟡 Good', color: '#ffff00' };
            if (latency < 300) return { status: '🟠 Fair', color: '#ffa500' };
            return { status: '🔴 Poor', color: '#ff0000' };
        };

        const botStatus = getLatencyStatus(botLatency);
        
        const embed = new EmbedBuilder()
            .setTitle('🔄 Ping Again - Results')
            .setColor(botLatency < 150 ? '#00ff00' : botLatency < 300 ? '#ffff00' : '#ff0000')
            .setDescription('Fresh latency measurement results')
            .addFields(
                { name: '🤖 Bot Latency', value: `${botLatency}ms ${botStatus.status}`, inline: true },
                { name: '📡 API Latency', value: `${apiLatency}ms ${getLatencyStatus(apiLatency).status}`, inline: true },
                { name: '🕒 Measured At', value: `<t:${Math.floor(Date.now() / 1000)}:T>`, inline: true }
            )
            .setTimestamp()
            .setFooter({ 
                text: `Re-pinged by ${interaction.user.displayName}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.update({ embeds: [embed], components: [] });
    }
};
