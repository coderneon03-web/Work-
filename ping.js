const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Check bot latency'),
  async execute(ix) {
    const latency = Date.now() - ix.createdTimestamp;
    ix.reply(`🏓 Pong! Bot Latency: **${latency}ms**`);
  }
};
