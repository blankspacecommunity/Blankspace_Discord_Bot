import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { database } from '../utils/database.js';
import { XPManager } from '../utils/xpManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('tasks')
        .setDescription('View all available tasks')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number (default: 1)')
                .setRequired(false)
                .setMinValue(1)),

    async execute(interaction) {
        const page = interaction.options.getInteger('page') || 1;
        const itemsPerPage = 5;

        try {
            const allTasks = database.getAllActiveTasks(interaction.guild.id);
            
            if (allTasks.length === 0) {
                return await interaction.reply({
                    content: '📭 No active tasks available at the moment!',
                    ephemeral: true
                });
            }

            const totalPages = Math.ceil(allTasks.length / itemsPerPage);
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const tasks = allTasks.slice(startIndex, endIndex);

            const embed = new EmbedBuilder()
                .setTitle('📋 Available Tasks')
                .setColor(0x3498db)
                .setDescription(`Page ${page} of ${totalPages} • ${allTasks.length} total tasks`)
                .setTimestamp()
                .setFooter({ text: 'Complete tasks to earn XP and level up!' });

            for (const task of tasks) {
                let fieldValue = '';
                fieldValue += `**Description:** ${task.description}\n`;
                fieldValue += `**Reward:** ${XPManager.formatXP(task.xp_reward)} XP\n`;
                fieldValue += `**Created:** <t:${Math.floor(new Date(task.created_at).getTime() / 1000)}:R>`;

                try {
                    const creator = await interaction.client.users.fetch(task.created_by);
                    fieldValue += `\n**Created by:** ${creator.username}`;
                } catch (error) {
                    fieldValue += `\n**Created by:** Unknown`;
                }

                embed.addFields({
                    name: `🆔 ${task.id} • ${task.title}`,
                    value: fieldValue,
                    inline: false
                });
            }

            // Create components
            const components = [];
            
            // Submit button for first task
            if (tasks.length > 0) {
                const firstTask = tasks[0];
                const submitRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`submit_task_${firstTask.id}`)
                            .setLabel(`Submit Task #${firstTask.id}`)
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('📤')
                    );
                components.push(submitRow);
            }

            // Navigation buttons
            if (totalPages > 1) {
                const navRow = new ActionRowBuilder();
                
                if (page > 1) {
                    navRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`tasks_page_${page - 1}`)
                            .setLabel('Previous')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('⬅️')
                    );
                }
                
                if (page < totalPages) {
                    navRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`tasks_page_${page + 1}`)
                            .setLabel('Next')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('➡️')
                    );
                }
                
                if (navRow.components.length > 0) {
                    components.push(navRow);
                }
            }

            await interaction.reply({ 
                embeds: [embed], 
                components: components 
            });

        } catch (error) {
            console.error('Error fetching tasks:', error);
            await interaction.reply({
                content: '❌ Error fetching task data.',
                ephemeral: true
            });
        }
    }
};
