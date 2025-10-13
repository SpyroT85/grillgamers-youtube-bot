# GrillGamers YouTube Bot

A Discord bot that automatically notifies your server when new content is posted on the GrillGamers YouTube channel.

## What it does
- Watches the YouTube channel for new uploads
- Posts instant notifications to Discord for videos, shorts & livestreams  
- Prevents spam by only posting new content (not old videos on startup)
- Runs continuously in the cloud without manual intervention

## Quick Start

1. Clone and install:
```bash
git clone https://github.com/SpyroT85/grillgamers-youtube-bot.git
cd grillgamers-youtube-bot
npm install
```

2. Configure your API keys (see Environment Variables below)

3. Run the bot:
```bash
npm start
```

## Environment Variables

You'll need these API keys and IDs:

```env
YOUTUBE_API_KEY=your_youtube_api_key
CHANNEL_ID=UCf6O5PF9FjHiV-junEa27AQ
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CHANNEL_ID=your_discord_channel_id
CHECK_INTERVAL_MINUTES=5
RENDER_EXTERNAL_URL=https://your-app.onrender.com
```

**How to get them:**
- YouTube API Key: [Google Cloud Console](https://console.cloud.google.com/)
- Discord Bot Token: [Discord Developer Portal](https://discord.com/developers/applications)
- Channel IDs: Enable Developer Mode in Discord, right-click channels

## How it works

The bot checks the YouTube channel every 5 minutes for new content. When something new is found:
1. Detects if it's a video, short, or livestream
2. Posts a notification to your Discord channel
3. Remembers what was posted to avoid duplicates



## Tutorial Setup

1. Copy `.env.example` to `.env` and fill in your own API keys/IDs
2. Run `npm install` to install all dependencies
3. Run `npm start` to launch the bot

## Technologies Used

- Node.js
- discord.js
- axios
- node-cron
- Express (via http server)

## Error Handling & Reliability

- All secrets are loaded from environment variables (never hardcoded)
- Retry mechanism for YouTube API failures or rate limits
- Detailed logging for every important action (start, check, errors)
- Health endpoint (`/health`) for monitoring and debugging
- Self-ping for cloud hosting (Render, Railway, Fly.io)
- Protection against duplicate notifications via storage

## Screenshots / GIFs

> Add here images or GIFs showing the bot in action on Discord!

## Project Structure

```
src/
├── config.js    # Configuration loading
├── youtube.js   # YouTube API service  
├── discord.js   # Discord bot functions
├── storage.js   # Data persistence
└── server.js    # HTTP server for hosting
index.js         # Main entry point
```

## Cloud Deployment

Ready to deploy on cloud platforms like Render.com, Railway, or Fly.io. Includes:
- HTTP server for health checks
- Self-ping mechanism to prevent sleeping
- Environment-based configuration