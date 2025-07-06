import { config } from '../../config/config.js';
import { database } from './database.js';

export class XPManager {
    static calculateLevel(xp) {
        const levels = config.xpSystem.levels;
        const levelEntries = Object.entries(levels).sort((a, b) => parseInt(b[1]) - parseInt(a[1]));
        
        for (const [level, requiredXP] of levelEntries) {
            if (xp >= requiredXP) {
                return parseInt(level);
            }
        }
        return 1;
    }

    static getXPForLevel(level) {
        return config.xpSystem.levels[level] || 0;
    }

    static getNextLevelXP(currentLevel) {
        const nextLevel = currentLevel + 1;
        return config.xpSystem.levels[nextLevel] || null;
    }

    static getXPProgress(currentXP, currentLevel) {
        const currentLevelXP = this.getXPForLevel(currentLevel);
        const nextLevelXP = this.getNextLevelXP(currentLevel);
        
        if (!nextLevelXP) {
            return { progress: 100, needed: 0, current: currentXP - currentLevelXP };
        }

        const progressXP = currentXP - currentLevelXP;
        const neededXP = nextLevelXP - currentLevelXP;
        const progressPercentage = Math.floor((progressXP / neededXP) * 100);

        return {
            progress: progressPercentage,
            needed: nextLevelXP - currentXP,
            current: progressXP,
            total: neededXP
        };
    }

    static async awardXP(userId, guildId, amount, reason, grantedBy = null, submissionId = null) {
        const result = database.addXP(userId, guildId, amount, reason, grantedBy, submissionId);
        
        // Check if user leveled up and needs role updates
        if (result.levelUp) {
            await this.handleLevelUp(userId, guildId, result.newLevel);
        }

        return result;
    }

    static async handleLevelUp(userId, guildId, newLevel) {
        // This would handle role assignments for level milestones
        // Implementation depends on how you want to handle role rewards
        const levelRoles = config.xpSystem.roles.levelRoles;
        
        if (levelRoles[newLevel]) {
            // You would implement role assignment logic here
            console.log(`User ${userId} reached level ${newLevel} and should get role ${levelRoles[newLevel]}`);
        }
    }

    static async getUserProfile(userId, guildId) {
        let user = database.getUser(userId, guildId);
        
        if (!user) {
            database.createUser(userId, guildId);
            user = database.getUser(userId, guildId);
        }

        const stats = database.getUserStats(userId, guildId);
        const progress = this.getXPProgress(user.xp, user.level);

        return {
            ...stats,
            progress
        };
    }

    static async getLeaderboard(guildId, limit = 10) {
        return database.getLeaderboard(guildId, limit);
    }

    static isValidXPAmount(amount) {
        return Number.isInteger(amount) && amount > 0 && amount <= 1000;
    }

    static async createTask(title, description, xpReward, createdBy, guildId) {
        if (!this.isValidXPAmount(xpReward)) {
            throw new Error('XP reward must be a positive integer between 1 and 1000');
        }

        return database.createTask(title, description, xpReward, createdBy, guildId);
    }

    static async submitTask(userId, guildId, taskId, evidence, messageId = null) {
        const task = database.getTask(taskId);
        if (!task || !task.active) {
            throw new Error('Task not found or not active');
        }

        return database.createSubmission(userId, guildId, taskId, evidence, messageId);
    }

    static async verifySubmission(submissionId, isApproved, verifiedBy, reason = null, customXP = null) {
        const submission = database.getSubmission(submissionId);
        if (!submission) {
            throw new Error('Submission not found');
        }

        if (submission.status !== 'PENDING') {
            throw new Error('Submission has already been processed');
        }

        const status = isApproved ? 'APPROVED' : 'REJECTED';
        const xpAwarded = isApproved ? (customXP || submission.task_xp_reward || 0) : 0;

        // Update submission status
        database.updateSubmissionStatus(submissionId, status, verifiedBy, reason, xpAwarded);

        // Award XP if approved
        let xpResult = null;
        if (isApproved && xpAwarded > 0) {
            xpResult = await this.awardXP(
                submission.user_id,
                submission.guild_id,
                xpAwarded,
                reason || `Task completion: ${submission.task_title}`,
                verifiedBy,
                submissionId
            );

            // Update user submission stats
            const user = database.getUser(submission.user_id, submission.guild_id);
            database.db.prepare(`
                UPDATE users 
                SET approved_submissions = approved_submissions + 1, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND guild_id = ?
            `).run(submission.user_id, submission.guild_id);
        }

        return {
            submission: database.getSubmission(submissionId),
            xpResult
        };
    }

    static formatXP(xp) {
        return xp.toLocaleString();
    }

    static formatLevel(level) {
        return `Level ${level}`;
    }

    static createProgressBar(progress, length = 10) {
        const filled = Math.floor((progress / 100) * length);
        const empty = length - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }
}
