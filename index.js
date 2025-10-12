const cron = require('node-cron');
const { config, validateConfig } = require('./src/bot/config');
const YouTubeService = require('./src/bot/youtube');
const DiscordBot = require('./src/bot/discord');
const StorageService = require('./src/bot/storage');
const HttpServer = require('./src/bot/server');

// Main bot class that handles YouTube monitoring and Discord notifications
class GrillGamersBot {
    constructor() {
        this.youtube = new YouTubeService(config);
        this.storage = new StorageService();
        this.discord = new DiscordBot(config, this.storage);
        this.server = null;
    }

    async initialize() {
        console.log('Starting GrillGamers YouTube Discord Bot...');
        
        validateConfig();
        
        await this.discord.login();
        
        // Start web server for health checks and keep-alive
        this.server = new HttpServer(config, this.discord.getClient());
        this.server.start();
        
        // Setup the YouTube video checking schedule
        this.setupVideoMonitoring();
        console.log('Bot initialized successfully!');
    }

    setupVideoMonitoring() {
        // Check for new videos immediately on startup
        this.checkNewVideos().catch(console.error);
        
        // Schedule regular checks using cron
        cron.schedule(`*/${config.checkIntervalMinutes} * * * *`, () => {
            this.checkNewVideos().catch(console.error);
        });
        
        console.log(`Scheduled video checks every ${config.checkIntervalMinutes} minutes`);
    }

    async checkNewVideos() {
        try {
            // Check if bot is enabled
            if (!this.storage.isBotEnabled()) {
                console.log('Bot is disabled - skipping video check');
                return;
            }

            const videos = await this.youtube.fetchVideos();
            
            // Skip old videos on first run
            if (this.storage.isFirstRunCheck()) {
                console.log('First run detected - marking existing videos as processed to prevent spam');
                for (let video of videos) {
                    const videoId = video.id.videoId;
                    const type = this.youtube.detectVideoType(video);
                    const url = this.youtube.getVideoUrl(videoId, type);
                    this.storage.markVideoAsProcessed(video, type, url);
                }
                console.log(`Marked ${videos.length} existing videos as processed`);
                return;
            }
            
            // Process videos in chronological order (oldest first)
            for (let video of videos.reverse()) {
                const videoId = video.id.videoId;
                
                // Only send notification for videos we haven't seen before
                if (!this.storage.isVideoProcessed(videoId)) {
                    const type = this.youtube.detectVideoType(video);
                    const url = this.youtube.getVideoUrl(videoId, type);
                    
                    await this.discord.sendVideoNotification(video, type, url);
                    this.storage.markVideoAsProcessed(video, type, url);
                }
            }
        } catch (error) {
            console.error('Error checking new videos:', error.message);
        }
    }
}

// start the bot
const bot = new GrillGamersBot();
bot.initialize().catch(error => {
    console.error('Failed to initialize bot:', error);
    process.exit(1);
});
