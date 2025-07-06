import { config } from './config/config.js';

// Bot invite URL generator
const permissions = [
    'SendMessages',           // Send messages
    'UseSlashCommands',       // Use application commands
    'EmbedLinks',            // Embed links
    'ReadMessageHistory',     // Read message history
].join('');

// Calculate permission integer (basic permissions for slash commands)
const permissionInt = '2147486720'; // Includes Send Messages, Use Slash Commands, Embed Links, etc.

const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=${permissionInt}&scope=bot%20applications.commands`;

console.log('Bot Invite URL:');
console.log(inviteUrl);
console.log('\nInstructions:');
console.log('1. Click the URL above to invite the bot to your server');
console.log('2. Make sure to select the server where GUILD_ID matches');
console.log('3. Grant the bot the necessary permissions');
console.log('4. After inviting, run: npm run register');
console.log('5. Then start the bot with: npm start');
