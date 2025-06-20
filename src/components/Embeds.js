import { EmbedBuilder } from 'discord.js';

// Utility class for creating common embed types
class EmbedComponents {
    static success(title, description, options = {}) {
        return new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`✅ ${title}`)
            .setDescription(description)
            .setTimestamp()
            .setFooter(options.footer || null)
            .setThumbnail(options.thumbnail || null);
    }

    static error(title, description, options = {}) {
        return new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle(`❌ ${title}`)
            .setDescription(description)
            .setTimestamp()
            .setFooter(options.footer || null)
            .setThumbnail(options.thumbnail || null);
    }

    static warning(title, description, options = {}) {
        return new EmbedBuilder()
            .setColor(0xFFFF00)
            .setTitle(`⚠️ ${title}`)
            .setDescription(description)
            .setTimestamp()
            .setFooter(options.footer || null)
            .setThumbnail(options.thumbnail || null);
    }

    static info(title, description, options = {}) {
        return new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`ℹ️ ${title}`)
            .setDescription(description)
            .setTimestamp()
            .setFooter(options.footer || null)
            .setThumbnail(options.thumbnail || null);
    }

    static custom(options = {}) {
        const embed = new EmbedBuilder();
        
        if (options.color) embed.setColor(options.color);
        if (options.title) embed.setTitle(options.title);
        if (options.description) embed.setDescription(options.description);
        if (options.thumbnail) embed.setThumbnail(options.thumbnail);
        if (options.image) embed.setImage(options.image);
        if (options.footer) embed.setFooter(options.footer);
        if (options.author) embed.setAuthor(options.author);
        if (options.fields) embed.addFields(options.fields);
        if (options.timestamp) embed.setTimestamp();
        if (options.url) embed.setURL(options.url);
        
        return embed;
    }

    // Helper method to create a loading embed
    static loading(message = 'Loading...') {
        return new EmbedBuilder()
            .setColor(0x808080)
            .setDescription(`⏳ ${message}`)
            .setTimestamp();
    }

    // Helper method to create a bot status embed
    static botStatus(client) {
        return new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🤖 Bot Status')
            .addFields(
                { name: 'Status', value: '🟢 Online', inline: true },
                { name: 'Servers', value: client.guilds.cache.size.toString(), inline: true },
                { name: 'Users', value: client.users.cache.size.toString(), inline: true },
                { name: 'Uptime', value: this.formatUptime(process.uptime()), inline: true },
                { name: 'Memory Usage', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
                { name: 'Ping', value: `${client.ws.ping}ms`, inline: true }
            )
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp();
    }

    // Helper method to format uptime
    static formatUptime(uptime) {
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime % 60);
        
        return [
            days > 0 ? `${days}d` : '',
            hours > 0 ? `${hours}h` : '',
            minutes > 0 ? `${minutes}m` : '',
            `${seconds}s`
        ].filter(Boolean).join(' ');
    }
}

export default EmbedComponents;