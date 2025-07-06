import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { EmbedUtils } from '../utils/embedUtils.js';
import { config } from '../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and shows latency!'),
    
    async execute(interaction) {
        const latency = Date.now() - interaction.createdTimestamp;
        const embed = EmbedUtils.createPongEmbed(latency);

        // Create buttons
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(config.components.buttons.showModal)
                    .setLabel('Show Modal')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(config.components.buttons.cancel)
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
            );

        // Create select menu
        const selectMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(config.components.selectMenus.test)
                    .setPlaceholder('Choose an option')
                    .addOptions([
                        {
                            label: 'Option 1',
                            description: 'This is the first option',
                            value: 'option1'
                        },
                        {
                            label: 'Option 2',
                            description: 'This is the second option',
                            value: 'option2'
                        },
                        {
                            label: 'Option 3',
                            description: 'This is the third option',
                            value: 'option3'
                        }
                    ])
            );

        await interaction.reply({
            embeds: [embed],
            components: [buttons, selectMenu]
        });
    }
};