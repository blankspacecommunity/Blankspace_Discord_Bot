# Discord Ping/Test Bot Requirements

## Purpose
A minimal Discord bot for testing connectivity 
## Tech Stack
- Node.js
- discord.js v14+
- dotenv
- Component V2
- Discord API v10



## Features

1. **Slash Command `/ping`**
   - Responds with:
     - "Pong!" embed showing latency.
     - Primary button: "Show Modal".
     - Danger button: "Cancel".
     - Select menu with 3 options.

2. **Button Handling**
   - "Show Modal":
     - Opens a modal to collect a text input.
     - Replies with the submitted text ephemerally.
   - "Cancel":
     - Disables buttons.
     - Replies "Cancelled." ephemerally.

3. **Select Menu Handling**
   - Replies ephemerally with the selected option.

4. **Project Structure**
   - `index.js`: main bot file.
   - `.env`: store credentials.
   - Slash command registration script (optional).

5. **Installation Instructions**
   - Clone repo.
   - Run `npm install`.
   - Create `.env`:
     ```
     DISCORD_TOKEN=your_bot_token
     CLIENT_ID=your_client_id
     GUILD_ID=your_test_guild_id
     ```
   - Register slash commands.
   - Start bot with `node index.js`.

## Expected Deliverables
- Complete working codebase.
- Example `.env`.
- Setup and run instructions.

