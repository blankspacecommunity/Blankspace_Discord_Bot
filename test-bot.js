import { Client, GatewayIntentBits, ChannelType, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Set up paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface for interactive prompts
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    bright: '\x1b[1m'
};

// Test options
const tests = {
    '1': {
        name: 'Welcome Message Test',
        description: 'Tests the welcome message functionality',
        run: testWelcomeMessage
    },
    '2': {
        name: 'Bot Permissions Check',
        description: 'Checks if the bot has the necessary permissions',
        run: testBotPermissions
    },
    '3': {
        name: 'Channel Verification',
        description: 'Verifies the existence of required channels',
        run: testChannelVerification
    },
    '4': {
        name: 'Environment Setup Check',
        description: 'Checks if environment variables are set correctly',
        run: testEnvironmentSetup
    },
    'exit': {
        name: 'Exit',
        description: 'Exit the test program',
        run: () => process.exit(0)
    }
};

// Main function
async function main() {
    console.log(`\n${colors.bright}${colors.cyan}📊 Blankspace Discord Bot Testing Suite${colors.reset}`);
    console.log(`${colors.cyan}====================================${colors.reset}\n`);
    
    // Check environment
    if (!process.env.DISCORD_TOKEN) {
        console.log(`${colors.red}❌ DISCORD_TOKEN not found in environment variables.${colors.reset}`);
        console.log(`Please create a .env file with your bot's token.`);
        process.exit(1);
    }
    
    // Show menu
    await showMenu();
}

// Show interactive menu
async function showMenu() {
    console.log(`\n${colors.bright}${colors.blue}Available Tests:${colors.reset}`);
    for (const [key, test] of Object.entries(tests)) {
        console.log(`${colors.yellow}${key}${colors.reset}: ${test.name} - ${test.description}`);
    }
    
    rl.question(`\n${colors.green}Enter test number (or 'exit' to quit): ${colors.reset}`, async (answer) => {
        if (tests[answer]) {
            await tests[answer].run();
            // After test completes, show menu again
            setTimeout(showMenu, 1500);
        } else {
            console.log(`${colors.red}Invalid option. Please try again.${colors.reset}`);
            showMenu();
        }
    });
}

// Test 1: Welcome Message
async function testWelcomeMessage() {
    console.log(`\n${colors.bright}${colors.magenta}🧪 Running Welcome Message Test${colors.reset}`);
    
    try {
        // Import welcome event
        const welcomeEventPath = path.join(__dirname, 'src', 'events', 'guildMemberAdd.js');
        
        // Check if the welcome event file exists
        if (!fs.existsSync(welcomeEventPath)) {
            console.log(`${colors.red}❌ Welcome event file not found at: ${welcomeEventPath}${colors.reset}`);
            return;
        }
        
        console.log(`${colors.green}✅ Welcome event file found${colors.reset}`);
        
        // Import the welcome event
        const welcomeEvent = (await import('./src/events/guildMemberAdd.js')).default;
        console.log(`${colors.green}✅ Welcome event imported successfully${colors.reset}`);
        
        // Extract welcome channel ID from the event file
        const fileContent = fs.readFileSync(welcomeEventPath, 'utf8');
        const channelIdMatch = fileContent.match(/const\s+welcomeChannelId\s*=\s*['"]([^'"]+)['"]/);
        const welcomeChannelId = channelIdMatch ? channelIdMatch[1] : null;
        
        if (!welcomeChannelId) {
            console.log(`${colors.red}❌ Could not extract welcome channel ID from the file${colors.reset}`);
            return;
        }
        
        console.log(`${colors.green}✅ Found welcome channel ID: ${welcomeChannelId}${colors.reset}`);
        
        // Create client
        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers
            ]
        });
        
        // Login and test
        client.once('ready', async () => {
            console.log(`${colors.green}✅ Test client logged in as ${client.user.tag}${colors.reset}`);
            
            const guild = client.guilds.cache.first();
            if (!guild) {
                console.log(`${colors.red}❌ No guilds available for testing${colors.reset}`);
                client.destroy();
                return;
            }
            
            console.log(`${colors.green}✅ Using guild: ${guild.name}${colors.reset}`);
            
            // Check if welcome channel exists
            const welcomeChannel = guild.channels.cache.get(welcomeChannelId);
            if (!welcomeChannel) {
                console.log(`${colors.red}❌ Welcome channel with ID ${welcomeChannelId} not found${colors.reset}`);
                console.log(`Available text channels:`);
                guild.channels.cache
                    .filter(c => c.type === ChannelType.GuildText)
                    .forEach(c => console.log(`- #${c.name}: ${c.id}`));
                client.destroy();
                return;
            }
            
            console.log(`${colors.green}✅ Found welcome channel: #${welcomeChannel.name}${colors.reset}`);
            
            // Fetch bot's member object
            const botMember = await guild.members.fetch(client.user.id);
            
            // Test bot's permissions in welcome channel
            const permissions = welcomeChannel.permissionsFor(botMember);
            if (!permissions.has('SendMessages') || !permissions.has('EmbedLinks')) {
                console.log(`${colors.red}❌ Bot lacks necessary permissions in welcome channel${colors.reset}`);
                console.log(`Missing permissions: ${!permissions.has('SendMessages') ? 'SendMessages ' : ''}${!permissions.has('EmbedLinks') ? 'EmbedLinks' : ''}`);
                client.destroy();
                return;
            }
            
            console.log(`${colors.green}✅ Bot has necessary permissions in welcome channel${colors.reset}`);
            
            // Execute welcome event
            console.log(`${colors.yellow}🔄 Simulating member join event...${colors.reset}`);
            
            try {
                await welcomeEvent.execute(botMember);
                console.log(`${colors.green}✅ Welcome message sent successfully${colors.reset}`);
                
                // Verification question
                rl.question(`\n${colors.yellow}👀 Did you see the welcome message with an image in #${welcomeChannel.name}? (y/n): ${colors.reset}`, (answer) => {
                    if (answer.toLowerCase() === 'y') {
                        console.log(`${colors.green}🎉 Great! The welcome message feature is working correctly.${colors.reset}`);
                    } else {
                        console.log(`${colors.red}❌ Something might be wrong with the welcome message.${colors.reset}`);
                        console.log(`${colors.yellow}Troubleshooting tips:${colors.reset}`);
                        console.log(`1. Check the console for any error messages`);
                        console.log(`2. Make sure the image URL in guildMemberAdd.js is valid`);
                        console.log(`3. Verify the embed structure in guildMemberAdd.js`);
                    }
                    client.destroy();
                });
            } catch (error) {
                console.log(`${colors.red}❌ Error executing welcome event: ${error.message}${colors.reset}`);
                client.destroy();
            }
        });
        
        await client.login(process.env.DISCORD_TOKEN);
        
    } catch (error) {
        console.log(`${colors.red}❌ Test failed: ${error.message}${colors.reset}`);
    }
}

