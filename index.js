const cron = require('node-cron');
const { config, validateConfig } = require('./src/config');
const YouTubeService = require('./src/youtube');
const DiscordWebhook = require('./src/discord');
const StorageService = require('./src/storage');
const HttpServer = require('./src/server');

class GrillGamersBot {
    constructor() {
        this.youtube = new YouTubeService(config);
        this.discord = new DiscordWebhook(config);
        this.storage = new StorageService();
        this.server = null;
    }

    async initialize() {
        const startTime = new Date().toISOString();
        console.log(`Bot started at ${startTime}`);
        validateConfig();

        await this.storage.initialize(); // Redis init

        this.server = new HttpServer(config);
        this.server.start();
        this.setupVideoMonitoring();
        console.log('Bot initialized successfully!');
    }

    setupVideoMonitoring() {
        cron.schedule(`*/${config.checkIntervalMinutes} * * * *`, () => {
            this.checkNewVideos().catch(console.error);
        });

        console.log(`Scheduled video checks every ${config.checkIntervalMinutes} minutes`);
    }

    async checkNewVideos() {
        try {
            const checkTime = new Date().toISOString();
            console.log(`[${checkTime}] Checking for new videos...`);

            const searchResults = await this.youtube.fetchVideos();
            if (!searchResults || searchResults.length === 0) {
                console.log('No videos returned from YouTube API');
                return;
            }

            const videoIds = searchResults.map(v => v.id.videoId).filter(Boolean);
            const details = await this.youtube.fetchVideoDetails(videoIds);

            const detailMap = {};
            for (const d of details) {
                detailMap[d.id] = d;
            }

            if (this.storage.isFirstRunCheck()) {
                console.log('First run - marking existing videos as processed (no notifications)');
                for (const video of searchResults) {
                    const videoId = video.id.videoId;
                    const detail = detailMap[videoId] || video;
                    const type = this.youtube.detectVideoType(detail);
                    const url = this.youtube.getVideoUrl(videoId, type);
                    await this.storage.markVideoAsProcessed(detail.id ? detail : video, type, url);
                }
                await this.storage.completeFirstRun();
                console.log(`Marked ${searchResults.length} existing videos as processed`);
                return;
            }

            const reversed = [...searchResults].reverse();
            for (const video of reversed) {
                const videoId = video.id.videoId;
                const publishedAt = new Date(video.snippet.publishedAt);
                const daysSincePublished = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24);

                if (!await this.storage.isVideoProcessed(videoId) && daysSincePublished <= 1) {
                    const detail = detailMap[videoId] || video;
                    const type = this.youtube.detectVideoType(detail);
                    const url = this.youtube.getVideoUrl(videoId, type);

                    console.log(`New ${type} detected: "${video.snippet.title}" (${videoId})`);
                    const sent = await this.discord.sendVideoNotification(detail.snippet ? detail : video, type, url);
                    if (sent) {
                        await this.storage.markVideoAsProcessed(detail.id ? detail : video, type, url);
                    }
                }
            }

            console.log('Check complete.');
        } catch (error) {
            console.error('Error checking new videos:', error.message);
        }
    }
}

const bot = new GrillGamersBot();
bot.initialize().catch(error => {
    console.error('Failed to initialize bot:', error);
    process.exit(1);
});