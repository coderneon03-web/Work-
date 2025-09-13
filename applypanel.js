const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('applypanel')
    .setDescription('Send the application panel'),

  async execute(ix) {
    if (!ix.member.permissions.has('Administrator'))
      return ix.reply({ content: '❌ Admin only.', ephemeral: true });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('start_apply').setLabel('📋 Apply Now').setStyle(ButtonStyle.Primary)
    );

    await ix.reply({ content: 'Click below to start your application!', components: [row] });
  }
};
