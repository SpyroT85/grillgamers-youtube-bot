const axios = require('axios');

class YouTubeService {
    constructor(config) {
        this.config = config;
    }

    async fetchVideos(retries = 3, delay = 1000) {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${this.config.youtubeApiKey}&channelId=${this.config.channelId}&part=snippet,id&order=date&maxResults=10&type=video`;

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

    async fetchVideoDetails(videoIds) {
        if (!videoIds || videoIds.length === 0) return [];
        const ids = videoIds.join(',');
        const url = `https://www.googleapis.com/youtube/v3/videos?key=${this.config.youtubeApiKey}&id=${ids}&part=contentDetails,snippet,liveStreamingDetails`;
        try {
            const res = await axios.get(url);
            return res.data.items;
        } catch (error) {
            console.error('Error fetching video details:', error.message);
            return [];
        }
    }
    parseDuration(iso) {
        if (!iso) return 999;
        const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return 999;
        const h = parseInt(match[1] || 0);
        const m = parseInt(match[2] || 0);
        const s = parseInt(match[3] || 0);
        return h * 3600 + m * 60 + s;
    }

    detectVideoType(detail) {
        const live = detail.snippet.liveBroadcastContent;

        if (live === 'live') return 'live';
        if (live === 'upcoming') return 'premiere';
        const duration = this.parseDuration(detail.contentDetails && detail.contentDetails.duration);
        if (duration <= 60) return 'short';

        return 'video';
    }

    getVideoUrl(videoId, type) {
        if (type === 'short') return `https://www.youtube.com/shorts/${videoId}`;
        if (type === 'live') return `https://www.youtube.com/watch?v=${videoId}&live=1`;
        return `https://www.youtube.com/watch?v=${videoId}`;
    }

    getIntervalSeconds() {
        return this.config.checkIntervalMinutes ? Number(this.config.checkIntervalMinutes) * 60 : 60;
    }
}

module.exports = YouTubeService;