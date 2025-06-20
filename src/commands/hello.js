import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const command = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Says hello to you!')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to say hello to')
                .setRequired(false)
        ),
      async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const isTargetingSelf = targetUser.id === interaction.user.id;
        
        // Use username instead of displayName for better compatibility
        const targetName = targetUser.globalName || targetUser.username;
        const authorName = interaction.user.globalName || interaction.user.username;
        
        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle('👋 Hello!')
            .setDescription(
                isTargetingSelf 
                    ? `Hello there, ${targetName}! 🌟`
                    : `${authorName} says hello to ${targetName}! 🎉`
            )
            .setThumbnail(targetUser.displayAvatarURL())
            .setTimestamp()
            .setFooter({ 
                text: 'Have a great day!', 
                iconURL: interaction.client.user.displayAvatarURL() 
            });

        await interaction.reply({ embeds: [embed] });
    },
};

export default command;