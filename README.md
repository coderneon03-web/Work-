# Ally Bot - Advanced Discord Bot

A feature-rich Discord bot with moderation, music, tickets, AI features, and more!

## 🚀 Features

- **Moderation**: Kick, ban, timeout, purge messages
- **Auto Moderation**: Anti-spam, bad word filter, anti-caps
- **Ticket System**: Support ticket creation and management
- **Application System**: User application forms
- **Welcome System**: Greet new members
- **Auto Role**: Automatically assign roles to new members
- **Logging**: Track server activities
- **AI Features**: Chat, image generation, code help, translation
- **Anti-Nuke**: Protection against server raids
- **Music System**: Play music from various sources

## 🛠️ Setup Instructions

### 1. Environment Variables

Create a `.env` file or set these in your hosting platform's secrets/environment variables:

```env
# Required
TOKEN=your_bot_token_here
CLIENT_ID=your_bot_client_id_here

# Optional (for specific features)
GUILD_ID=your_guild_id_here
WELCOME_CHANNEL_ID=channel_id_here
LOG_CHANNEL_ID=channel_id_here
APPLICATIONS_CHANNEL=channel_id_here
TICKETS_CATEGORY=category_id_here
SECRET_CHANNEL_ID=channel_id_here
AUTOROLE_ID=role_id_here
WHITELISTED_IDS=user_id_1,user_id_2
AUTHORIZED_USER_IDS=admin_user_id_1,admin_user_id_2
```

### 2. Getting Your Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section
4. Copy the token and set it as `TOKEN` in your environment variables
5. Copy the Application ID and set it as `CLIENT_ID`

### 3. Bot Permissions

Your bot needs these permissions:
- Administrator (recommended for full functionality)
- Or specific permissions: Manage Channels, Manage Roles, Kick Members, Ban Members, Moderate Members, etc.

### 4. Invite Bot to Server

Use this URL format (replace CLIENT_ID):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

## 📋 Commands

### Moderation
- `/mod kick` - Kick a user
- `/mod ban` - Ban a user  
- `/mod timeout` - Timeout a user
- `/mod purge` - Delete messages

### Information
- `/serverinfo` - Server information
- `/ping` - Bot latency
- `/help` - Command list

### AI Features
- `/ai chat` - Chat with AI
- `/ai image` - Generate images
- `/ai code` - Get coding help
- `/ai translate` - Translate text

### Utility
- `/invite` - Get bot invite link

## 🔧 Configuration

Set up channel IDs in your environment variables for full functionality:

- `WELCOME_CHANNEL_ID` - Channel for welcome messages
- `LOG_CHANNEL_ID` - Channel for activity logs
- `APPLICATIONS_CHANNEL` - Channel for application submissions
- `TICKETS_CATEGORY` - Category for support tickets
- `AUTOROLE_ID` - Role to assign to new members

## 🚀 Deployment

1. Set all required environment variables
2. Run `npm install` to install dependencies
3. Run `npm start` to start the bot

## 📞 Support

If you need help setting up the bot, check the console logs for any error messages and ensure all environment variables are properly configured.