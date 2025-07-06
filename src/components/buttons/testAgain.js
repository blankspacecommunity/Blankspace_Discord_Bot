import { EmbedBuilder } from 'discord.js';

export default {
    customId: 'test_again',
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🔄 Test Again - Success!')
            .setDescription('Test command executed again successfully!')
            .addFields(
                { name: '✅ Status', value: 'All systems operational', inline: true },
                { name: '🕒 Time', value: new Date().toLocaleString(), inline: true },
                { name: '👤 User', value: interaction.user.displayName, inline: true }
            )
            .setTimestamp()
            .setFooter({ 
                text: `Re-tested by ${interaction.user.displayName}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.update({ embeds: [embed], components: [] });
    }
};
