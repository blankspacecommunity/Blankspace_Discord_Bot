import 'dotenv/config';

export const config = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    
    // Bot configuration
    intents: [
        'Guilds',
        'GuildMessages',
        'MessageContent'
    ],
    
    // XP System configuration
    xpSystem: {
        levels: {
            1: 0,
            2: 100,
            3: 250,
            4: 500,
            5: 1000,
            6: 1750,
            7: 2750,
            8: 4000,
            9: 5500,
            10: 7500,
            11: 10000,
            12: 13000,
            13: 16500,
            14: 20500,
            15: 25000
        },
        channels: {
            tasks: process.env.TASKS_CHANNEL_ID,
            submissions: process.env.SUBMISSIONS_CHANNEL_ID,
            verificationLogs: process.env.VERIFICATION_LOGS_CHANNEL_ID
        },
        roles: {
            moderator: process.env.MODERATOR_ROLE_ID,
            levelRoles: {
                5: process.env.LEVEL_5_ROLE_ID,
                10: process.env.LEVEL_10_ROLE_ID,
                15: process.env.LEVEL_15_ROLE_ID
            }
        },
        leaderboard: {
            maxEntries: 10
        }
    },
    
    // Command configuration
    commands: {
        ping: {
            name: 'ping',
            description: 'Replies with Pong and shows latency!'
        }
    },
    
    // Component IDs
    components: {
        buttons: {
            showModal: 'show_modal_btn',
            cancel: 'cancel_btn',
            approveSubmission: 'approve_submission',
            rejectSubmission: 'reject_submission'
        },
        modals: {
            test: 'test_modal',
            taskSubmission: 'task_submission_modal',
            verifySubmission: 'verify_submission_modal'
        },
        selectMenus: {
            test: 'test_select',
            taskSelect: 'task_select_menu'
        }
    }
};