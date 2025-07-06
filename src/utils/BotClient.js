import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from '../../config/config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BotClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds
            ]
        });

        this.commands = new Collection();
        this.components = {
            buttons: new Collection(),
            modals: new Collection(),
            selectMenus: new Collection()
        };
    }

    async loadCommands() {
        const commandsPath = path.join(__dirname, '..', 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const fileUrl = pathToFileURL(filePath).href;
            
            try {
                const command = await import(fileUrl);
                this.commands.set(command.default.data.name, command.default);
            } catch (error) {
                console.error(`Error loading command ${file}:`, error);
            }
        }
    }

    async loadComponents() {
        const componentsPath = path.join(__dirname, '..', 'components');
        
        // Load buttons
        const buttonsPath = path.join(componentsPath, 'buttons');
        if (fs.existsSync(buttonsPath)) {
            const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
            
            for (const file of buttonFiles) {
                const filePath = path.join(buttonsPath, file);
                const fileUrl = pathToFileURL(filePath).href;
                
                try {
                    const button = await import(fileUrl);
                    this.components.buttons.set(button.default.customId, button.default);
                } catch (error) {
                    console.error(`Error loading button ${file}:`, error);
                }
            }
        }

        // Load modals
        const modalsPath = path.join(componentsPath, 'modals');
        if (fs.existsSync(modalsPath)) {
            const modalFiles = fs.readdirSync(modalsPath).filter(file => file.endsWith('.js'));
            
            for (const file of modalFiles) {
                const filePath = path.join(modalsPath, file);
                const fileUrl = pathToFileURL(filePath).href;
                
                try {
                    const modal = await import(fileUrl);
                    this.components.modals.set(modal.default.customId, modal.default);
                } catch (error) {
                    console.error(`Error loading modal ${file}:`, error);
                }
            }
        }

        // Load select menus
        const selectMenusPath = path.join(componentsPath, 'selectMenus');
        if (fs.existsSync(selectMenusPath)) {
            const selectFiles = fs.readdirSync(selectMenusPath).filter(file => file.endsWith('.js'));
            
            for (const file of selectFiles) {
                const filePath = path.join(selectMenusPath, file);
                const fileUrl = pathToFileURL(filePath).href;
                
                try {
                    const selectMenu = await import(fileUrl);
                    this.components.selectMenus.set(selectMenu.default.customId, selectMenu.default);
                } catch (error) {
                    console.error(`Error loading select menu ${file}:`, error);
                }
            }
        }
    }

    async loadEvents() {
        const eventsPath = path.join(__dirname, '..', 'events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const fileUrl = pathToFileURL(filePath).href;
            
            try {
                const event = await import(fileUrl);
                
                if (event.default.once) {
                    this.once(event.default.name, (...args) => event.default.execute(...args));
                } else {
                    this.on(event.default.name, (...args) => event.default.execute(...args));
                }
            } catch (error) {
                console.error(`Error loading event ${file}:`, error);
            }
        }
    }

    async initialize() {
        await this.loadCommands();
        await this.loadComponents();
        await this.loadEvents();
        
        await this.login(config.token);
    }
}