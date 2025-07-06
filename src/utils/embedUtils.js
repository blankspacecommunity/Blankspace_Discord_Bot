import { EmbedBuilder } from 'discord.js';

export class EmbedUtils {
    static createSuccessEmbed(title, description) {
        return new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();
    }

    static createErrorEmbed(title, description) {
        return new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();
    }

    static createInfoEmbed(title, description) {
        return new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();
    }

    static createPongEmbed(latency) {
        return new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🏓 Pong!')
            .setDescription(`Bot latency: ${latency}ms`)
            .setTimestamp();
    }

    static createWarningEmbed(title, description) {
        return new EmbedBuilder()
            .setColor('#ffff00')
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();
    }

    static createWelcomeEmbed(title, description) {
        return new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();
    }

    static createTestEmbed(title, description, color = '#3498db') {
        return new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();
    }

    static createRandomEmbed(title, description) {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        return new EmbedBuilder()
            .setColor(randomColor)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();
    }
}