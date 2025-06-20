import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🔧 Development Setup Script');
console.log('===========================\n');

const steps = [
    {
        name: 'Installing dependencies',
        command: 'npm install',
        description: 'Installing all required packages...'
    },
    {
        name: 'Checking environment',
        command: 'node -e "console.log(\'Node.js version:\', process.version)"',
        description: 'Verifying Node.js version...'
    }
];

for (const step of steps) {
    try {
        console.log(`📦 ${step.description}`);
        const { stdout, stderr } = await execAsync(step.command);
        
        if (stdout) console.log(stdout);
        if (stderr) console.warn('⚠️', stderr);
        
        console.log(`✅ ${step.name} completed\n`);
    } catch (error) {
        console.error(`❌ ${step.name} failed:`, error.message);
        process.exit(1);
    }
}

console.log('🎉 Setup completed successfully!');
console.log('\nNext steps:');
console.log('1. Copy .env.example to .env');
console.log('2. Add your DISCORD_TOKEN and CLIENT_ID to .env');
console.log('3. Run: node deploy-commands.js');
console.log('4. Run: npm start');
console.log('\nHappy coding! 🚀');
