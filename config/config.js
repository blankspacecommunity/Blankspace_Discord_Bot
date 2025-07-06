import 'dotenv/config';

export const config = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    
    // Bot configuration
    intents: [
        'Guilds'
    ],
    
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
            cancel: 'cancel_btn'
        },
        modals: {
            test: 'test_modal'
        },
        selectMenus: {
            test: 'test_select'
        }
    }
};