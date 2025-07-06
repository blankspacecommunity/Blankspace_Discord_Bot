import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DatabaseManager {
    constructor() {
        this.db = new Database(path.join(__dirname, '..', '..', 'data', 'xp_system.db'));
        this.init();
    }

    init() {
        // Create tables if they don't exist
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT UNIQUE NOT NULL,
                guild_id TEXT NOT NULL,
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                total_submissions INTEGER DEFAULT 0,
                approved_submissions INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                xp_reward INTEGER NOT NULL,
                created_by TEXT NOT NULL,
                guild_id TEXT NOT NULL,
                active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                guild_id TEXT NOT NULL,
                task_id INTEGER,
                evidence TEXT NOT NULL,
                status TEXT DEFAULT 'PENDING',
                verified_by TEXT,
                verification_reason TEXT,
                xp_awarded INTEGER DEFAULT 0,
                submission_message_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks(id)
            );

            CREATE TABLE IF NOT EXISTS xp_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                guild_id TEXT NOT NULL,
                xp_change INTEGER NOT NULL,
                reason TEXT NOT NULL,
                granted_by TEXT,
                submission_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (submission_id) REFERENCES submissions(id)
            );

            CREATE INDEX IF NOT EXISTS idx_users_guild_user ON users(guild_id, user_id);
            CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
            CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id, guild_id);
            CREATE INDEX IF NOT EXISTS idx_xp_logs_user ON xp_logs(user_id, guild_id);
        `);
    }

    // User XP methods
    getUser(userId, guildId) {
        return this.db.prepare('SELECT * FROM users WHERE user_id = ? AND guild_id = ?').get(userId, guildId);
    }

    createUser(userId, guildId) {
        return this.db.prepare('INSERT INTO users (user_id, guild_id) VALUES (?, ?)').run(userId, guildId);
    }

    updateUserXP(userId, guildId, xp, level) {
        return this.db.prepare(`
            UPDATE users 
            SET xp = ?, level = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = ? AND guild_id = ?
        `).run(xp, level, userId, guildId);
    }

    addXP(userId, guildId, xpAmount, reason, grantedBy = null, submissionId = null) {
        const user = this.getUser(userId, guildId);
        if (!user) {
            this.createUser(userId, guildId);
        }

        const currentUser = this.getUser(userId, guildId);
        const newXP = currentUser.xp + xpAmount;
        const newLevel = this.calculateLevel(newXP);

        // Update user XP
        this.updateUserXP(userId, guildId, newXP, newLevel);

        // Log XP change
        this.db.prepare(`
            INSERT INTO xp_logs (user_id, guild_id, xp_change, reason, granted_by, submission_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(userId, guildId, xpAmount, reason, grantedBy, submissionId);

        return {
            oldXP: currentUser.xp,
            newXP: newXP,
            oldLevel: currentUser.level,
            newLevel: newLevel,
            levelUp: newLevel > currentUser.level
        };
    }

    calculateLevel(xp) {
        const levels = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000, 13000, 16500, 20500, 25000];
        
        for (let i = levels.length - 1; i >= 0; i--) {
            if (xp >= levels[i]) {
                return i + 1;
            }
        }
        return 1;
    }

    getXPForLevel(level) {
        const levels = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000, 13000, 16500, 20500, 25000];
        return levels[level - 1] || 0;
    }

    getLeaderboard(guildId, limit = 10) {
        return this.db.prepare(`
            SELECT user_id, xp, level, approved_submissions
            FROM users 
            WHERE guild_id = ? 
            ORDER BY xp DESC 
            LIMIT ?
        `).all(guildId, limit);
    }

    // Task methods
    createTask(title, description, xpReward, createdBy, guildId) {
        return this.db.prepare(`
            INSERT INTO tasks (title, description, xp_reward, created_by, guild_id)
            VALUES (?, ?, ?, ?, ?)
        `).run(title, description, xpReward, createdBy, guildId);
    }

    getTask(taskId) {
        return this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    }

    getAllActiveTasks(guildId) {
        return this.db.prepare('SELECT * FROM tasks WHERE guild_id = ? AND active = 1 ORDER BY created_at DESC').all(guildId);
    }

    deactivateTask(taskId) {
        return this.db.prepare('UPDATE tasks SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(taskId);
    }

    // Submission methods
    createSubmission(userId, guildId, taskId, evidence, messageId = null) {
        return this.db.prepare(`
            INSERT INTO submissions (user_id, guild_id, task_id, evidence, submission_message_id)
            VALUES (?, ?, ?, ?, ?)
        `).run(userId, guildId, taskId, evidence, messageId);
    }

    getSubmission(submissionId) {
        return this.db.prepare(`
            SELECT s.*, t.title as task_title, t.description as task_description, t.xp_reward as task_xp_reward
            FROM submissions s
            LEFT JOIN tasks t ON s.task_id = t.id
            WHERE s.id = ?
        `).get(submissionId);
    }

    getPendingSubmissions(guildId) {
        return this.db.prepare(`
            SELECT s.*, t.title as task_title, t.description as task_description, t.xp_reward as task_xp_reward
            FROM submissions s
            LEFT JOIN tasks t ON s.task_id = t.id
            WHERE s.guild_id = ? AND s.status = 'PENDING'
            ORDER BY s.created_at ASC
        `).all(guildId);
    }

    updateSubmissionStatus(submissionId, status, verifiedBy = null, reason = null, xpAwarded = 0) {
        return this.db.prepare(`
            UPDATE submissions 
            SET status = ?, verified_by = ?, verification_reason = ?, xp_awarded = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(status, verifiedBy, reason, xpAwarded, submissionId);
    }

    getUserSubmissions(userId, guildId) {
        return this.db.prepare(`
            SELECT s.*, t.title as task_title, t.description as task_description, t.xp_reward as task_xp_reward
            FROM submissions s
            LEFT JOIN tasks t ON s.task_id = t.id
            WHERE s.user_id = ? AND s.guild_id = ?
            ORDER BY s.created_at DESC
        `).all(userId, guildId);
    }

    // Statistics methods
    getUserStats(userId, guildId) {
        const user = this.getUser(userId, guildId);
        if (!user) return null;

        const totalSubmissions = this.db.prepare('SELECT COUNT(*) as count FROM submissions WHERE user_id = ? AND guild_id = ?').get(userId, guildId);
        const approvedSubmissions = this.db.prepare('SELECT COUNT(*) as count FROM submissions WHERE user_id = ? AND guild_id = ? AND status = ?').get(userId, guildId, 'APPROVED');
        const totalXPEarned = this.db.prepare('SELECT SUM(xp_change) as total FROM xp_logs WHERE user_id = ? AND guild_id = ? AND xp_change > 0').get(userId, guildId);

        return {
            ...user,
            total_submissions: totalSubmissions.count,
            approved_submissions: approvedSubmissions.count,
            total_xp_earned: totalXPEarned.total || 0
        };
    }

    close() {
        this.db.close();
    }
}

// Export singleton instance
export const database = new DatabaseManager();
