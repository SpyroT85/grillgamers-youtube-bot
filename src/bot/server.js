const express = require('express');

class HttpServer {
    constructor(config, discordClient) {
        this.config = config;
        this.discordClient = discordClient;
        this.app = express();
        this.server = null;
    }

    start() {
        this.app.get('/', (req, res) => {
            res.send('GrillGamers YouTube Bot is running!');
        });
        this.server = this.app.listen(process.env.PORT || 3000, () => {
            console.log('HTTP server started for health checks.');
        });
        // Self ping to keep alive the bot
        setInterval(() => {
            if (this.config.renderExternalUrl) {
                require('axios').get(this.config.renderExternalUrl).catch(() => {});
            }
        }, 5 * 60 * 1000);
    }
}

module.exports = HttpServer;
