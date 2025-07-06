import { config } from './config/config.js';

// Bot invite URL generator with correct permissions for XP system
const permissionInt = '2147486720'; // Calculated permissions including:
// - Send Messages
// - Use Slash Commands  
// - Embed Links
// - Read Message History
// - Manage Messages
// - Send Messages in Threads
// - Use External Emojis

// CRITICAL: Both 'bot' and 'applications.commands' scopes are required!
const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=${permissionInt}&scope=bot%20applications.commands`;

console.log('🎮 Discord XP Bot Invite URL Generator');
console.log('=====================================\n');

console.log('📋 Your Bot Invite URL:');
console.log(inviteUrl);

console.log('\n🚨 IMPORTANT - Re-invite Required!');
console.log('If you\'re getting "Missing Access" errors, you need to RE-INVITE the bot with the correct scopes.\n');

console.log('✅ Setup Instructions:');
console.log('1. KICK the bot from your server first (if already added)');
console.log('2. Click the URL above to re-invite with correct permissions');
console.log('3. Select your server (GUILD_ID: ' + config.guildId + ')');
console.log('4. Make sure BOTH scopes are selected:');
console.log('   ✅ bot');
console.log('   ✅ applications.commands ← CRITICAL!');
console.log('5. Grant all the permissions shown');
console.log('6. Run: npm run register (should succeed now)');
console.log('7. Run: npm start');

console.log('\n🎯 Key Point:');
console.log('The "applications.commands" scope is REQUIRED for slash commands!');
console.log('If the bot was invited before without this scope, it won\'t work.');

console.log('\n🔧 Alternative:');
console.log('You can also manually create this invite in Discord Developer Portal:');
console.log('• Go to https://discord.com/developers/applications');
console.log('• Select your application');
console.log('• OAuth2 → URL Generator');
console.log('• Select: bot + applications.commands');
console.log('• Copy and use the generated URL');

if (!config.clientId) {
    console.log('\n❌ ERROR: CLIENT_ID not found in .env file!');
    console.log('Please add your Discord application ID to the .env file.');
}
