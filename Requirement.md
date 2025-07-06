# 📄 Requirements.md  

## 🎮 Discord Community XP & Leveling Bot  

A bot to *gamify* community participation by rewarding XP and ranks when members complete tasks, subject to moderator verification.  
Think **Arcane**, but purpose-built to encourage creation and contribution, not just chatting.  

---

## ✨ Core Objectives  

- Gamify the server with XP and levels.  
- Reward members for **validated contributions** (e.g., sharing a portfolio).  
- Require moderators to **verify submissions** before XP is granted.  
- Provide commands for mods to assign XP manually upon verification.  
- Maintain a clear progression system (XP thresholds for levels).  

---

## 🛠️ Features  

### 🎯 1. Task System  

- A **#tasks** channel where the bot will periodically (or manually) post **tasks** members can complete.  
  - Examples:  
    - Create and share your portfolio.  
    - Contribute an open-source PR.  
    - Publish an article on Dev.to.  
- Each task has:  
  - A **description**  
  - A **reward XP value**  

---

### 📝 2. Submission System  

- Members submit completed tasks in **#task-submissions** by posting their evidence (link, screenshot, etc.).  
- The bot logs each submission internally as `PENDING`.  
- Mods can see a list of pending submissions.  

---

### 🛡️ 3. Verification & XP Awarding  

- Mods verify a submission by using a bot command:  

/verify @member [xp amount] [reason]x`

- Example:  
  ```
  /verify @AbinVarghexe 50 "Verified portfolio submission"
  ```
- When verified:  
- XP is added to the member’s profile.  
- Bot replies in #task-submissions (or DM) to confirm XP granted.  
- Optionally, log to #verification-logs.  

---

### 🧮 4. XP & Level System  

- Each member has:  
- **XP**: numeric value.  
- **Level**: derived from XP thresholds (configurable).  
- The bot auto-updates roles or nicknames when levels are achieved.  
- Example thresholds:  
  - Level 1: 0 XP  
  - Level 2: 100 XP  
  - Level 3: 250 XP  
  - Level 4: 500 XP  
- Command to check current XP/level:  

/profile @member
---

### 🏷️ 5. Leaderboard  

- A command to display top members by XP:  

/leaderboard

- Displays top 10 (configurable).  

---

### 🔒 6. Permissions  

- Only users with a specific role (e.g., `Moderator`) can:  
- Verify submissions.  
- Grant or revoke XP manually.  

---

### ⚙️ 7. Configurations  

- XP thresholds for each level.  
- Channels to use for:  
- Task postings.  
- Submissions.  
- Verification logs.  
- Roles to assign per level (optional).  
- Command prefix or slash commands.  

---

## 💬 Example Workflow  

1. Bot posts a **task** in #tasks:  
 > 📝 **New Task:** Create a personal portfolio and share the link. Reward: 100 XP.

2. A member submits their link in #task-submissions:  
 > Here is my portfolio: https://myportfolio.com

3. A mod verifies:  

/verify @MemberName 100 "Portfolio approved"


4. Bot responds:  
> ✅ **@MemberName** has been awarded 100 XP for "Portfolio approved"! They are now Level 2.

5. Member checks their profile:  

/profile

> XP: 150 | Level: 2

---


## 🧩 Nice to Have (Future)  

- Automatic detection of certain contributions (GitHub PRs, blog posts).  
- Role rewards for levels.  
- Badges or achievements.  
- Web dashboard for XP management.  

---

## 📂 Tech Stack (Recommendation)  

- **Node.js** with **discord.js** (v14 or later).  
- SQLite or MongoDB for persistence.  
- Slash commands (`/`) for modern UX.  

---

## 🚀 Milestones  

1. Bot skeleton with slash commands.  
2. XP tracking and leveling logic.  
3. Task posting and submission logging.  
4. Moderator verification system.  
5. Role or nickname updating on level up.  

---

**This document is the bedrock of your project. Build boldly, test relentlessly, and iterate with clear eyes.**



