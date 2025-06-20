import { Events } from 'discord.js';
import { EmbedBuilder } from 'discord.js';

const event = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        try {
            // Define welcome channel ID
            const welcomeChannelId = '1384956181067337809';
            // Get the welcome channel
            const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
            
            if (!welcomeChannel) {
                console.error(`Welcome channel with ID ${welcomeChannelId} not found.`);
                return;
            }

            // Create welcome embed
            const welcomeEmbed = new EmbedBuilder()
                .setColor(0x9B59B6) // Purple color for the embed
                .setTitle(`Welcome to Blankspace, ${member.user.username}!`)
                .setDescription(`Hey there, innovator! You're now part of our vibrant community of students, creators, developers, designers, and dreamers collaborating to build, learn, and grow!

**📌 First Steps to Kickstart Your Journey:**

1. **Read the Rules** - Head to <#1384956223392317523> to see how we roll
2. **Introduce Yourself** - Share your name, branch, and interests in <#1384956515814867045>
3. **Navigation Guide** - Check out <#1384956306498261052> to explore all channels, resources, and tools
4. **Pick Your Path** - Visit <#1385195030435598418> to select your interests

Get ready to create, collaborate, and soar! 🚀`)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .setImage('https://cdn.discordapp.com/attachments/1385120708044132503/1385124570973081681/Bg-Logo.png?ex=6856e788&is=68559608&hm=94f952fbc8bcde81385255322ccc39d426584375e325101a05d1d3f98b86c907&') // Add your welcome GIF here
                .setTimestamp()
                .setFooter({ 
                    text: `${member.guild.name} | Member #${member.guild.memberCount}`,
                    iconURL: member.guild.iconURL({ dynamic: true })
                });

            // Send the welcome message
            await welcomeChannel.send({ 
                content: `Welcome <@${member.id}> to **${member.guild.name}**!`,
                embeds: [welcomeEmbed] 
            });
            
            console.log(`Sent welcome message for ${member.user.tag} in ${welcomeChannel.name}`);
        } catch (error) {
            console.error('Error sending welcome message:', error);
        }
    },
};

export default event;
