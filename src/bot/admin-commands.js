const { SlashCommandBuilder } = require('discord.js');

class AdminCommands {
    constructor(config, storage) {
        this.config = config;
        this.storage = storage;
        this.client = null;
    }

    setClient(client) {
        this.client = client;
    }

    registerCommands() {
        if (!this.client) return;
        const commands = [
            new SlashCommandBuilder().setName('bot-enable').setDescription('Enable the YouTube bot'),
            new SlashCommandBuilder().setName('bot-disable').setDescription('Disable the YouTube bot'),
            new SlashCommandBuilder().setName('bot-status').setDescription('Check if the bot is enabled')
        ];
        this.client.application.commands.set(commands);
    }

    async handleSlashCommand(interaction) {
        // Restrict to admin role and channel
        if (interaction.channelId !== this.config.adminChannelId) {
            await interaction.reply({ content: '⛔ Only in #admin-commands channel!', ephemeral: true });
            return;
        }
        if (!interaction.member.roles.cache.has(this.config.adminRoleId)) {
            await interaction.reply({ content: '⛔ You do not have permission!', ephemeral: true });
            return;
        }
        if (interaction.commandName === 'bot-enable') {
            this.storage.setBotEnabled(true);
            await interaction.reply('✅ Bot enabled!');
        } else if (interaction.commandName === 'bot-disable') {
            this.storage.setBotEnabled(false);
            await interaction.reply('⛔ Bot disabled!');
        } else if (interaction.commandName === 'bot-status') {
            const enabled = this.storage.isBotEnabled();
            await interaction.reply(`Bot status: ${enabled ? '✅ enabled' : '⛔ disabled'}`);
        }
    }
}

module.exports = AdminCommands;
