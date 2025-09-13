const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dyno')
    .setDescription('Dyno bot features - moderation, music, and utilities')
    .addSubcommand(sub => sub
      .setName('warn')
      .setDescription('Warn a user')
      .addUserOption(o => o.setName('user').setDescription('User to warn').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Warning reason').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('warnings')
      .setDescription('View user warnings')
      .addUserOption(o => o.setName('user').setDescription('User to check').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('mute')
      .setDescription('Mute a user')
      .addUserOption(o => o.setName('user').setDescription('User to mute').setRequired(true))
      .addIntegerOption(o => o.setName('duration').setDescription('Duration in minutes').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Mute reason')))
    .addSubcommand(sub => sub
      .setName('unmute')
      .setDescription('Unmute a user')
      .addUserOption(o => o.setName('user').setDescription('User to unmute').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('slowmode')
      .setDescription('Set channel slowmode')
      .addIntegerOption(o => o.setName('seconds').setDescription('Seconds (0-21600)').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('lockdown')
      .setDescription('Lock/unlock channel')
      .addStringOption(o => o.setName('action').setDescription('Action').setRequired(true)
        .addChoices(
          { name: 'Lock', value: 'lock' },
          { name: 'Unlock', value: 'unlock' }
        )))
    .addSubcommand(sub => sub
      .setName('stats')
      .setDescription('Show bot and server statistics'))
    .addSubcommand(sub => sub
      .setName('avatar')
      .setDescription('Get user avatar')
      .addUserOption(o => o.setName('user').setDescription('User (default: you)')))
    .addSubcommand(sub => sub
      .setName('userinfo')
      .setDescription('Get user information')
      .addUserOption(o => o.setName('user').setDescription('User (default: you)')))
    .addSubcommand(sub => sub
      .setName('reminder')
      .setDescription('Set a reminder')
      .addStringOption(o => o.setName('time').setDescription('Time (e.g., 1h, 30m, 2d)').setRequired(true))
      .addStringOption(o => o.setName('message').setDescription('Reminder message').setRequired(true))),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    // Check permissions for moderation commands
    const modCommands = ['warn', 'warnings', 'mute', 'unmute', 'slowmode', 'lockdown'];
    if (modCommands.includes(subcommand) && !interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: '❌ You need moderation permissions!', ephemeral: true });
    }

    try {
      switch (subcommand) {
        case 'warn': {
          const user = interaction.options.getUser('user');
          const reason = interaction.options.getString('reason');

          // In real implementation, save to database
          const embed = new EmbedBuilder()
            .setTitle('⚠️ User Warned')
            .setDescription(`**${user.tag}** has been warned`)
            .addFields(
              { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
              { name: '👮 Moderator', value: interaction.user.tag, inline: true },
              { name: '📝 Reason', value: reason, inline: false },
              { name: '📊 Total Warnings', value: '1', inline: true }
            )
            .setColor(0xffaa00)
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });

          // Try to DM the user
          try {
            await user.send(`⚠️ You have been warned in **${interaction.guild.name}**\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`);
          } catch (e) { /* User has DMs disabled */ }
          break;
        }

        case 'warnings': {
          const user = interaction.options.getUser('user');

          // Simulate warnings data
          const warnings = [
            { id: 1, reason: 'Spamming in chat', moderator: 'Admin#1234', date: '2024-01-15', active: true },
            { id: 2, reason: 'Inappropriate language', moderator: 'Mod#5678', date: '2024-01-20', active: true }
          ];

          const warningList = warnings.map(w => 
            `**${w.id}.** ${w.reason}\n*By ${w.moderator} on ${w.date}*`
          ).join('\n\n');

          const embed = new EmbedBuilder()
            .setTitle(`⚠️ Warnings for ${user.tag}`)
            .setDescription(warningList || 'No warnings found')
            .addFields(
              { name: '📊 Statistics', value: `Total: ${warnings.length}\nActive: ${warnings.filter(w => w.active).length}`, inline: true }
            )
            .setColor(0xffaa00)
            .setThumbnail(user.displayAvatarURL());

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'mute': {
          const user = interaction.options.getUser('user');
          const duration = interaction.options.getInteger('duration');
          const reason = interaction.options.getString('reason') || 'No reason provided';

          try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.timeout(duration * 60 * 1000, reason);

            const embed = new EmbedBuilder()
              .setTitle('🔇 User Muted')
              .setDescription(`**${user.tag}** has been muted`)
              .addFields(
                { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
                { name: '⏱️ Duration', value: `${duration} minutes`, inline: true },
                { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                { name: '📝 Reason', value: reason, inline: false }
              )
              .setColor(0xff0000)
              .setThumbnail(user.displayAvatarURL())
              .setTimestamp();

            await interaction.reply({ embeds: [embed] });
          } catch (error) {
            await interaction.reply({ content: '❌ Failed to mute user. Check permissions and hierarchy.', ephemeral: true });
          }
          break;
        }

        case 'unmute': {
          const user = interaction.options.getUser('user');

          try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.timeout(null);

            const embed = new EmbedBuilder()
              .setTitle('🔊 User Unmuted')
              .setDescription(`**${user.tag}** has been unmuted`)
              .addFields(
                { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
                { name: '👮 Moderator', value: interaction.user.tag, inline: true }
              )
              .setColor(0x00ff00)
              .setThumbnail(user.displayAvatarURL())
              .setTimestamp();

            await interaction.reply({ embeds: [embed] });
          } catch (error) {
            await interaction.reply({ content: '❌ Failed to unmute user.', ephemeral: true });
          }
          break;
        }

        case 'slowmode': {
          const seconds = interaction.options.getInteger('seconds');

          if (seconds < 0 || seconds > 21600) {
            return interaction.reply({ content: '❌ Slowmode must be between 0-21600 seconds!', ephemeral: true });
          }

          await interaction.channel.setRateLimitPerUser(seconds);

          const embed = new EmbedBuilder()
            .setTitle('🐌 Slowmode Updated')
            .setDescription(seconds === 0 ? 'Slowmode has been **disabled**' : `Slowmode set to **${seconds} seconds**`)
            .addFields(
              { name: '📺 Channel', value: interaction.channel.toString(), inline: true },
              { name: '👮 Moderator', value: interaction.user.tag, inline: true }
            )
            .setColor(seconds === 0 ? 0x00ff00 : 0xffaa00)
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'lockdown': {
          const action = interaction.options.getString('action');
          const channel = interaction.channel;

          if (action === 'lock') {
            await channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
            
            const embed = new EmbedBuilder()
              .setTitle('🔒 Channel Locked')
              .setDescription(`${channel} has been locked`)
              .addFields(
                { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                { name: '⏰ Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
              )
              .setColor(0xff0000)
              .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await channel.send('🔒 This channel has been locked by a moderator.');
          } else {
            await channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });
            
            const embed = new EmbedBuilder()
              .setTitle('🔓 Channel Unlocked')
              .setDescription(`${channel} has been unlocked`)
              .addFields(
                { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                { name: '⏰ Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
              )
              .setColor(0x00ff00)
              .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await channel.send('🔓 This channel has been unlocked.');
          }
          break;
        }

        case 'stats': {
          const guild = interaction.guild;
          const uptime = process.uptime();
          const uptimeString = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

          const embed = new EmbedBuilder()
            .setTitle('📊 Dyno Statistics')
            .setDescription('Bot and server statistics')
            .addFields(
              { name: '🤖 Bot Stats', value: `Uptime: ${uptimeString}\nServers: ${interaction.client.guilds.cache.size}\nUsers: ${interaction.client.users.cache.size}`, inline: true },
              { name: '🏠 Server Stats', value: `Members: ${guild.memberCount}\nChannels: ${guild.channels.cache.size}\nRoles: ${guild.roles.cache.size}`, inline: true },
              { name: '💾 System', value: `Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\nNode.js: ${process.version}\nDiscord.js: v14`, inline: true }
            )
            .setColor(0x5865f2)
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'avatar': {
          const user = interaction.options.getUser('user') || interaction.user;
          
          const embed = new EmbedBuilder()
            .setTitle(`${user.tag}'s Avatar`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor(0x5865f2)
            .addFields(
              { name: '🔗 Links', value: `[PNG](${user.displayAvatarURL({ format: 'png', size: 512 })}) | [JPG](${user.displayAvatarURL({ format: 'jpg', size: 512 })}) | [WEBP](${user.displayAvatarURL({ format: 'webp', size: 512 })})`, inline: false }
            );

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'userinfo': {
          const user = interaction.options.getUser('user') || interaction.user;
          const member = await interaction.guild.members.fetch(user.id);

          const embed = new EmbedBuilder()
            .setTitle(`👤 ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: '🆔 User ID', value: user.id, inline: true },
              { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
              { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
              { name: '🎭 Roles', value: member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.toString()).join(' ') || 'None', inline: false },
              { name: '🔑 Permissions', value: member.permissions.has(PermissionsBitField.Flags.Administrator) ? 'Administrator' : 'Member', inline: true }
            )
            .setColor(member.displayHexColor || 0x5865f2)
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'reminder': {
          const time = interaction.options.getString('time');
          const message = interaction.options.getString('message');

          // Parse time (simplified)
          let milliseconds = 0;
          const timeRegex = /(\d+)([smhd])/g;
          let match;
          
          while ((match = timeRegex.exec(time)) !== null) {
            const value = parseInt(match[1]);
            const unit = match[2];
            
            switch (unit) {
              case 's': milliseconds += value * 1000; break;
              case 'm': milliseconds += value * 60 * 1000; break;
              case 'h': milliseconds += value * 60 * 60 * 1000; break;
              case 'd': milliseconds += value * 24 * 60 * 60 * 1000; break;
            }
          }

          if (milliseconds === 0) {
            return interaction.reply({ content: '❌ Invalid time format! Use: 1s, 5m, 2h, 1d', ephemeral: true });
          }

          const endTime = Math.floor((Date.now() + milliseconds) / 1000);

          const embed = new EmbedBuilder()
            .setTitle('⏰ Reminder Set')
            .setDescription(`I'll remind you about: **${message}**`)
            .addFields(
              { name: '⏱️ Time', value: `<t:${endTime}:R>`, inline: true },
              { name: '📍 Channel', value: interaction.channel.toString(), inline: true }
            )
            .setColor(0x00ff00)
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });

          // Set timeout for reminder (in real implementation, use a proper scheduler)
          setTimeout(async () => {
            try {
              const reminderEmbed = new EmbedBuilder()
                .setTitle('⏰ Reminder')
                .setDescription(`**${message}**`)
                .addFields({ name: '⏱️ Set', value: `<t:${Math.floor((Date.now() - milliseconds) / 1000)}:R>`, inline: true })
                .setColor(0xffaa00);

              await interaction.followUp({ content: `${interaction.user}`, embeds: [reminderEmbed] });
            } catch (error) {
              console.error('Reminder error:', error);
            }
          }, milliseconds);
          break;
        }
      }
    } catch (error) {
      console.error('Dyno command error:', error);
      await interaction.reply({ content: '❌ An error occurred while processing the command.', ephemeral: true });
    }
  }
};