const axios = require('axios');

class YouTubeService {
    constructor(config) {
        this.config = config;
    }

    async fetchVideos() {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${this.config.youtubeApiKey}&channelId=${this.config.channelId}&part=snippet,id&order=date&maxResults=5`;
        try {
            const res = await axios.get(url);
            return res.data.items;
        } catch (error) {
            console.error('Error fetching YouTube videos:', error.message);
            throw error;
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
        
        return 'video';
    }

    getVideoUrl(videoId, type) {
        const baseUrl = `https://www.youtube.com/watch?v=${videoId}`;
        return type === 'live' ? `${baseUrl}&live=1` : baseUrl;
    }
}

module.exports = YouTubeService;