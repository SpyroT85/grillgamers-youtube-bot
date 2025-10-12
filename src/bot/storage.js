const fs = require('fs');
const path = require('path');

class StorageService {
    constructor() {
        this.stateFile = path.join(__dirname, '../../data/lastVideos.json');
        this.state = this.loadState();
        this.enabledFile = path.join(__dirname, '../../data/botEnabled.json');
        this.enabled = this.loadEnabled();
        this.firstRun = true;
    }

    loadState() {
        try {
            return JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
        } catch {
            return {};
        }
    }

    saveState() {
        fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
    }

    isVideoProcessed(videoId) {
        return !!this.state[videoId];
    }

    markVideoAsProcessed(video, type, url) {
        this.state[video.id.videoId] = {
            title: video.snippet.title,
            publishedAt: video.snippet.publishedAt,
            type,
            sentAt: new Date().toISOString(),
            url
        };
        this.saveState();
    }

    isFirstRunCheck() {
        if (this.firstRun) {
            this.firstRun = false;
            return true;
        }
        return false;
    }

    loadEnabled() {
        try {
            return JSON.parse(fs.readFileSync(this.enabledFile, 'utf8')).enabled;
        } catch {
            return true;
        }
    }

    saveEnabled() {
        fs.writeFileSync(this.enabledFile, JSON.stringify({ enabled: this.enabled }, null, 2));
    }

    isBotEnabled() {
        return this.enabled;
    }

    setBotEnabled(val) {
        this.enabled = val;
        this.saveEnabled();
    }
}

module.exports = StorageService;
