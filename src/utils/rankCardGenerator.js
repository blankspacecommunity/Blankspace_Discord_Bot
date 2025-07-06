import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { AttachmentBuilder } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class RankCardGenerator {
    constructor() {
        this.width = 900;
        this.height = 300;
        this.colors = {
            background: '#2C2F33',
            cardBackground: '#36393F',
            accent: '#7289DA',
            accentSecondary: '#99AAB5',
            text: '#FFFFFF',
            textSecondary: '#B9BBBE',
            xpBarBackground: '#4F545C',
            xpBarFill: '#43B581',
            levelBackground: '#5865F2',
            rankBackground: '#ED4245'
        };
    }

    /**
     * Generate a rank card for a user
     * @param {Object} userData - User's rank data
     * @param {string} avatarURL - User's avatar URL
     * @param {number} rank - User's current rank
     * @returns {AttachmentBuilder} Discord attachment
     */
    async generateRankCard(userData, avatarURL, rank) {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        // Background gradient
        await this.drawBackground(ctx);
        
        // User avatar
        await this.drawAvatar(ctx, avatarURL);
        
        // User info
        await this.drawUserInfo(ctx, userData, rank);
        
        // XP Progress bar
        await this.drawXPProgress(ctx, userData);
        
        // Level and rank badges
        await this.drawBadges(ctx, userData, rank);
        
        // Decorative elements
        await this.drawDecorations(ctx);

        const buffer = canvas.toBuffer('image/png');
        return new AttachmentBuilder(buffer, { name: 'rank-card.png' });
    }

    async drawBackground(ctx) {
        // Main background
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, this.width, this.height);

        // Card background with rounded corners
        ctx.fillStyle = this.colors.cardBackground;
        this.roundRect(ctx, 20, 20, this.width - 40, this.height - 40, 20);
        ctx.fill();

        // Accent border
        ctx.strokeStyle = this.colors.accent;
        ctx.lineWidth = 3;
        this.roundRect(ctx, 20, 20, this.width - 40, this.height - 40, 20);
        ctx.stroke();

        // Gradient overlay
        const gradient = ctx.createLinearGradient(0, 0, this.width, 0);
        gradient.addColorStop(0, 'rgba(114, 137, 218, 0.1)');
        gradient.addColorStop(1, 'rgba(67, 181, 129, 0.1)');
        ctx.fillStyle = gradient;
        this.roundRect(ctx, 20, 20, this.width - 40, this.height - 40, 20);
        ctx.fill();
    }

    async drawAvatar(ctx, avatarURL) {
        try {
            const avatar = await loadImage(avatarURL);
            const avatarSize = 120;
            const avatarX = 50;
            const avatarY = 50;

            // Avatar border
            ctx.strokeStyle = this.colors.accent;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 2, 0, Math.PI * 2);
            ctx.stroke();

            // Avatar clipping
            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
            ctx.clip();

            // Draw avatar
            ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
            ctx.restore();

        } catch (error) {
            console.error('Error loading avatar:', error);
            // Fallback avatar
            ctx.fillStyle = this.colors.accentSecondary;
            ctx.beginPath();
            ctx.arc(110, 110, 60, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = this.colors.text;
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('?', 110, 125);
        }
    }

    async drawUserInfo(ctx, userData, rank) {
        // Username
        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(userData.username || 'Unknown User', 200, 80);

        // Discriminator (if available)
        if (userData.discriminator && userData.discriminator !== '0') {
            ctx.fillStyle = this.colors.textSecondary;
            ctx.font = '24px Arial';
            const usernameWidth = ctx.measureText(userData.username || 'Unknown User').width;
            ctx.fillText(`#${userData.discriminator}`, 200 + usernameWidth + 10, 80);
        }

        // Current rank text
        ctx.fillStyle = this.colors.textSecondary;
        ctx.font = '20px Arial';
        ctx.fillText(`Rank #${rank}`, 200, 110);

        // XP info
        const currentXP = userData.xp || 0;
        const currentLevel = userData.level || 1;
        const xpForNextLevel = this.getXPForLevel(currentLevel + 1);
        const xpForCurrentLevel = this.getXPForLevel(currentLevel);
        const xpProgress = currentXP - xpForCurrentLevel;
        const xpNeeded = xpForNextLevel - xpForCurrentLevel;

        ctx.fillStyle = this.colors.text;
        ctx.font = '18px Arial';
        ctx.fillText(`${this.formatNumber(xpProgress)} / ${this.formatNumber(xpNeeded)} XP`, 200, 140);

        // Total XP
        ctx.fillStyle = this.colors.textSecondary;
        ctx.font = '16px Arial';
        ctx.fillText(`Total XP: ${this.formatNumber(currentXP)}`, 200, 165);

        // Submissions info
        if (userData.approved_submissions) {
            ctx.fillText(`Submissions: ${userData.approved_submissions}`, 200, 185);
        }
    }

    async drawXPProgress(ctx, userData) {
        const currentXP = userData.xp || 0;
        const currentLevel = userData.level || 1;
        const xpForNextLevel = this.getXPForLevel(currentLevel + 1);
        const xpForCurrentLevel = this.getXPForLevel(currentLevel);
        const xpProgress = currentXP - xpForCurrentLevel;
        const xpNeeded = xpForNextLevel - xpForCurrentLevel;
        const progress = Math.max(0, Math.min(1, xpProgress / xpNeeded));

        const barX = 200;
        const barY = 210;
        const barWidth = 550;
        const barHeight = 25;

        // Background bar
        ctx.fillStyle = this.colors.xpBarBackground;
        this.roundRect(ctx, barX, barY, barWidth, barHeight, 12);
        ctx.fill();

        // Progress bar
        if (progress > 0) {
            const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
            gradient.addColorStop(0, '#43B581');
            gradient.addColorStop(1, '#7289DA');
            ctx.fillStyle = gradient;
            this.roundRect(ctx, barX, barY, barWidth * progress, barHeight, 12);
            ctx.fill();
        }

        // Progress bar border
        ctx.strokeStyle = this.colors.accent;
        ctx.lineWidth = 2;
        this.roundRect(ctx, barX, barY, barWidth, barHeight, 12);
        ctx.stroke();

        // Progress percentage
        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(progress * 100)}%`, barX + barWidth / 2, barY + 17);
    }

    async drawBadges(ctx, userData, rank) {
        const level = userData.level || 1;
        
        // Level badge
        const levelBadgeX = 780;
        const levelBadgeY = 50;
        const badgeSize = 80;

        ctx.fillStyle = this.colors.levelBackground;
        ctx.beginPath();
        ctx.arc(levelBadgeX, levelBadgeY, badgeSize / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.colors.text;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL', levelBadgeX, levelBadgeY - 8);
        ctx.font = 'bold 24px Arial';
        ctx.fillText(level.toString(), levelBadgeX, levelBadgeY + 15);

        // Rank badge
        const rankBadgeX = 780;
        const rankBadgeY = 150;

        ctx.fillStyle = this.colors.rankBackground;
        ctx.beginPath();
        ctx.arc(rankBadgeX, rankBadgeY, badgeSize / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.colors.text;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('RANK', rankBadgeX, rankBadgeY - 8);
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`#${rank}`, rankBadgeX, rankBadgeY + 12);
    }

    async drawDecorations(ctx) {
        // Decorative stars
        const stars = [
            { x: 820, y: 250, size: 8 },
            { x: 850, y: 230, size: 6 },
            { x: 800, y: 270, size: 4 },
            { x: 860, y: 260, size: 5 }
        ];

        ctx.fillStyle = this.colors.accent;
        stars.forEach(star => {
            this.drawStar(ctx, star.x, star.y, star.size);
        });

        // Corner decorations
        ctx.strokeStyle = this.colors.accentSecondary;
        ctx.lineWidth = 2;
        
        // Top left corner
        ctx.beginPath();
        ctx.moveTo(40, 60);
        ctx.lineTo(40, 40);
        ctx.lineTo(60, 40);
        ctx.stroke();
        
        // Bottom right corner
        ctx.beginPath();
        ctx.moveTo(this.width - 60, this.height - 40);
        ctx.lineTo(this.width - 40, this.height - 40);
        ctx.lineTo(this.width - 40, this.height - 60);
        ctx.stroke();
    }

    drawStar(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5;
            const x1 = x + Math.cos(angle) * size;
            const y1 = y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(x1, y1);
            else ctx.lineTo(x1, y1);
        }
        ctx.closePath();
        ctx.fill();
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    getXPForLevel(level) {
        const levels = {
            1: 0, 2: 100, 3: 250, 4: 500, 5: 1000,
            6: 1750, 7: 2750, 8: 4000, 9: 5500, 10: 7500,
            11: 10000, 12: 13000, 13: 16500, 14: 20500, 15: 25000
        };
        return levels[level] || (levels[15] + (level - 15) * 5000);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * Generate a leaderboard image
     * @param {Array} leaderboardData - Array of user data
     * @param {string} guildName - Server name
     * @returns {AttachmentBuilder} Discord attachment
     */
    async generateLeaderboardCard(leaderboardData, guildName) {
        const itemHeight = 100;
        const headerHeight = 120;
        const canvas = createCanvas(this.width, headerHeight + (leaderboardData.length * itemHeight) + 40);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header
        await this.drawLeaderboardHeader(ctx, guildName);

        // Leaderboard entries
        for (let i = 0; i < leaderboardData.length; i++) {
            const y = headerHeight + (i * itemHeight);
            await this.drawLeaderboardEntry(ctx, leaderboardData[i], i + 1, y);
        }

        const buffer = canvas.toBuffer('image/png');
        return new AttachmentBuilder(buffer, { name: 'leaderboard.png' });
    }

    async drawLeaderboardHeader(ctx, guildName) {
        // Header background
        const gradient = ctx.createLinearGradient(0, 0, this.width, 0);
        gradient.addColorStop(0, this.colors.accent);
        gradient.addColorStop(1, this.colors.accentSecondary);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, 120);

        // Title
        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 XP LEADERBOARD', this.width / 2, 50);

        // Server name
        ctx.font = '24px Arial';
        ctx.fillText(guildName, this.width / 2, 85);
    }

    async drawLeaderboardEntry(ctx, userData, rank, y) {
        const entryHeight = 100;
        
        // Alternating background colors
        ctx.fillStyle = rank % 2 === 0 ? this.colors.cardBackground : this.colors.background;
        ctx.fillRect(0, y, this.width, entryHeight);

        // Rank medal/number
        const medals = ['🥇', '🥈', '🥉'];
        const medal = medals[rank - 1] || `#${rank}`;
        
        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(medal, 60, y + 35);

        // Avatar placeholder (simplified for leaderboard)
        const avatarSize = 60;
        const avatarX = 120;
        const avatarY = y + 20;

        ctx.fillStyle = this.colors.accentSecondary;
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('👤', avatarX + avatarSize / 2, avatarY + avatarSize / 2 + 7);

        // User info
        ctx.textAlign = 'left';
        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 20px Arial';
        ctx.fillText(userData.username || 'Unknown User', 220, y + 30);

        ctx.fillStyle = this.colors.textSecondary;
        ctx.font = '16px Arial';
        ctx.fillText(`Level ${userData.level} • ${this.formatNumber(userData.xp)} XP`, 220, y + 55);
        ctx.fillText(`${userData.approved_submissions} submissions`, 220, y + 75);

        // Progress bar (mini)
        const currentXP = userData.xp || 0;
        const currentLevel = userData.level || 1;
        const xpForNextLevel = this.getXPForLevel(currentLevel + 1);
        const xpForCurrentLevel = this.getXPForLevel(currentLevel);
        const xpProgress = currentXP - xpForCurrentLevel;
        const xpNeeded = xpForNextLevel - xpForCurrentLevel;
        const progress = Math.max(0, Math.min(1, xpProgress / xpNeeded));

        const barX = 550;
        const barY = y + 40;
        const barWidth = 200;
        const barHeight = 20;

        ctx.fillStyle = this.colors.xpBarBackground;
        this.roundRect(ctx, barX, barY, barWidth, barHeight, 10);
        ctx.fill();

        if (progress > 0) {
            ctx.fillStyle = this.colors.xpBarFill;
            this.roundRect(ctx, barX, barY, barWidth * progress, barHeight, 10);
            ctx.fill();
        }

        // Level badge
        ctx.fillStyle = this.colors.levelBackground;
        ctx.beginPath();
        ctx.arc(800, y + 50, 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(userData.level.toString(), 800, y + 55);
    }
}
