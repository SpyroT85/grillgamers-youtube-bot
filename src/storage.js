const https = require('https');

class StorageService {
    constructor() {
        this.baseUrl = process.env.UPSTASH_REDIS_REST_URL;
        this.token = process.env.UPSTASH_REDIS_REST_TOKEN;
        this.isFirstRun = false;
    }

    async request(commands) {
        return new Promise((resolve, reject) => {
            const body = JSON.stringify(commands);
            const url = new URL(this.baseUrl);
            const options = {
                hostname: url.hostname,
                path: '/',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                }
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            });
            req.on('error', reject);
            req.write(body);
            req.end();
        });
    }

    async initialize() {
        const result = await this.request(['EXISTS', 'initialized']);
        this.isFirstRun = result.result === 0;
        if (this.isFirstRun) {
            console.log('[Storage] First run mode active');
        } else {
            console.log('[Storage] Existing data found - normal mode');
        }
    }

    async isVideoProcessed(videoId) {
        const result = await this.request(['SISMEMBER', 'processed_videos', videoId]);
        return result.result === 1;
    }

    async markVideoAsProcessed(video, type, url) {
        const videoId = video.id?.videoId || video.id;
        await this.request(['SADD', 'processed_videos', videoId]);
    }

    isFirstRunCheck() {
        return this.isFirstRun;
    }

    async completeFirstRun() {
        this.isFirstRun = false;
        await this.request(['SET', 'initialized', '1']);
        console.log('[Storage] First run complete - initialized key set');
    }
}

module.exports = StorageService;