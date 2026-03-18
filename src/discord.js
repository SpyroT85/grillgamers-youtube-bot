const axios = require('axios');

class DiscordWebhook {
    constructor(config) {
        this.webhookUrl = config.discordWebhookUrl;
    }

    async sendVideoNotification(video, type, url) {
        const title = video.snippet.title;

        const typeConfig = {
            video:    { emoji: '🎥', label: 'New video just dropped!' },
            short:    { emoji: '⚡', label: 'New Short!' },
            live:     { emoji: '🔴', label: 'Live and Loaded!' },
            premiere: { emoji: '🟣', label: "Something's Coming..." }
        };

        const { emoji, label } = typeConfig[type] || typeConfig.video;
        const mention = type === 'live' ? '@everyone\n' : '';

        const payload = {
            content: `${mention}${emoji} **${label}**\n**${title}**\n${url}`
        };

        try {
            await axios.post(this.webhookUrl, payload);
            console.log(`[Discord] Sent ${type}: ${title}`);
        } catch (error) {
            if (error.response) {
                console.error(`[Discord] Webhook error ${error.response.status}:`, error.response.data);
            } else {
                console.error('[Discord] Webhook error:', error.message);
            }
        }
    }
}

module.exports = DiscordWebhook;