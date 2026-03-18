let localConfig = {};
try {
    localConfig = require('../config.json');
} catch (error) {
    console.log('No local config.json found, using environment variables');
}

const config = {
    youtubeApiKey:       process.env.YOUTUBE_API_KEY        || localConfig.youtubeApiKey,
    channelId:           process.env.CHANNEL_ID             || localConfig.channelId,
    discordWebhookUrl:   process.env.DISCORD_WEBHOOK_URL    || localConfig.discordWebhookUrl,
    checkIntervalMinutes: process.env.CHECK_INTERVAL_MINUTES || localConfig.checkIntervalMinutes || 10,
    port:                process.env.PORT || 3000
};

function validateConfig() {
    const required = ['youtubeApiKey', 'channelId', 'discordWebhookUrl'];
    const missing = required.filter(key => !config[key]);

    if (missing.length > 0) {
        console.error(`Missing required configuration: ${missing.join(', ')}`);
        process.exit(1);
    }

    console.log('Configuration loaded successfully');
}

module.exports = { config, validateConfig };