// Test 2: Bot Permissions Check
async function testBotPermissions() {
    console.log(`\n${colors.bright}${colors.magenta}🧪 Running Bot Permissions Check${colors.reset}`);
    
    try {
        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers
            ]
        });
        
        client.once('ready', async () => {
            console.log(`${colors.green}✅ Test client logged in as ${client.user.tag}${colors.reset}`);
            
            const guild = client.guilds.cache.first();
            if (!guild) {
                console.log(`${colors.red}❌ No guilds available for testing${colors.reset}`);
                client.destroy();
                return;
            }
            
            console.log(`${colors.green}✅ Using guild: ${guild.name}${colors.reset}`);
            
            // Fetch bot's member object
            const botMember = await guild.members.fetch(client.user.id);
            
            // Check bot permissions
            const botPermissions = {
                'Send Messages': botMember.permissions.has('SendMessages'),
                'Embed Links': botMember.permissions.has('EmbedLinks'),
                'Read Message History': botMember.permissions.has('ReadMessageHistory'),
                'Use External Emojis': botMember.permissions.has('UseExternalEmojis'),
                'Add Reactions': botMember.permissions.has('AddReactions'),
                'Use Application Commands': botMember.permissions.has('UseApplicationCommands'),
            };
            
            console.log(`\n${colors.bright}${colors.blue}Bot Permissions:${colors.reset}`);
            
            let allPermissionsOk = true;
            for (const [permission, hasPermission] of Object.entries(botPermissions)) {
                if (hasPermission) {
                    console.log(`${colors.green}✅ ${permission}${colors.reset}`);
                } else {
                    console.log(`${colors.red}❌ ${permission}${colors.reset}`);
                    allPermissionsOk = false;
                }
            }
            
            if (allPermissionsOk) {
                console.log(`\n${colors.green}🎉 Bot has all necessary permissions.${colors.reset}`);
            } else {
                console.log(`\n${colors.yellow}⚠️ Bot is missing some recommended permissions.${colors.reset}`);
                console.log(`This might limit some functionality.`);
            }
            
            client.destroy();
        });
        
        await client.login(process.env.DISCORD_TOKEN);
        
    } catch (error) {
        console.log(`${colors.red}❌ Test failed: ${error.message}${colors.reset}`);
    }
}

