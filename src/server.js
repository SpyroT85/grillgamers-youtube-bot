const http = require('http');
const https = require('https');

class HttpServer {
    constructor(config, discordClient) {
        this.config = config;
        this.discordClient = discordClient;
        this.server = null;
        this.keepAliveInterval = null;
        this.lastActivity = null;
    }

    start() {
        this.server = http.createServer((req, res) => {
            if (req.url === '/health' || req.url === '/healthz') {
                console.log(`[${new Date().toISOString()}] Health check requested.`);
                this.handleHealthCheck(res);
            } else {
                console.log(`[${new Date().toISOString()}] Root requested.`);
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
        const healthStatus = {
            status: 'healthy',
            bot: this.discordClient && this.discordClient.user ? 'online' : 'connecting',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            lastActivity: this.lastActivity || 'N/A'
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(healthStatus, null, 2));
    }

    handleRoot(res) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('GrillGamers YouTube Discord Bot is running!');
    }

    startKeepAlive() {
        // self ping every 10 minutes to prevent render.com from sleeping
        if (process.env.RENDER_EXTERNAL_URL) {
            this.keepAliveInterval = setInterval(() => {
                const url = `${process.env.RENDER_EXTERNAL_URL}/health`;
                console.log(`[${new Date().toISOString()}] Keep-alive ping to: ${url}`);
                https.get(url, (res) => {
                    console.log(`[${new Date().toISOString()}] Keep-alive response: ${res.statusCode}`);
                }).on('error', (err) => {
                    console.log(`[${new Date().toISOString()}] Keep-alive error:`, err.message);
                });
            }, 10 * 60 * 1000); // 10 minutes
            console.log('Keep-alive mechanism started (10min intervals)');
        }
    }

    stop() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
        }
        if (this.server) {
            this.server.close(() => {
                console.log('HTTP server stopped.');
            });
        }
    }
}

module.exports = HttpServer;