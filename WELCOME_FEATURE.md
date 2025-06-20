# Welcome Message Feature

This document outlines the implementation of the welcome message feature that sends an embed with an image when new users join the server.

## Changes Made

1. **Added GuildMemberAdd Event Handler**
   - Created `src/events/guildMemberAdd.js` which triggers when a new member joins
   - Sends a welcome embed to the designated welcome channel

2. **Updated Bot Configuration**
   - Added `GuildIntentBits.GuildMembers` intent to enable member join events

## Configuration

The welcome message is configured to be sent to channel ID: `1384956181067337809`

If you need to customize the welcome message, you can edit the following in `src/events/guildMemberAdd.js`:

- Channel ID
- Message content
- Embed appearance (colors, text, etc.)
- Welcome image

### Changing the Welcome Image

To use your own welcome image or GIF:

1. Upload your image to an image hosting service like Imgur
2. Copy the direct image link
3. Replace the URL in this line in `src/events/guildMemberAdd.js`:

   ```javascript
   .setImage('https://i.imgur.com/nTjrj8U.gif')
   ```

## Testing

You can test this feature in two ways:

### Manual Testing

1. Make sure your bot is running
2. Have a test user join your server
3. The welcome message should appear in the welcome channel

### Automated Testing

We've added test scripts to simulate a member join event:

1. Run the simple welcome test:

   ```bash
   npm run test:welcome
   # or directly: node test-welcome.js
   ```

2. Run the comprehensive bot test suite:

   ```bash
   npm test
   # or directly: node test-bot.js
   ```

For more detailed testing instructions, see `WELCOME_TESTING.md`.

## Troubleshooting

If welcome messages aren't being sent:

1. Verify the bot has appropriate permissions in the welcome channel
2. Check console logs for any errors
3. Make sure the channel ID is correct
4. Confirm the GuildMembers intent is enabled
