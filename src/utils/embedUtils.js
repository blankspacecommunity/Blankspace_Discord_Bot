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
}