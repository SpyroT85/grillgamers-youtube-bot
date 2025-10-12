const axios = require('axios');

class YouTubeService {
    constructor(config) {
        this.apiKey = config.youtubeApiKey;
        this.channelId = config.channelId;
    }

    async fetchVideos() {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${this.apiKey}&channelId=${this.channelId}&part=snippet,id&order=date&maxResults=5`;
        const response = await axios.get(url);
        return response.data.items.filter(item => item.id.videoId);
    }

    detectVideoType(video) {
        const title = video.snippet.title.toLowerCase();
        if (title.includes('live') || video.snippet.liveBroadcastContent === 'live') return 'live';
        if (video.id.kind === 'youtube#video' && video.snippet.categoryId === '27') return 'short';
        return 'video';
    }

    getVideoUrl(videoId, type) {
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
}

module.exports = YouTubeService;
