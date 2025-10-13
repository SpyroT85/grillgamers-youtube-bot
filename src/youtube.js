const axios = require('axios');

class YouTubeService {
    constructor(config) {
        this.config = config;
    }

    async fetchVideos(retries = 3, delay = 1000) {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${this.config.youtubeApiKey}&channelId=${this.config.channelId}&part=snippet,id&order=date&maxResults=5`;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const res = await axios.get(url);
                return res.data.items;
            } catch (error) {
                const isRateLimit = error.response && error.response.status === 429;
                console.error(`Error fetching YouTube videos (attempt ${attempt}/${retries}):`, error.message);
                if (attempt < retries && (isRateLimit || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT')) {
                    const wait = delay * Math.pow(2, attempt - 1);
                    console.log(`Retrying in ${wait}ms...`);
                    await new Promise(res => setTimeout(res, wait));
                } else {
                    throw error;
                }
            }
        }
    }

    detectVideoType(video) {
        if (video.snippet.liveBroadcastContent === 'live') {
            return 'live';
        }
        if (video.snippet.title.toLowerCase().includes('short') || 
            video.id.kind === 'youtube#short') {
            return 'short';
        }
        if (video.snippet.liveBroadcastContent === 'upcoming' ||
            video.snippet.title.toLowerCase().includes('premiere')) {
            return 'premiere';
        }
        return 'video';
    }

    getVideoUrl(videoId, type) {
        const baseUrl = `https://www.youtube.com/watch?v=${videoId}`;
        return type === 'live' ? `${baseUrl}&live=1` : baseUrl;
    }

    getIntervalSeconds() {
        const interval = this.config.checkIntervalMinutes ? Number(this.config.checkIntervalMinutes) * 60 : 60;
        return interval;
    }
}

module.exports = YouTubeService;