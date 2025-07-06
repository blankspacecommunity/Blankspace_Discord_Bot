# Discord Bot Commands & Management

## 🎯 New Commands Added

### `/hello` Command
- **Description**: Greets users with friendly, random messages
- **Features**:
  - Optional user parameter to greet specific users
  - Random greeting messages with emojis
  - Fun facts appear occasionally (30% chance)
  - Handles self-greeting with humor
  - Customizable embed with user avatars

**Usage:**
```
/hello                    # Greet yourself
/hello user:@SomeUser     # Greet another user
```

### `/test` Command
- **Description**: Comprehensive testing command with multiple interactive features
- **Test Types**:
  - `basic` - General functionality check with interactive buttons
  - `system` - Detailed bot system information
  - `random` - Random number generation and dice rolls
  - `status` - Bot statistics and performance metrics
  - `colors` - Embed color testing with random colors

**Usage:**
```
/test                           # Basic test
/test type:system              # System information
/test type:random              # Random numbers
/test type:status              # Bot status
/test type:colors              # Color test
```

### `/rank` Command (Renamed from `/leaderboard`)
- **Description**: View the server XP leaderboard
- **Features**: Same functionality as before, just renamed for better UX
- **Usage**: `/rank limit:10`

### Enhanced `/ping` Command
- **Description**: Advanced latency checker with performance metrics
- **New Features**:
  - Detailed performance reports
  - Interactive components (buttons and select menus)
  - System information display
  - Performance rating system
  - Color-coded latency status

**Usage:**
```
/ping                                    # Basic ping
/ping detailed:true                      # Detailed metrics
/ping components:true                    # Show interactive elements
/ping detailed:true components:true      # Full-featured ping
```

### `/my-submissions` Command

- **Description**: View your own task submissions and their status
- **Features**:
  - Filter by submission status (All, Pending, Approved, Rejected)
  - Paginated view of submissions
  - Interactive status filter buttons
  - Summary statistics of your submissions
  - XP earned tracking

**Usage:**
```
/my-submissions                          # View all your submissions
/my-submissions status:PENDING          # View only pending submissions
/my-submissions status:APPROVED         # View only approved submissions
/my-submissions page:2                  # View page 2 of submissions
```

### Enhanced `/tasks` Command

- **Description**: View available tasks (now excludes submitted tasks)
- **New Features**:
  - **Smart filtering**: Only shows tasks you haven't submitted
  - **Moderator view**: `show-all` option for moderators to see all tasks
  - **Submission tracking**: Shows count of submitted vs available tasks
  - **Better UX**: Guides users to check their submissions

**Usage:**
```
/tasks                                  # View available tasks (excludes submitted)
/tasks show-all:true                    # Moderators: View all tasks including submitted
/tasks page:2                           # Navigate to page 2
```

## 🛠️ Command Management Utilities

### `command-manager.js` - Comprehensive Command Management
The main utility for managing Discord bot commands with interactive features.

**Features:**
- List all registered and local commands
- Automatic cleanup of orphaned commands
- Register/update all commands
- Delete specific commands
- Interactive prompts for safety
- Detailed status reporting

**Usage:**
```bash
# List all commands and their status
node command-manager.js --list

# Clean up orphaned registered commands (interactive)
node command-manager.js --cleanup

# Clean up with auto-confirmation
node command-manager.js --cleanup --confirm

# Register/update all local commands
node command-manager.js --register

# Delete specific commands (interactive)
node command-manager.js --delete oldcommand1 oldcommand2

# Delete with auto-confirmation
node command-manager.js --delete oldcommand --confirm

# Show help
node command-manager.js --help
```

### `manage-commands.js` - Simple Command Deletion
Lightweight utility for quick command management.

**Usage:**
```bash
# List all registered commands
node manage-commands.js --list

# Delete specific commands
node manage-commands.js leaderboard oldcmd --confirm
```

### `unregister-commands.js` - Automatic Cleanup
Automatically finds and removes commands that don't have corresponding local files.

**Usage:**
```bash
# Dry run - show what would be deleted
node unregister-commands.js

# Actually delete orphaned commands
node unregister-commands.js --confirm

# Delete and show remaining commands
node unregister-commands.js --confirm --list-remaining
```

## 🎮 Interactive Components

### New Button Handlers
- `testAgain.js` - Re-run test functionality
- `testRandom.js` - Generate random test results
- `testInfo.js` - Show test command information
- `pingAgain.js` - Re-ping for fresh latency measurements
- `pingDetailed.js` - Show detailed performance statistics

### Enhanced Features
- **Color-coded responses** based on performance metrics
- **Performance scoring system** with letter grades
- **Interactive button components** for extended functionality
- **Rich embed formatting** with user avatars and timestamps
- **Dynamic content generation** with random elements

## 📊 Performance Metrics

The enhanced commands now provide detailed performance insights:

### Latency Status
- 🟢 **Excellent**: < 100ms
- 🟡 **Good**: 100-200ms
- 🟠 **Fair**: 200-300ms
- 🔴 **Poor**: > 300ms

### Performance Scoring
Calculated based on:
- **Latency** (bot response + API ping)
- **Memory usage** (heap utilization)
- **System performance** (overall health)

Grades: A+ (90-100), A (80-89), B (70-79), C (60-69), D (<60)

## 🚀 Best Practices

1. **Use command-manager.js** for comprehensive command management
2. **Test commands thoroughly** with the `/test` command before deployment
3. **Monitor performance** regularly with `/ping detailed:true`
4. **Clean up unused commands** periodically to avoid clutter
5. **Use interactive components** to enhance user experience

## 🛡️ Safety Features

- **Interactive confirmations** for destructive operations
- **Dry-run modes** to preview changes before execution
- **Rate limiting protection** to avoid Discord API limits
- **Error handling and logging** for troubleshooting
- **Rollback capabilities** through re-registration

## 📝 Notes

- All new commands are fully compatible with the existing XP system
- Commands maintain the same permission structure as before
- Interactive components enhance user engagement
- Performance monitoring helps maintain bot health
- Management utilities ensure clean command registry

## 🎯 New Task Submission Behavior

### Key Changes:
1. **Tasks disappear after submission**: Once you submit a task, it won't appear in `/tasks` anymore
2. **Submission tracking**: Use `/my-submissions` to track your submission status
3. **Moderator oversight**: Moderators can use `/tasks show-all:true` to see all tasks
4. **Better organization**: Clear separation between available tasks and submitted tasks

### User Experience:
- **Submit a task** → It disappears from `/tasks`
- **Check status** → Use `/my-submissions` to see progress
- **View available** → `/tasks` shows only what you can still submit
- **Moderator view** → `/tasks show-all:true` shows everything