// Test 3: Channel Verification
async function testChannelVerification() {
    console.log(`\n${colors.bright}${colors.magenta}🧪 Running Channel Verification${colors.reset}`);
    
    try {
        // Import the welcome event to extract channel references
        const welcomeEventPath = path.join(__dirname, 'src', 'events', 'guildMemberAdd.js');
        
        // Check if the file exists
        if (!fs.existsSync(welcomeEventPath)) {
            console.log(`${colors.red}❌ Welcome event file not found${colors.reset}`);
            return;
        }
        
        // Read file content to extract channel references
        const fileContent = fs.readFileSync(welcomeEventPath, 'utf8');
        
        // Extract channel mentions from the file using regex
        const channelMentionPattern = /<#(\d+)>/g;
        const channelMentions = [];
        let match;
        
        while ((match = channelMentionPattern.exec(fileContent)) !== null) {
            channelMentions.push(match[1]);
        }
        
        // Find welcome channel ID
        const welcomeChannelIdMatch = fileContent.match(/const\s+welcomeChannelId\s*=\s*['"]([^'"]+)['"]/);
        const welcomeChannelId = welcomeChannelIdMatch ? welcomeChannelIdMatch[1] : null;
        
        if (welcomeChannelId && !channelMentions.includes(welcomeChannelId)) {
            channelMentions.push(welcomeChannelId);
        }
        
        console.log(`${colors.green}✅ Found ${channelMentions.length} channel references in welcome message${colors.reset}`);
        
        // Connect to Discord to check channels
        const client = new Client({
            intents: [GatewayIntentBits.Guilds]
        });
        
        client.once('ready', async () => {
            console.log(`${colors.green}✅ Test client logged in as ${client.user.tag}${colors.reset}`);
            
            const guild = client.guilds.cache.first();
            if (!guild) {
                console.log(`${colors.red}❌ No guilds available for testing${colors.reset}`);
                client.destroy();
                return;
            }
            
            console.log(`${colors.green}✅ Using guild: ${guild.name}${colors.reset}`);
            
            // Check each channel reference
            console.log(`\n${colors.bright}${colors.blue}Channel Verification:${colors.reset}`);
            
            for (const channelId of channelMentions) {
                const channel = guild.channels.cache.get(channelId);
                
                if (channel) {
                    console.log(`${colors.green}✅ Channel #${channel.name} (${channelId}) exists${colors.reset}`);
                    
                    if (channelId === welcomeChannelId) {
                        // Check permissions in welcome channel
                        const botMember = await guild.members.fetch(client.user.id);
                        const permissions = channel.permissionsFor(botMember);
                        
                        if (permissions.has('SendMessages') && permissions.has('EmbedLinks')) {
                            console.log(`${colors.green}  ✓ Bot has permission to send messages in welcome channel${colors.reset}`);
                        } else {
                            console.log(`${colors.red}  ✗ Bot lacks permission to send messages in welcome channel${colors.reset}`);
                        }
                    }
                } else {
                    console.log(`${colors.red}❌ Channel with ID ${channelId} not found${colors.reset}`);
                    if (channelId === welcomeChannelId) {
                        console.log(`${colors.red}  ✗ This is the welcome channel, which is required!${colors.reset}`);
                    }
                }
            }
            
            client.destroy();
        });
        
        await client.login(process.env.DISCORD_TOKEN);
        
    } catch (error) {
        console.log(`${colors.red}❌ Test failed: ${error.message}${colors.reset}`);
    }
}

// Test 4: Environment Setup Check
async function testEnvironmentSetup() {
    console.log(`\n${colors.bright}${colors.magenta}🧪 Running Environment Setup Check${colors.reset}`);
    
    // Check .env file
    const envExists = fs.existsSync(path.join(__dirname, '.env'));
    if (envExists) {
        console.log(`${colors.green}✅ .env file exists${colors.reset}`);
    } else {
        console.log(`${colors.red}❌ .env file not found${colors.reset}`);
    }
    
    // Check environment variables
    const envVars = {
        'DISCORD_TOKEN': process.env.DISCORD_TOKEN ? '(set)' : '(not set)',
        'CLIENT_ID': process.env.CLIENT_ID ? '(set)' : '(not set)'
    };
    
    console.log(`\n${colors.bright}${colors.blue}Environment Variables:${colors.reset}`);
    for (const [name, status] of Object.entries(envVars)) {
        if (status === '(set)') {
            console.log(`${colors.green}✅ ${name} ${status}${colors.reset}`);
        } else {
            console.log(`${colors.red}❌ ${name} ${status}${colors.reset}`);
        }
    }
    
    // Check package.json and node_modules
    const packageJsonExists = fs.existsSync(path.join(__dirname, 'package.json'));
    if (packageJsonExists) {
        console.log(`${colors.green}✅ package.json exists${colors.reset}`);
    } else {
        console.log(`${colors.red}❌ package.json not found${colors.reset}`);
    }
    
    const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));
    if (nodeModulesExists) {
        console.log(`${colors.green}✅ node_modules exists${colors.reset}`);
    } else {
        console.log(`${colors.red}❌ node_modules not found - run npm install${colors.reset}`);
    }
    
    // Check required files
    const requiredFiles = [
        { path: 'bot.js', purpose: 'Main bot file' },
        { path: 'deploy-commands.js', purpose: 'Command deployment script' },
        { path: 'src/events/guildMemberAdd.js', purpose: 'Welcome message event' },
        { path: 'src/events/ready.js', purpose: 'Bot ready event' },
        { path: 'src/events/interactionCreate.js', purpose: 'Interaction handler' }
    ];
    
    console.log(`\n${colors.bright}${colors.blue}Required Files:${colors.reset}`);
    for (const file of requiredFiles) {
        const exists = fs.existsSync(path.join(__dirname, file.path));
        if (exists) {
            console.log(`${colors.green}✅ ${file.path} (${file.purpose})${colors.reset}`);
        } else {
            console.log(`${colors.red}❌ ${file.path} (${file.purpose})${colors.reset}`);
        }
    }
}

// Start the test suite
main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
