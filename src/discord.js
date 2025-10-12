const { Client, GatewayIntentBits } = require('discord.js');

class DiscordBot {
    constructor(config) {
        this.config = config;
        this.client = new Client({ 
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
        });

        this.setupEvents();
    }

    setupEvents() {
        this.client.once('ready', () => {
            console.log(`Bot is online as ${this.client.user.tag}!`);
            console.log(`Monitoring YouTube channel: ${this.config.channelId}`);
        });

        this.client.on('error', error => {
            console.error('Discord client error:', error);
        });
    }

    async login() {
        try {
            await this.client.login(this.config.discordBotToken);
        } catch (error) {
            console.error('Failed to login to Discord:', error);
            process.exit(1);
        }
    }

    async sendVideoNotification(video, type, url) {
        const title = video.snippet.title;
        
        const typeConfig = {
            video: { emoji: '🎥', messageTitle: 'New Video' },
            short: { emoji: '⚡', messageTitle: 'New Short' },
            live: { emoji: '🔴', messageTitle: 'New LiveStream' }
        };

        const { emoji, messageTitle } = typeConfig[type] || typeConfig.video;
        
        try {
            const channel = await this.client.channels.fetch(this.config.discordChannelId);
            await channel.send(`${emoji} **${messageTitle}** - ${title}\n${url}`);
            console.log(`Sent ${type}: ${title}`);
        } catch (error) {
            console.error('Error sending message to Discord:', error);
        }
    }

    getClient() {
        return this.client;
    }
}

module.exports = DiscordBot;