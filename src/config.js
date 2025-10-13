let localConfig = {};
try {
    localConfig = require('../config.json');
} catch (error) {
    console.log('No local config.json found, using environment variables');
}

const config = {
    youtubeApiKey: process.env.YOUTUBE_API_KEY || localConfig.youtubeApiKey,
    channelId: process.env.CHANNEL_ID || localConfig.channelId,
    discordBotToken: process.env.DISCORD_BOT_TOKEN || localConfig.discordBotToken,
    discordChannelId: process.env.DISCORD_CHANNEL_ID || localConfig.discordChannelId,
    checkIntervalMinutes: process.env.CHECK_INTERVAL_MINUTES || localConfig.checkIntervalMinutes || 16,
    port: process.env.PORT || 3000
};
function validateConfig() {
    const required = ['youtubeApiKey', 'channelId', 'discordBotToken', 'discordChannelId'];
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
        console.error(`Missing required configuration: ${missing.join(', ')}`);
        process.exit(1);
    }
    
    console.log('Configuration loaded successfully');
}

module.exports = { config, validateConfig };