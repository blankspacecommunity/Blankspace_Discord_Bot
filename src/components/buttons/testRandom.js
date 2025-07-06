import { EmbedBuilder } from 'discord.js';

export default {
    customId: 'test_random',
    async execute(interaction) {
        const randomTests = [
            'Connection Test', 'Speed Test', 'Memory Test', 'Performance Test', 'Security Test'
        ];
        const randomTest = randomTests[Math.floor(Math.random() * randomTests.length)];
        const randomScore = Math.floor(Math.random() * 100) + 1;
        const randomLatency = Math.floor(Math.random() * 50) + 10;

        const embed = new EmbedBuilder()
            .setColor('#f39c12')
            .setTitle('🎲 Random Test Results')
            .setDescription(`Performed: **${randomTest}**`)
            .addFields(
                { name: '📊 Score', value: `${randomScore}/100`, inline: true },
                { name: '⚡ Latency', value: `${randomLatency}ms`, inline: true },
                { name: '🎯 Status', value: randomScore > 70 ? '✅ Excellent' : randomScore > 40 ? '⚠️ Good' : '❌ Needs Improvement', inline: true },
                { name: '🔢 Random Number', value: Math.floor(Math.random() * 1000).toString(), inline: true },
                { name: '🎪 Fun Level', value: '💯 Maximum!', inline: true },
                { name: '🚀 Performance', value: randomScore > 80 ? 'Blazing Fast' : randomScore > 60 ? 'Pretty Good' : 'Could be Better', inline: true }
            )
            .setTimestamp()
            .setFooter({ 
                text: `Random test by ${interaction.user.displayName}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.update({ embeds: [embed], components: [] });
    }
};
