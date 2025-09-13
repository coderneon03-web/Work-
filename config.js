module.exports = {
  // Discord Bot Configuration
  TOKEN: process.env.TOKEN || "MTQxMzg5ODk0NzQzNjQ3ODUwNA.GCH-OO.EMoLyjkg-frdJecFL53dnQqcv9JeC48wEEe14M",
  CLIENT_ID: process.env.CLIENT_ID || "1413898947436478504",
  GUILD_ID: process.env.GUILD_ID || "", // Optional for faster command updates
  
  // Channel IDs
  WELCOME_CHANNEL_ID: process.env.WELCOME_CHANNEL_ID || "",
  LOG_CHANNEL_ID: process.env.LOG_CHANNEL_ID || "",
  APPLICATIONS_CHANNEL: process.env.APPLICATIONS_CHANNEL || "",
  TICKETS_CATEGORY: process.env.TICKETS_CATEGORY || "",
  SECRET_CHANNEL_ID: process.env.SECRET_CHANNEL_ID || "",
  
  // Role Configuration
  AUTOROLE_ID: process.env.AUTOROLE_ID || "",
  
  // Security
  WHITELISTED_IDS: process.env.WHITELISTED_IDS ? process.env.WHITELISTED_IDS.split(',') : [],
  AUTHORIZED_USER_IDS: process.env.AUTHORIZED_USER_IDS ? process.env.AUTHORIZED_USER_IDS.split(',') : [],
  
  // Server Configuration
  PORT: process.env.PORT || 3000
};