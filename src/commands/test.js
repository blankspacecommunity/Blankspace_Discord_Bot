import { SlashCommandBuilder } from 'discord.js';

const command = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('A simple test command to verify bot functionality'),
    
    async execute(interaction) {
        try {
            console.log(`Test command executed by ${interaction.user.tag}`);
            await interaction.reply({
                content: '✅ **Test successful!** The bot is working correctly.',
                ephemeral: false
            });
        } catch (error) {
            console.error('Error in test command:', error);
            await interaction.reply({
                content: '❌ Test failed: ' + error.message,
                ephemeral: true
            });
        }
    },
};

export default command;
