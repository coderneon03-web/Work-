const { PermissionsBitField } = require('discord.js');

function register(client) {
  const logChannelId = process.env.LOG_CHANNEL_ID;
  
  const spamMap = new Map();
  const warnings = new Map();

  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    
    const member = message.member;
    const logChannel = message.guild.channels.cache.get(logChannelId);
    
    if (member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

    const userId = message.author.id;
    const now = Date.now();
    
    if (!spamMap.has(userId)) {
      spamMap.set(userId, []);
    }
    
    const userMessages = spamMap.get(userId);
    userMessages.push(now);
    
    const recentMessages = userMessages.filter(time => now - time < 5000);
    spamMap.set(userId, recentMessages);
    
    if (recentMessages.length >= 5) {
      try {
        await member.timeout(300000, 'Auto-mod: Spam detected');
        await message.channel.bulkDelete(recentMessages.length);
        logChannel?.send(`🤖 **AutoMod**: Timed out ${message.author.tag} for spam (5+ messages in 5s)`);
        spamMap.delete(userId);
        return;
      } catch (e) { }
    }

    const badWords = ['badword1', 'badword2', 'toxic', 'spam'];
    const content = message.content.toLowerCase();
    const hasBadWord = badWords.some(word => content.includes(word));
    
    if (hasBadWord) {
      await message.delete().catch(() => {});
      
      const userWarnings = warnings.get(userId) || 0;
      warnings.set(userId, userWarnings + 1);
      
      if (userWarnings >= 3) {
        await member.timeout(600000, 'Auto-mod: Multiple bad word violations');
        logChannel?.send(`🤖 **AutoMod**: Timed out ${message.author.tag} for repeated bad language`);
        warnings.delete(userId);
      } else {
        await message.channel.send(`⚠️ ${message.author}, please watch your language! Warning ${userWarnings + 1}/3`);
        logChannel?.send(`🤖 **AutoMod**: Warned ${message.author.tag} for bad language (${userWarnings + 1}/3)`);
      }
    }

    if (message.content.length >= 10) {
      const capsPercent = (message.content.match(/[A-Z]/g) || []).length / message.content.length;
      if (capsPercent >= 0.5) {
        await message.delete().catch(() => {});
        await message.channel.send(`🔇 ${message.author}, please don't use excessive caps!`);
        logChannel?.send(`🤖 **AutoMod**: Deleted caps message from ${message.author.tag}`);
      }
    }

    if (message.mentions.users.size >= 5) {
      await message.delete().catch(() => {});
      await member.timeout(300000, 'Auto-mod: Mass mentions');
      logChannel?.send(`🤖 **AutoMod**: Timed out ${message.author.tag} for mass mentions`);
    }
  });
}

module.exports = { register };