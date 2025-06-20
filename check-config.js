import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Bot Configuration Check');
console.log('==========================');

// Check if required environment variables exist
const requiredVars = ['DISCORD_TOKEN', 'CLIENT_ID'];
const missingVars = [];

for (const varName of requiredVars) {
    if (!process.env[varName]) {
        missingVars.push(varName);
    } else {
        console.log(`✅ ${varName}: ${process.env[varName].substring(0, 20)}...`);
    }
}

if (missingVars.length > 0) {
    console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`);
    console.log('💡 Make sure your .env file contains all required variables');
    process.exit(1);
} else {
    console.log('✅ All required environment variables are present');
}

// Validate token format
const token = process.env.DISCORD_TOKEN;
if (!token.includes('.')) {
    console.log('⚠️  Discord token format looks incorrect (should contain dots)');
} else {
    console.log('✅ Discord token format looks correct');
}

// Validate CLIENT_ID format
const clientId = process.env.CLIENT_ID;
if (!/^\d+$/.test(clientId)) {
    console.log('⚠️  CLIENT_ID should be numeric');
} else {
    console.log('✅ CLIENT_ID format looks correct');
}

console.log('\n🚀 Configuration check complete!');
console.log('If all checks passed, try running: npm start');
