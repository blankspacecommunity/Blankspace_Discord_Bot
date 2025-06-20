import { Client, GatewayIntentBits } from 'discord.js';
import welcomeEvent from './src/events/guildMemberAdd.js';

// Simple script to test the welcome message without having a user join
// Simulates a member join event and triggers the welcome message

// To run this test, create a .env file with DISCORD_TOKEN and run:
// node test-welcome.js

import dotenv from 'dotenv';
import readline from 'readline';
dotenv.config();

const testWelcomeMessage = async () => {
    try {
        console.log('🧪 Testing welcome message...');
          // Create a temporary client
        const client = new Client({ 
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers
            ] 
        });
        
        client.on('ready', async () => {
            console.log(`✅ Test client logged in as ${client.user.tag}`);
            
            // Get first guild
            const guild = client.guilds.cache.first();
            
            if (!guild) {
                console.error('❌ No guilds available for testing');
                process.exit(1);
            }
            
            console.log(`📝 Using guild: ${guild.name}`);
            
            // Fetch the bot's member object to use for testing
            // This will simulate the bot joining as a new member
            const botMember = await guild.members.fetch(client.user.id);
              // Get the welcome channel ID from the event handler
            const welcomeChannelId = '1384956181067337809'; // This should match the ID in guildMemberAdd.js
            const welcomeChannel = guild.channels.cache.get(welcomeChannelId);
            
            if (!welcomeChannel) {
                console.error(`❌ Welcome channel with ID ${welcomeChannelId} not found in this server.`);
                console.error('Available channels:');
                guild.channels.cache.forEach(channel => {
                    console.log(`- ${channel.name}: ${channel.id}`);
                });
                process.exit(1);
            }
            
            console.log(`📢 Found welcome channel: #${welcomeChannel.name}`);
            
            // Call the welcome event with the bot member as if it just joined
            console.log('🔄 Simulating member join event...');
            await welcomeEvent.execute(botMember);
            
            console.log('✅ Test completed! Check the welcome channel for your message.');
            console.log(`Channel: #${welcomeChannel.name} (${welcomeChannelId})`);
            
            // Ask if the message was received correctly
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            rl.question('\n👀 Did you see the welcome message in the channel? (y/n): ', (answer) => {
                if (answer.toLowerCase() === 'y') {
                    console.log('🎉 Great! The welcome message feature is working correctly.');
                } else {
                    console.log('❌ Something might be wrong with the welcome message feature.');
                    console.log('Troubleshooting tips:');
                    console.log('1. Check if the bot has permission to send messages in the welcome channel');
                    console.log('2. Verify the welcome channel ID in guildMemberAdd.js');
                    console.log('3. Check console for any error messages');
                }
                rl.close();
                setTimeout(() => process.exit(0), 1000);
            });
        });
        
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
};

testWelcomeMessage();
