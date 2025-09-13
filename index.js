const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const { readdirSync, existsSync } = require('fs');
const express = require('express');
const path = require('path');

// Configuration
const config = {
  TOKEN: process.env.TOKEN || "MTQxMzg5ODk0NzQzNjQ3ODUwNA.GCH-OO.EMoLyjkg-frdJecFL53dnQqcv9JeC48wEEe14M",
  CLIENT_ID: process.env.CLIENT_ID || "1413898947436478504",
  GUILD_ID: process.env.GUILD_ID || "",
  WELCOME_CHANNEL_ID: process.env.WELCOME_CHANNEL_ID || "",
  LOG_CHANNEL_ID: process.env.LOG_CHANNEL_ID || "",
  APPLICATIONS_CHANNEL: process.env.APPLICATIONS_CHANNEL || "",
  TICKETS_CATEGORY: process.env.TICKETS_CATEGORY || "",
  SECRET_CHANNEL_ID: process.env.SECRET_CHANNEL_ID || "",
  AUTOROLE_ID: process.env.AUTOROLE_ID || "",
  WHITELISTED_IDS: process.env.WHITELISTED_IDS ? process.env.WHITELISTED_IDS.split(',') : [],
  AUTHORIZED_USER_IDS: process.env.AUTHORIZED_USER_IDS ? process.env.AUTHORIZED_USER_IDS.split(',') : [],
  PORT: process.env.PORT || 3000
};

// Express server setup
const app = express();
app.use(express.static('.'));
app.use(express.json());

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    servers: client ? client.guilds.cache.size : 0,
    users: client ? client.users.cache.size : 0,
    uptime: process.uptime()
  });
});

app.get('/ping', (req, res) => res.json({ message: 'Pong! 🏓' }));

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.send(`
    <html>
      <head><title>Ally Bot Dashboard</title></head>
      <body style="font-family: Arial; padding: 20px; background: #f5f5f5;">
        <h1>🤖 Ally Bot Dashboard</h1>
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2>Bot Statistics</h2>
          <p><strong>Status:</strong> ${client ? 'Online ✅' : 'Offline ❌'}</p>
          <p><strong>Servers:</strong> ${client ? client.guilds.cache.size : 0}</p>
          <p><strong>Users:</strong> ${client ? client.users.cache.size : 0}</p>
          <p><strong>Commands:</strong> ${client ? client.commands.size : 0}</p>
          <p><strong>Uptime:</strong> ${Math.floor(process.uptime() / 60)} minutes</p>
        </div>
        <div style="background: white; padding: 20px; border-radius: 10px;">
          <h2>Available Commands</h2>
          <ul>
            <li><code>/help</code> - Show all commands</li>
            <li><code>/ai chat</code> - Chat with AI</li>
            <li><code>/ai code</code> - Get coding help with internet search</li>
            <li><code>/music play</code> - Play music</li>
            <li><code>/mod kick</code> - Kick a user</li>
            <li><code>/serverinfo</code> - Server information</li>
            <li><code>/ping</code> - Check bot latency</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// Start Express server
app.listen(config.PORT, () => {
  console.log(`🌐 Web server running on port ${config.PORT}`);
});

// Discord client setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildModeration
  ]
});

client.commands = new Collection();

// Load commands function
function loadCommands() {
  const commands = [];
  const commandFiles = [
    'ai.js', 'help.js', 'kick.js', 'ping.js', 'invite.js', 'purge.js', 'music.js', 'xenon.js', 'carlbot.js', 'dyno.js',
    'timeout.js', 'applypanel.js', 'moderation.js', 'serverinfo.js', 
    'rolemanager.js', 'secretpanel.js', 'ticketpanel.js'
  ];
  
  for (const file of commandFiles) {
    try {
      if (existsSync(path.join(__dirname, file))) {
        delete require.cache[require.resolve(path.join(__dirname, file))];
        const command = require(path.join(__dirname, file));
        
        if (command && command.data && command.execute) {
          client.commands.set(command.data.name, command);
          commands.push(command.data.toJSON());
          
          if (command.registerHandlers) {
            command.registerHandlers(client);
          }
          
          console.log(`✅ Loaded command: ${command.data.name}`);
        }
      }
    } catch (error) {
      console.log(`❌ Failed to load command ${file}:`, error.message);
    }
  }
  
  return commands;
}

// Load event handlers
function loadEventHandlers() {
  const handlerFiles = [
    'automod.js', 'logging.js', 'welcome.js', 'antinuke.js', 
    'autorole.js', 'applyhandler.js', 'secrethandler.js', 'tickethandler.js'
  ];
  
  for (const file of handlerFiles) {
    try {
      if (existsSync(path.join(__dirname, file))) {
        delete require.cache[require.resolve(path.join(__dirname, file))];
        const handler = require(path.join(__dirname, file));
        
        if (handler && handler.register) {
          handler.register(client);
          console.log(`✅ Loaded handler: ${file}`);
        }
      }
    } catch (error) {
      console.log(`❌ Failed to load handler ${file}:`, error.message);
    }
  }
}

// Register slash commands
async function registerCommands(commands) {
  if (!config.TOKEN || !config.CLIENT_ID) {
    console.log('⚠️ Missing TOKEN or CLIENT_ID in environment variables');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(config.TOKEN);

  try {
    console.log('🔄 Refreshing application (/) commands...');
    
    if (config.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
        { body: commands }
      );
    } else {
      await rest.put(
        Routes.applicationCommands(config.CLIENT_ID),
        { body: commands }
      );
    }
    
    console.log('✅ Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
}

// Discord event handlers
client.once('ready', async () => {
  console.log(`🚀 ${client.user.tag} is online!`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
  console.log(`👥 Serving ${client.users.cache.size} users`);
  
  client.user.setActivity('🎵 Music & AI | /help', { type: 'LISTENING' });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error('❌ Command execution error:', error);
    const reply = { content: '❌ There was an error executing this command!', ephemeral: true };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

// Error handling
client.on('error', console.error);
client.on('warn', console.warn);

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
}).on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err);
  process.exit(1);
});

// Initialize bot
async function init() {
  try {
    const commands = loadCommands();
    loadEventHandlers();
    await registerCommands(commands);
    
    if (!config.TOKEN) {
      console.log('❌ No TOKEN found in environment variables!');
      console.log('🔧 Please set your bot token in environment variables');
      return;
    }
    
    await client.login(config.TOKEN);
  } catch (error) {
    console.error('❌ Failed to initialize bot:', error);
  }
}

// Export for testing
module.exports = { app, client, config };

// Start the bot
init();