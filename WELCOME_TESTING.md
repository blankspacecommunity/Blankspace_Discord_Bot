# Testing the Welcome Message Feature

This document provides instructions for testing the welcome message feature of your Discord bot.

## Test Options

There are two options to test the welcome feature:

### Option 1: Simple Welcome Message Test

Run the basic test script:

```bash
node test-welcome.js
```

This will:

1. Start your bot
2. Find the welcome channel
3. Simulate a new member joining (using the bot itself)
4. Send a welcome message to the welcome channel
5. Ask you to confirm if the message was received correctly

### Option 2: Comprehensive Bot Test Suite

Run the comprehensive test suite:

```bash
node test-bot.js
```

This interactive test suite offers multiple test options:

1. **Welcome Message Test** - Tests the welcome message functionality
2. **Bot Permissions Check** - Checks if the bot has all necessary permissions
3. **Channel Verification** - Verifies all channel references in the welcome message
4. **Environment Setup Check** - Checks configuration and required files

## What to Look For

When testing the welcome message, verify:

1. The welcome message appears in channel <#1384956181067337809>
2. The message includes:
   - A greeting with the member's username
   - An embed with instructions
   - The Blankspace image/logo
   - Proper formatting
   - Working channel links

## Troubleshooting

If the welcome message doesn't appear:

1. **Check Permissions**: Ensure the bot has permission to send messages and embeds in the welcome channel
2. **Verify Channel ID**: Make sure the welcome channel ID in `guildMemberAdd.js` is correct
3. **Check Bot Intents**: Verify the bot has the `GuildMembers` intent enabled in `bot.js`
4. **Check for Errors**: Look for error messages in the console output
5. **Image Issues**: If the image doesn't appear, check if the image URL is valid and accessible

## Actual Member Testing

The ultimate test is when an actual user joins your server:

1. Ask a friend to join your server
2. Watch the welcome channel for the welcome message
3. Verify all aspects of the welcome message appear correctly

Remember, you can always update the welcome message content, image, or formatting in `src/events/guildMemberAdd.js` if needed.
