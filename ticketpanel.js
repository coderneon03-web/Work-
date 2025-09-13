const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketpanel')
    .setDescription('Send the ticket panel'),

  async execute(ix) {
    if (!ix.member.permissions.has('Administrator'))
      return ix.reply({ content: '❌ Admin only.', ephemeral: true });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_ticket')
        .setLabel('🎫 Open Ticket')
        .setStyle(ButtonStyle.Primary)
    );

    await ix.reply({ 
      content: '🎫 **Support Tickets**\nClick the button below to open a support ticket!', 
      components: [row] 
    });
  }
};