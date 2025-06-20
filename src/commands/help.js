import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const command = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available commands and how to use them')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Get detailed help for a specific command')
                .setRequired(false)
                .addChoices(
                    { name: 'ping', value: 'ping' },
                    { name: 'hello', value: 'hello' },
                    { name: 'info', value: 'info' },
                    { name: 'help', value: 'help' }
                )
        ),
      async execute(interaction) {
        try {
            const specificCommand = interaction.options.getString('command');
            
            if (specificCommand) {
                // Show detailed help for specific command
                const commandHelp = getCommandHelp(specificCommand);
                const embed = new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle(`📚 Help - /${specificCommand}`)
                    .setDescription(commandHelp.description)
                    .addFields(
                        { name: '📝 Usage', value: commandHelp.usage, inline: false },
                        { name: '⚙️ Options', value: commandHelp.options || 'None', inline: false },
                        { name: '💡 Example', value: commandHelp.example, inline: false }
                    )
                    .setFooter({ 
                        text: 'Use /help to see all commands', 
                        iconURL: interaction.client.user.displayAvatarURL() 
                    })
                    .setTimestamp();
                    
                await interaction.reply({ embeds: [embed] });
            } else {
                // Show all commands
                const embed = new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle('📚 Bot Commands Help')
                    .setDescription('Here are all the available commands you can use:')
                    .addFields(
                        {
                            name: '🏓 `/ping`',
                            value: 'Check bot latency and response time',
                            inline: true
                        },
                        {
                            name: '👋 `/hello`',
                            value: 'Get a friendly greeting message',
                            inline: true
                        },
                        {
                            name: 'ℹ️ `/info`',
                            value: 'View detailed bot information and stats',
                            inline: true
                        },
                        {
                            name: '📚 `/help`',
                            value: 'Show this help message',
                            inline: true
                        },
                        {
                            name: '🔍 Need more details?',
                            value: 'Use `/help command:<command_name>` for detailed information about a specific command.',
                            inline: false
                        }
                    )
                    .setThumbnail(interaction.client.user.displayAvatarURL())
                    .setFooter({ 
                        text: `${interaction.client.user.username} • Made with ❤️`, 
                        iconURL: interaction.client.user.displayAvatarURL() 
                    })
                    .setTimestamp();
                    
                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error in help command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Error')
                .setDescription('Sorry, there was an error displaying the help information.')
                .setTimestamp();
                
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};

function getCommandHelp(commandName) {
    const commands = {
        ping: {
            description: 'Check the bot\'s response time and connection to Discord.',
            usage: '`/ping`',
            options: 'No options required.',
            example: '`/ping` - Shows bot latency and API response time'
        },
        hello: {
            description: 'Send a friendly greeting message to yourself or another user.',
            usage: '`/hello [user]`',
            options: '`user` (optional) - The user you want to greet. If not provided, greets you.',
            example: '`/hello` - Greets yourself\n`/hello @JohnDoe` - Greets JohnDoe'
        },
        info: {
            description: 'Display comprehensive information about the bot including stats, uptime, and system information.',
            usage: '`/info`',
            options: 'No options required.',
            example: '`/info` - Shows bot version, uptime, server count, and more'
        },
        help: {
            description: 'Display help information for all commands or get detailed help for a specific command.',
            usage: '`/help [command]`',
            options: '`command` (optional) - Get detailed help for a specific command.',
            example: '`/help` - Shows all commands\n`/help command:ping` - Shows detailed help for ping command'
        }
    };
    
    return commands[commandName] || {
        description: 'Command not found.',
        usage: 'Unknown',
        options: 'Unknown',
        example: 'Unknown'
    };
}

export default command;
