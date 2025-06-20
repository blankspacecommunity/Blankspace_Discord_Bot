import { Events } from 'discord.js';

const event = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`❌ No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                console.log(`🔧 Executing command: ${interaction.commandName} by ${interaction.user.tag}`);
                await command.execute(interaction);
            } catch (error) {
                console.error(`❌ Error executing command ${interaction.commandName}:`, error);
                
                const errorMessage = {
                    content: '❌ There was an error while executing this command!',
                    ephemeral: true
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }
        
        // Handle button interactions
        else if (interaction.isButton()) {
            console.log(`🔘 Button interaction: ${interaction.customId} by ${interaction.user.tag}`);
            // Add button handling logic here if needed
        }
        
        // Handle select menu interactions
        else if (interaction.isAnySelectMenu()) {
            console.log(`📋 Select menu interaction: ${interaction.customId} by ${interaction.user.tag}`);
            // Add select menu handling logic here if needed
        }
        
        // Handle modal interactions
        else if (interaction.isModalSubmit()) {
            console.log(`📝 Modal submission: ${interaction.customId} by ${interaction.user.tag}`);
            // Add modal handling logic here if needed
        }
    },
};

export default event;
