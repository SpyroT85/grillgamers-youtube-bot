const http = require('http');
const https = require('https');

class HttpServer {
    constructor(config) {
        this.config = config;
        this.server = null;
        this.keepAliveInterval = null;
    }

    start() {
        this.server = http.createServer((req, res) => {
            if (req.url === '/health' || req.url === '/healthz') {
                console.log(`[${new Date().toISOString()}] Health check requested`);
                this.handleHealthCheck(res);
            } else {
                this.handleRoot(res);
            }
        });

        this.server.listen(this.config.port, () => {
            console.log(`HTTP server running on port ${this.config.port}`);
            this.startKeepAlive();
        });

        return this.server;
    }

    handleHealthCheck(res) {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(health, null, 2));
    }

    handleRoot(res) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('GrillGamers YouTube Discord Bot is running!');
    }

    startKeepAlive() {
        if (process.env.RENDER_EXTERNAL_URL) {
            this.keepAliveInterval = setInterval(() => {
                const url = `${process.env.RENDER_EXTERNAL_URL}/health`;
                console.log(`[${new Date().toISOString()}] Keep-alive ping: ${url}`);
                https.get(url, (res) => {
                    console.log(`[${new Date().toISOString()}] Keep-alive: ${res.statusCode}`);
                }).on('error', (err) => {
                    console.log(`[${new Date().toISOString()}] Keep-alive error:`, err.message);
                });
            }, 10 * 60 * 1000);
            console.log('Keep-alive started (10min intervals)');
        }
    }

    stop() {
        if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
        if (this.server) this.server.close(() => console.log('HTTP server stopped'));
    }
}

module.exports = HttpServer;