import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { EmbedUtils } from '../utils/embedUtils.js';

export default {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Greets the user with a friendly message!')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to greet (optional)')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const greetings = [
            "Hello there! 👋",
            "Hey! Great to see you! 🌟",
            "Greetings! Hope you're having a wonderful day! ☀️",
            "Hi! Welcome to the server! 🎉",
            "Hello! Ready to have some fun? 🚀",
            "Hey there! Thanks for being part of our community! 💎"
        ];

        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

        let title, description;
        
        if (targetUser) {
            if (targetUser.id === interaction.user.id) {
                title = "Hello to yourself! 🪞";
                description = `${randomGreeting}\n\nTalking to yourself, ${interaction.user.displayName}? That's totally fine! 😄`;
            } else {
                title = `Hello ${targetUser.displayName}! 👋`;
                description = `${randomGreeting}\n\n${interaction.user.displayName} says hi to you, ${targetUser.displayName}! 🤝`;
            }
        } else {
            title = `Hello ${interaction.user.displayName}! 👋`;
            description = `${randomGreeting}\n\nHow can I help you today? 🤔`;
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle(title)
            .setDescription(description)
            .setTimestamp()
            .setFooter({ 
                text: `Requested by ${interaction.user.displayName}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        // Add a fun fact occasionally
        if (Math.random() < 0.3) {
            const funFacts = [
                "Did you know? The word 'hello' was first used as a greeting in the 1800s! 📚",
                "Fun fact: 'Hello' is understood in most languages around the world! 🌍",
                "Did you know? Alexander Graham Bell preferred 'ahoy' over 'hello' for phone greetings! 📞",
                "Fun fact: The average person says 'hello' about 50 times per day! 💬",
                "Did you know? In Japan, 'hello' can be said as 'konnichiwa' or 'moshi moshi' on the phone! 🇯🇵"
            ];
            
            const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
            embed.addFields({
                name: "💡 Random Fun Fact",
                value: randomFact,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    }
};
