# 🚀 Discord Bot Deployment Checklist

## Pre-Deployment ✅

### Local Testing
- [ ] `npm run check` - Configuration check passes
- [ ] `npm run deploy` - Commands deploy successfully  
- [ ] `npm start` - Bot starts and connects to Discord
- [ ] `npm run health` - Health server starts on port 3000
- [ ] Test all commands work in Discord (`/ping`, `/hello`, `/info`, `/help`, `/test`)
- [ ] Health endpoints respond:
  - [ ] `http://localhost:3000/health` returns 200 OK
  - [ ] `http://localhost:3000/status` shows bot info

### Repository Preparation
- [ ] All files committed to Git
- [ ] Repository pushed to GitHub
- [ ] `.env` file is NOT committed (should be in `.gitignore`)
- [ ] `.env.example` shows required variables

## Render Deployment ☁️

### Render Setup
- [ ] Render account created
- [ ] **Web Service** created (NOT Background Worker)
- [ ] GitHub repository connected
- [ ] Build command set: `npm install && node deploy-commands.js`
- [ ] Start command set: `npm start`

### Environment Variables
- [ ] `DISCORD_TOKEN` - Your bot token
- [ ] `CLIENT_ID` - Your bot client ID  
- [ ] `NODE_ENV` - Set to `production`
- [ ] `PORT` - Render will set this automatically

### Deployment Verification
- [ ] Build completes successfully
- [ ] Logs show: "✅ Bot is ready! Logged in as YourBot#1234"
- [ ] Logs show: "🏥 Health check server running on port XXXX"
- [ ] Service shows "Live" status in Render dashboard
- [ ] Your app URL works: `https://yourapp.onrender.com/health`

## UptimeRobot Monitoring 📊

### UptimeRobot Setup
- [ ] UptimeRobot account created
- [ ] HTTP monitor added
- [ ] Monitor URL: `https://yourapp.onrender.com/health`
- [ ] Monitoring interval: 5 minutes
- [ ] Monitor shows "Up" status

### Optional Configurations
- [ ] Email alerts configured for downtime
- [ ] Status page created (optional)
- [ ] Multiple contact methods added

## Post-Deployment Testing 🧪

### Discord Testing
- [ ] Bot shows as online in Discord
- [ ] All slash commands work:
  - [ ] `/ping` - Shows latency
  - [ ] `/hello` - Greeting with embeds
  - [ ] `/info` - Bot information
  - [ ] `/help` - Help system
  - [ ] `/test` - Simple test command
- [ ] Commands appear when typing `/` in Discord
- [ ] No error messages in Discord

### Health Monitoring
- [ ] `https://yourapp.onrender.com/health` returns 200 OK
- [ ] `https://yourapp.onrender.com/status` shows detailed info
- [ ] `https://yourapp.onrender.com/` shows welcome message
- [ ] UptimeRobot reports 100% uptime

### Performance Verification
- [ ] Bot responds quickly to commands (< 3 seconds)
- [ ] Memory usage looks normal in Render logs
- [ ] No crash loops or restart cycles
- [ ] Health endpoints respond in < 1 second

## Troubleshooting 🔧

### Common Issues & Solutions

**❌ Build Failed**
- Check `package.json` is in repository root
- Verify all dependencies are listed
- Check Node.js version compatibility

**❌ Bot Not Online**
- Verify `DISCORD_TOKEN` is correct
- Check `CLIENT_ID` matches your bot
- Ensure bot has proper permissions

**❌ Commands Not Working**
- Wait 5-10 minutes for Discord cache
- Run `node deploy-commands.js` locally to verify
- Check bot has "Use Application Commands" permission

**❌ Health Check Failing**
- Ensure `NODE_ENV=production` is set
- Check Express is installed: `npm install express`
- Verify health server starts in logs

**❌ Service Sleeping (Free Tier)**
- Confirm UptimeRobot is pinging every 5 minutes
- Consider upgrading to Starter plan ($7/month)
- Check total monthly usage (750 hours limit)

## Success Indicators 🎉

You'll know everything is working when:

1. **Render Dashboard**: Shows service as "Live" 
2. **Discord**: Bot appears online and responds to commands
3. **UptimeRobot**: Shows 99%+ uptime
4. **Health Endpoints**: Return 200 OK responses
5. **Logs**: Show no errors, regular activity

## Maintenance 🔧

### Regular Tasks
- Monitor UptimeRobot for downtime alerts
- Check Render logs weekly for errors
- Update dependencies monthly: `npm update`
- Monitor usage to stay within free tier limits

### Upgrading
Consider upgrading to paid plans when:
- Free tier hours run out (750/month)
- Need guaranteed uptime (always-on)
- Require better performance
- Want priority support

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Discord.js Guide**: https://discordjs.guide/
- **UptimeRobot Help**: https://uptimerobot.com/help/
- **This Project**: Check `README.md` and `RENDER_DEPLOYMENT.md`

---

🎯 **Goal**: A Discord bot that's always online, monitored, and reliable!
