const fs = require('fs');

class StorageService {
    constructor() {
        this.lastVideosFile = 'lastVideos.json';
        this.lastVideos = this.loadLastVideos();
        this.isFirstRun = Object.keys(this.lastVideos).length === 0;
    }

    loadLastVideos() {
        try {
            // First try to load from memory/env (for cloud persistence)
            if (process.env.LAST_VIDEOS_DATA) {
                return JSON.parse(process.env.LAST_VIDEOS_DATA);
            }
            
            // Fallback to file system
            if (fs.existsSync(this.lastVideosFile)) {
                return JSON.parse(fs.readFileSync(this.lastVideosFile, 'utf8'));
            }
        } catch (error) {
            console.error('Error loading lastVideos:', error.message);
        }
        return {};
    }

    saveLastVideos() {
        try {
            fs.writeFileSync(this.lastVideosFile, JSON.stringify(this.lastVideos, null, 2));
        } catch (error) {
            console.error('Error saving lastVideos.json:', error.message);
        }
    }

    isVideoProcessed(videoId) {
        return !!this.lastVideos[videoId];
    }

    markVideoAsProcessed(video, type, url) {
        const id = video.id.videoId;
        this.lastVideos[id] = {
            title: video.snippet.title,
            publishedAt: video.snippet.publishedAt,
            type: type,
            sentAt: new Date().toISOString(),
            url: url
        };
        this.saveLastVideos();
        
        // Store in memory for cloud persistence
        process.env.LAST_VIDEOS_DATA = JSON.stringify(this.lastVideos);
    }

    // Check if this is first run to prevent spam
    isFirstRunCheck() {
        return this.isFirstRun;
    }

    getProcessedVideos() {
        return this.lastVideos;
    }
}

module.exports = StorageService;