function register(client) {
  const ticketsCategoryId = process.env.TICKETS_CATEGORY;

  client.on('interactionCreate', async (ix) => {
    if (!ix.isButton()) return;

    if (ix.customId === 'open_ticket') {
      try {
        const channel = await ix.guild.channels.create({
          name: `ticket-${ix.user.username}`,
          parent: ticketsCategoryId,
          permissionOverwrites: [
            { id: ix.guild.id, deny: ['ViewChannel'] },
            { id: ix.user.id, allow: ['ViewChannel', 'SendMessages'] },
          ]
        });

        await channel.send(`🎫 Ticket opened by ${ix.user}. Support will be with you shortly.`);
        await ix.reply({ content: `✅ Your ticket has been opened: ${channel}`, ephemeral: true });
      } catch (error) {
        await ix.reply({ content: '❌ Failed to create ticket. Please contact an admin.', ephemeral: true });
      }
    }
  });
}

module.exports = { register };