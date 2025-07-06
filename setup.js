#!/usr/bin/env node

/**
 * Discord Bot Setup and Management Script
 * Helps users set up and manage their Discord bot commands easily
 */

import { spawn } from 'child_process';
import readline from 'readline';
import chalk from 'chalk';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

function runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        const process = spawn('node', [command, ...args], {
            stdio: 'inherit',
            shell: true
        });
        
        process.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });
        
        process.on('error', reject);
    });
}

async function showMenu() {
    console.clear();
    console.log(chalk.blue.bold('🤖 Discord Bot Command Manager'));
    console.log(chalk.gray('========================================'));
    console.log();
    
    console.log(chalk.yellow('Available Actions:'));
    console.log('1. 📋 List all commands (registered & local)');
    console.log('2. 📤 Register/Update all commands');
    console.log('3. 🧹 Clean up orphaned commands');
    console.log('4. 🗑️  Delete specific commands');
    console.log('5. 🧪 Test bot functionality');
    console.log('6. ❓ Show help');
    console.log('0. 🚪 Exit');
    console.log();
}

async function main() {
    try {
        while (true) {
            await showMenu();
            
            const choice = await question(chalk.cyan('Select an option (0-6): '));
            console.log();
            
            switch (choice) {
                case '1':
                    console.log(chalk.blue('📋 Listing all commands...'));
                    await runCommand('command-manager.js', ['--list']);
                    break;
                    
                case '2':
                    console.log(chalk.blue('📤 Registering commands...'));
                    await runCommand('command-manager.js', ['--register']);
                    break;
                    
                case '3':
                    console.log(chalk.blue('🧹 Cleaning up orphaned commands...'));
                    await runCommand('command-manager.js', ['--cleanup']);
                    break;
                    
                case '4':
                    const commandNames = await question(chalk.yellow('Enter command names to delete (space-separated): '));
                    if (commandNames.trim()) {
                        const names = commandNames.trim().split(/\s+/);
                        console.log(chalk.blue(`🗑️  Deleting commands: ${names.join(', ')}`));
                        await runCommand('command-manager.js', ['--delete', ...names]);
                    } else {
                        console.log(chalk.red('❌ No command names provided.'));
                    }
                    break;
                    
                case '5':
                    console.log(chalk.blue('🧪 Running test registration...'));
                    await runCommand('register-commands.js');
                    break;
                    
                case '6':
                    await runCommand('command-manager.js', ['--help']);
                    break;
                    
                case '0':
                    console.log(chalk.green('👋 Goodbye!'));
                    rl.close();
                    process.exit(0);
                    
                default:
                    console.log(chalk.red('❌ Invalid option. Please try again.'));
            }
            
            console.log();
            await question(chalk.gray('Press Enter to continue...'));
        }
        
    } catch (error) {
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n👋 Goodbye!'));
    rl.close();
    process.exit(0);
});

console.log(chalk.green('🚀 Starting Discord Bot Command Manager...'));
main();
