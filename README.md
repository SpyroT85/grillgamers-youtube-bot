# GrillGamers YouTube Bot

A Discord bot that automatically notifies your server when a new video, short, or live stream is published on a YouTube channel.

## How it works

A cron job runs every X minutes and queries the YouTube Data API for the latest uploads. Each result is checked against Upstash Redis to prevent duplicate notifications. When something new is found, a message is sent to Discord via Webhook. On first run, existing videos are silently marked as processed to avoid spam.

## Project Structure

```
📁 src/
    ├── config.js
    ├── youtube.js
    ├── discord.js
    ├── storage.js
    └── server.js
└── index.js
```

## Tech Stack

**Runtime & Language**
- Node.js: runtime environment
- JavaScript: language

**Libraries**
- axios: HTTP client used to call the YouTube API and send Discord Webhook requests
- node-cron: schedules the YouTube check every X minutes
- http: built-in Node.js module for the health check server

**APIs**
- YouTube Data API v3: fetches the latest videos, shorts, and live streams from the channel
- Discord Webhooks: posts notifications to a Discord channel without a bot account

**Storage**
- Upstash Redis: stores processed video IDs to prevent duplicate notifications

**Deployment**
- Render.com: cloud hosting, pings its own `/health` endpoint every 10 minutes to stay alive on the free tier

## Environment Variables

```env
CHANNEL_ID=
CHECK_INTERVAL_MINUTES=
DISCORD_WEBHOOK_URL=
RENDER_EXTERNAL_URL=
UPSTASH_REDIS_REST_TOKEN=
UPSTASH_REDIS_REST_URL=
YOUTUBE_API_KEY=
```

## Setup

```bash
git clone https://github.com/SpyroT85/grillgamers-youtube-bot
npm install
npm start
```