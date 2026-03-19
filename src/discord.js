const axios = require('axios');

class DiscordWebhook {
    constructor(config) {
        this.webhookUrl = config.discordWebhookUrl;
    }

    async sendVideoNotification(video, type, url) {
        const title = video.snippet.title;

        const typeConfig = {
            video:    { emoji: '🎬', label: 'New video just dropped!' },
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
            return true;
        } catch (error) {
            if (error.response?.status === 429) {
                const retryAfter = error.response.data?.retry_after || 60;
                console.log(`[Discord] Rate limited - retrying after ${retryAfter}s`);
                await new Promise(res => setTimeout(res, retryAfter * 1000));
                try {
                    await axios.post(this.webhookUrl, payload);
                    console.log(`[Discord] Sent ${type} after retry: ${title}`);
                    return true;
                } catch (retryError) {
                    console.error('[Discord] Failed after retry:', retryError.message);
                    return false;
                }
            } else if (error.response) {
                console.error(`[Discord] Webhook error ${error.response.status}:`, error.response.data);
                return false;
            } else {
                console.error('[Discord] Webhook error:', error.message);
                return false;
            }
        }
    }
}

module.exports = DiscordWebhook;