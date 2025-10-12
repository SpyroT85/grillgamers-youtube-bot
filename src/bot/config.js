const fs = require('fs');
const path = require('path');

function loadConfig() {
    let config = {};
    config.youtubeApiKey = process.env.YOUTUBE_API_KEY || '';
    config.channelId = process.env.CHANNEL_ID || '';
    config.discordBotToken = process.env.DISCORD_BOT_TOKEN || '';
    config.discordChannelId = process.env.DISCORD_CHANNEL_ID || '';
    config.checkIntervalMinutes = parseInt(process.env.CHECK_INTERVAL_MINUTES || '5', 10);
    config.renderExternalUrl = process.env.RENDER_EXTERNAL_URL || '';
    config.adminRoleId = process.env.ADMIN_ROLE_ID || '';
    config.adminChannelId = process.env.ADMIN_CHANNEL_ID || '';
    try {
        const fileConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config/config.json'), 'utf8'));
        config = { ...config, ...fileConfig };
    } catch {}
    return config;
}

const config = loadConfig();

function validateConfig() {
    if (!config.youtubeApiKey || !config.channelId || !config.discordBotToken || !config.discordChannelId) {
        throw new Error('Missing required configuration.');
    }
}

module.exports = { config, validateConfig };
