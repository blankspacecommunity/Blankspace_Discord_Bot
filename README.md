# Discord XP & Leveling Bot

A Discord bot that gamifies community participation by rewarding XP and ranks when members complete tasks, subject to moderator verification. Built with discord.js v14.

## Features

### 🎯 Core XP System
- **XP Tracking**: Persistent XP and level system for all users
- **Level Progression**: Configurable XP thresholds for each level
- **Profile System**: View detailed user profiles with stats and progress
- **Leaderboard**: Server-wide rankings by XP

### 📝 Task Management
- **Task Creation**: Moderators can create tasks with custom XP rewards
- **Task Submission**: Users submit evidence of completed tasks
- **Verification System**: Moderators approve/reject submissions with reasons
- **Automated Posting**: Tasks posted to designated channels automatically

### 🛡️ Moderation Features
- **Manual XP Management**: Add, remove, set, or reset user XP
- **Submission Review**: Queue system for pending task submissions
- **Audit Logging**: All XP changes logged to verification channel
- **Role-based Permissions**: Configurable moderator roles

### 🎮 User Experience
- **Interactive Buttons**: One-click task submissions and approvals
- **Progress Tracking**: Visual progress bars and next level information
- **Notifications**: DM notifications for approvals/rejections
- **Success Metrics**: Submission success rates and statistics

## Commands

### Public Commands
- `/profile [user]` - View your or another user's XP profile
- `/leaderboard [limit]` - View the server XP leaderboard
- `/tasks [page]` - Browse all available tasks
- `/ping` - Test bot connectivity with interactive components

### Moderator Commands
- `/verify @user <xp> <reason> [submission_id]` - Verify submissions and award XP
- `/create-task <title> <description> <xp_reward>` - Create new tasks
- `/submissions [page]` - View and manage pending submissions
- `/xp add/remove/set/reset @user <amount> <reason>` - Manage user XP manually

## Tech Stack

- Node.js with ES6 modules
- discord.js v14+
- SQLite with better-sqlite3
- dotenv for environment variables

## Project Structure

```txt
├── index.js                    # Main bot entry point
├── register-commands.js        # Slash command registration
├── package.json               # Dependencies and scripts
├── nodemon.json              # Development configuration
├── .env                      # Environment variables
├── data/
│   └── xp_system.db          # SQLite database
├── config/
│   └── config.js            # Bot and XP system configuration
└── src/
    ├── commands/
    │   ├── ping.js          # Ping slash command
    │   ├── profile.js       # User profile command
    │   ├── leaderboard.js   # XP leaderboard command
    │   ├── verify.js        # Submission verification command
    │   ├── create-task.js   # Task creation command
    │   ├── submissions.js   # Submissions management command
    │   ├── tasks.js         # Tasks browser command
    │   └── xp.js           # XP management command
    ├── components/
    │   ├── buttons/
    │   │   ├── cancel.js           # Cancel button handler
    │   │   ├── showModal.js        # Show modal button handler
    │   │   ├── submitTask.js       # Task submission button
    │   │   ├── approveSubmission.js # Approve submission button
    │   │   └── rejectSubmission.js  # Reject submission button
    │   ├── modals/
    │   │   ├── testModal.js           # Test modal handler
    │   │   └── taskSubmissionModal.js # Task submission modal
    │   └── selectMenus/
    │       └── testSelect.js # Test select menu handler
    ├── events/
    │   ├── error.js         # Error event handler
    │   ├── interactionCreate.js # Interaction router with XP handling
    │   └── ready.js         # Ready event handler
    └── utils/
        ├── BotClient.js     # Extended Discord client
        ├── embedUtils.js    # Embed creation utilities
        ├── logger.js        # Logging utilities
        ├── database.js      # Database management and queries
        └── xpManager.js     # XP calculations and level management
```

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd discord-bot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   The `.env` file should contain:

   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   GUILD_ID=your_test_guild_id_here
   ```

4. **Register slash commands**

   ```bash
   npm run register
   ```

5. **Start the bot**

   ```bash
   # Production
   npm start
   
   # Development (with auto-restart)
   npx nodemon
   ```

## Bot Functionality

### `/ping` Command

- Shows bot latency
- Provides a "Show Modal" button (Primary style)
- Provides a "Cancel" button (Danger style)
- Includes a select menu with 3 options

### Button Interactions

- **Show Modal**: Opens a text input modal
- **Cancel**: Disables all components and shows cancellation message

### Modal Interactions

- Collects text input from users
- Responds ephemerally with the submitted text

### Select Menu Interactions

- Responds ephemerally with the selected option

## Development

The bot uses a modular architecture:

- Commands are automatically loaded from `src/commands/`
- Components are automatically loaded from `src/components/`
- Events are automatically loaded from `src/events/`

Add new commands by creating files in the respective directories following the existing patterns.

## License

MIT
