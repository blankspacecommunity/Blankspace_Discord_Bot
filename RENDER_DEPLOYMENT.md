# Discord Bot Render Deployment Guide 🚀

## Prerequisites
- ✅ Discord bot created in Discord Developer Portal
- ✅ Bot token and Client ID obtained
- ✅ GitHub repository with your bot code
- ✅ Render account (free at render.com)

## Step 1: Prepare Your Repository

1. **Ensure these files are in your repository:**
   ```
   ├── bot.js                  # Main bot file
   ├── health-server.js        # Health check server
   ├── deploy-commands.js      # Command deployment
   ├── package.json           # Dependencies
   ├── .env.example           # Environment template
   └── src/
       ├── commands/          # Your commands
       └── events/            # Your events
   ```

2. **Push to GitHub** (make sure all files are committed)

## Step 2: Create Render Web Service (NOT Background Worker)

Since we now have a health endpoint, we'll use a Web Service:

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**

## Step 3: Configure the Web Service

### Basic Settings:
- **Name**: `discord-bot-[your-name]`
- **Region**: Choose closest to your location
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave blank
- **Runtime**: `Node`

### Build & Deploy Settings:
- **Build Command**: 
  ```bash
  npm install && node deploy-commands.js
  ```
- **Start Command**: 
  ```bash
  npm start
  ```

### Advanced Settings:
- **Instance Type**: `Free` (or `Starter` for better reliability)
- **Auto-Deploy**: `Yes`

## Step 4: Environment Variables

In the Render dashboard, go to **Environment** tab and add:

| Key | Value | Notes |
|-----|-------|-------|
| `DISCORD_TOKEN` | Your bot token | From Discord Developer Portal |
| `CLIENT_ID` | Your bot client ID | From Discord Developer Portal |
| `NODE_ENV` | `production` | Enables health server |

**⚠️ IMPORTANT**: Do NOT set the `PORT` environment variable manually. Render automatically provides this variable and setting it yourself can cause port binding conflicts.

## Step 5: Deploy

1. **Click "Create Web Service"**
2. **Wait for deployment** (usually 2-5 minutes)
3. **Check logs** for:
   ```
   ✅ Bot is ready! Logged in as YourBot#1234
   🏥 Health check server running on port 10000
   ```

## Important: Port Binding Requirements

Render requires web services to:

- **Bind to host `0.0.0.0`** (not `localhost` or `127.0.0.1`)
- **Listen on the `PORT` environment variable** (defaults to `10000`)
- **Must respond to HTTP requests** within 30 seconds of startup

Your health server has been configured correctly to meet these requirements.

## Step 6: Test Your Deployment

Your service will have a URL like: `https://discord-bot-yourname.onrender.com`

Test endpoints:

- **Health Check**: `https://yourapp.onrender.com/health`
- **Status**: `https://yourapp.onrender.com/status`
- **Root**: `https://yourapp.onrender.com/`

## UptimeRobot Setup

### Step 1: Create UptimeRobot Account
1. Go to https://uptimerobot.com
2. Sign up for free account

### Step 2: Add Monitor
1. **Click "Add New Monitor"**
2. **Monitor Type**: HTTP(s)
3. **Friendly Name**: Discord Bot Health Check
4. **URL**: `https://yourapp.onrender.com/health`
5. **Monitoring Interval**: 5 minutes (free tier)

### Step 3: Configure Alerts (Optional)
- Add email notifications for downtime
- Set up status page if desired

## Troubleshooting

### Common Issues

1. **Build Failed**:
   - Check that `package.json` is in root directory
   - Verify all dependencies are listed
   - Check build logs for specific errors

2. **Bot Not Responding**:
   - Verify environment variables are set correctly
   - Check that commands were deployed (build logs should show this)
   - Wait 5-10 minutes for Discord command cache

3. **"No open ports detected" Error**:
   - **Most common issue**: Manual `PORT` environment variable set in Render
   - **Solution**: Remove any manually set `PORT` variable from Environment tab
   - Ensure `NODE_ENV=production` is set in environment variables
   - Verify health server is starting (check logs for "Health check server running")
   - Health server must bind to `0.0.0.0` (already fixed in your code)

4. **Health Check Failing**:
   - Ensure `NODE_ENV=production` is set
   - Check that Express is installed
   - Verify the health server is starting (check logs)

5. **Service Sleeping** (Free Tier):
   - Free tier services sleep after 15 minutes of inactivity
   - UptimeRobot pings every 5 minutes keep it awake
   - Consider upgrading to Starter plan for always-on

### Monitoring Your Bot:

1. **Render Dashboard**: Check deployment status and logs
2. **UptimeRobot**: Monitor uptime and response times
3. **Discord**: Test commands to verify functionality

## Free Tier Limitations

- **750 hours/month** (about 25 days)
- **Service sleeps** after 15 minutes of inactivity
- **Limited resources** (512MB RAM, 0.1 CPU)

## Upgrading to Paid Plan

For production bots, consider upgrading to:
- **Starter Plan**: $7/month, always-on, better resources
- **Standard Plan**: $25/month, more resources and features

## Commands to Test After Deployment

```bash
# In Discord, try these commands:
/ping     # Test basic functionality
/test     # Simple test command
/hello    # Test embed functionality
/info     # Test bot information
/help     # Test help system
```

## Success Checklist

- ✅ Bot shows as online in Discord
- ✅ All slash commands work
- ✅ Health endpoint returns 200 OK
- ✅ UptimeRobot shows service as up
- ✅ No errors in Render logs

---

🎉 **Your Discord bot is now hosted on Render with UptimeRobot monitoring!**
