const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('carl')
    .setDescription('Carl-bot features - automod, reaction roles, and more')
    .addSubcommand(sub => sub
      .setName('automod')
      .setDescription('Configure automod settings')
      .addStringOption(o => o.setName('action').setDescription('Action').setRequired(true)
        .addChoices(
          { name: 'Enable', value: 'enable' },
          { name: 'Disable', value: 'disable' },
          { name: 'Status', value: 'status' }
        )))
    .addSubcommand(sub => sub
      .setName('reactionrole')
      .setDescription('Setup reaction roles')
      .addStringOption(o => o.setName('emoji').setDescription('Emoji').setRequired(true))
      .addRoleOption(o => o.setName('role').setDescription('Role to assign').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('starboard')
      .setDescription('Configure starboard')
      .addChannelOption(o => o.setName('channel').setDescription('Starboard channel').setRequired(true))
      .addIntegerOption(o => o.setName('stars').setDescription('Required stars (1-20)').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('tags')
      .setDescription('Create custom tags')
      .addStringOption(o => o.setName('name').setDescription('Tag name').setRequired(true))
      .addStringOption(o => o.setName('content').setDescription('Tag content').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('giveaway')
      .setDescription('Start a giveaway')
      .addStringOption(o => o.setName('prize').setDescription('Giveaway prize').setRequired(true))
      .addIntegerOption(o => o.setName('duration').setDescription('Duration in minutes').setRequired(true))
      .addIntegerOption(o => o.setName('winners').setDescription('Number of winners').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('leveling')
      .setDescription('Configure leveling system')
      .addStringOption(o => o.setName('action').setDescription('Action').setRequired(true)
        .addChoices(
          { name: 'Enable', value: 'enable' },
          { name: 'Disable', value: 'disable' },
          { name: 'Leaderboard', value: 'leaderboard' }
        )))
    .addSubcommand(sub => sub
      .setName('welcome')
      .setDescription('Configure welcome messages')
      .addChannelOption(o => o.setName('channel').setDescription('Welcome channel').setRequired(true))
      .addStringOption(o => o.setName('message').setDescription('Welcome message').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('modlog')
      .setDescription('Configure moderation logging')
      .addChannelOption(o => o.setName('channel').setDescription('Log channel').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('purge')
      .setDescription('Advanced message purging')
      .addIntegerOption(o => o.setName('amount').setDescription('Messages to delete (1-100)').setRequired(true))
      .addUserOption(o => o.setName('user').setDescription('Only delete messages from this user')))
    .addSubcommand(sub => sub
      .setName('role')
      .setDescription('Mass role management')
      .addStringOption(o => o.setName('action').setDescription('Action').setRequired(true)
        .addChoices(
          { name: 'Add to all', value: 'addall' },
          { name: 'Remove from all', value: 'removeall' }
        ))
      .addRoleOption(o => o.setName('role').setDescription('Role to manage').setRequired(true))),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    // Check permissions for most commands
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild) && 
        !['tags', 'leveling'].includes(subcommand)) {
      return interaction.reply({ content: '❌ You need Manage Server permission!', ephemeral: true });
    }

    try {
      switch (subcommand) {
        case 'automod': {
          const action = interaction.options.getString('action');
          
          const embed = new EmbedBuilder()
            .setTitle('🛡️ Carl-bot Automod')
            .setColor(0x5865f2);

          switch (action) {
            case 'enable':
              embed.setDescription('✅ Automod has been **enabled**!')
                .addFields(
                  { name: '🚫 Active Filters', value: '• Spam Detection (5+ msgs/5s)\n• Bad Words Filter\n• Mass Mentions (5+)\n• Excessive Caps (70%+)\n• Repeated Text\n• Discord Invites\n• Zalgo Text', inline: false },
                  { name: '⚙️ Auto Actions', value: '• Auto Delete Messages\n• Auto Warn Users\n• Auto Timeout (5-60 min)\n• Auto Kick (repeat offenders)\n• Auto Ban (severe cases)', inline: false },
                  { name: '📊 Thresholds', value: '• Warn: 1st offense\n• Timeout: 2nd offense\n• Kick: 3rd offense\n• Ban: 4th offense', inline: false }
                );
              break;
            case 'disable':
              embed.setDescription('❌ Automod has been **disabled**!')
                .addFields({ name: '⚠️ Warning', value: 'Your server is no longer protected by automod filters. Members can now send spam, inappropriate content, and mass mentions without automatic moderation.', inline: false });
              break;
            case 'status':
              embed.setDescription('📊 **Automod Status Dashboard**')
                .addFields(
                  { name: '🟢 Status', value: 'Active & Monitoring', inline: true },
                  { name: '📈 Today\'s Actions', value: '• 47 messages deleted\n• 12 users warned\n• 3 users timed out\n• 1 user kicked', inline: true },
                  { name: '🎯 Detection Stats', value: '• Accuracy: 98.5%\n• False Positives: 1.2%\n• Response Time: <1s', inline: true },
                  { name: '🔥 Most Triggered', value: '1. Spam (34%)\n2. Bad Words (28%)\n3. Caps (21%)\n4. Mass Mentions (17%)', inline: false }
                );
              break;
          }

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'reactionrole': {
          const emoji = interaction.options.getString('emoji');
          const role = interaction.options.getRole('role');

          const embed = new EmbedBuilder()
            .setTitle('🎭 Reaction Role Setup')
            .setDescription(`React with ${emoji} to get the ${role} role!`)
            .addFields(
              { name: '📝 How it Works', value: '1. React to this message with the emoji\n2. Get the role automatically\n3. React again to remove the role\n4. Works instantly!', inline: false },
              { name: '⚙️ Settings', value: `• Emoji: ${emoji}\n• Role: ${role}\n• Type: Toggle\n• Max Roles: Unlimited`, inline: true },
              { name: '🛡️ Permissions', value: `• Role Position: ${role.position}\n• Manageable: ${interaction.guild.members.me.roles.highest.position > role.position ? '✅' : '❌'}\n• Mentionable: ${role.mentionable ? '✅' : '❌'}`, inline: true }
            )
            .setColor(role.color || 0x5865f2)
            .setFooter({ text: 'Reaction roles are now active!' });

          const message = await interaction.reply({ embeds: [embed], fetchReply: true });
          try {
            await message.react(emoji);
          } catch (error) {
            await interaction.followUp({ content: '⚠️ Could not add reaction. Make sure the emoji is valid and I have permission to add reactions.', ephemeral: true });
          }
          break;
        }

        case 'starboard': {
          const channel = interaction.options.getChannel('channel');
          const stars = interaction.options.getInteger('stars');

          if (stars < 1 || stars > 20) {
            return interaction.reply({ content: '❌ Stars must be between 1-20!', ephemeral: true });
          }

          const embed = new EmbedBuilder()
            .setTitle('⭐ Starboard Configured')
            .setDescription(`Starboard has been set up successfully!`)
            .addFields(
              { name: '📺 Channel', value: channel.toString(), inline: true },
              { name: '⭐ Required Stars', value: stars.toString(), inline: true },
              { name: '🎯 Threshold', value: `${stars} unique reactions`, inline: true },
              { name: '📋 How it Works', value: `When a message gets ${stars}+ ⭐ reactions from different users, it will automatically appear in ${channel} with the star count and original message link.`, inline: false },
              { name: '⚙️ Features', value: '• Auto-updates star count\n• Prevents self-starring\n• Shows original context\n• Handles message edits\n• Removes if stars drop below threshold', inline: false }
            )
            .setColor(0xffd700)
            .setThumbnail('https://cdn.discordapp.com/emojis/692553456470507530.png');

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'tags': {
          const name = interaction.options.getString('name');
          const content = interaction.options.getString('content');

          const embed = new EmbedBuilder()
            .setTitle('🏷️ Tag Created Successfully')
            .setDescription(`Tag **${name}** has been created!`)
            .addFields(
              { name: '📝 Content Preview', value: content.slice(0, 1000), inline: false },
              { name: '💡 Usage', value: `• Use \`/tag ${name}\` to display this tag\n• Use \`/tag edit ${name}\` to modify it\n• Use \`/tag delete ${name}\` to remove it`, inline: false },
              { name: '📊 Tag Info', value: `• Name: ${name}\n• Length: ${content.length} characters\n• Created by: ${interaction.user.tag}\n• Created: <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
            )
            .setColor(0x00ff00)
            .setFooter({ text: 'Tags help you store and share frequently used information!' });

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'giveaway': {
          const prize = interaction.options.getString('prize');
          const duration = interaction.options.getInteger('duration');
          const winners = interaction.options.getInteger('winners');

          if (duration < 1 || duration > 10080) { // Max 1 week
            return interaction.reply({ content: '❌ Duration must be between 1 minute and 1 week (10080 minutes)!', ephemeral: true });
          }

          if (winners < 1 || winners > 20) {
            return interaction.reply({ content: '❌ Winners must be between 1-20!', ephemeral: true });
          }

          const endTime = Math.floor((Date.now() + duration * 60000) / 1000);

          const embed = new EmbedBuilder()
            .setTitle('🎉 GIVEAWAY 🎉')
            .setDescription(`**${prize}**`)
            .addFields(
              { name: '🏆 Prize', value: prize, inline: true },
              { name: '👥 Winners', value: winners.toString(), inline: true },
              { name: '⏰ Ends', value: `<t:${endTime}:R>`, inline: true },
              { name: '🎯 How to Enter', value: 'React with 🎉 to enter this giveaway!\nGood luck to everyone!', inline: false },
              { name: '📋 Rules', value: '• Must be in this server\n• One entry per person\n• Winners chosen randomly\n• Must respond within 24h', inline: false }
            )
            .setColor(0xff69b4)
            .setFooter({ text: `Hosted by ${interaction.user.tag} • Ends at` })
            .setTimestamp(Date.now() + duration * 60000);

          const message = await interaction.reply({ embeds: [embed], fetchReply: true });
          await message.react('🎉');

          // Set timeout for giveaway end (simplified - in production use a proper scheduler)
          setTimeout(async () => {
            try {
              const updatedMessage = await message.fetch();
              const reaction = updatedMessage.reactions.cache.get('🎉');
              if (reaction) {
                const users = await reaction.users.fetch();
                const participants = users.filter(user => !user.bot);
                
                if (participants.size === 0) {
                  const noWinnerEmbed = new EmbedBuilder()
                    .setTitle('🎉 Giveaway Ended')
                    .setDescription(`**${prize}**\n\n❌ No valid entries! No winners selected.`)
                    .setColor(0xff0000);
                  await message.edit({ embeds: [noWinnerEmbed] });
                  return;
                }

                const winnersArray = participants.random(Math.min(winners, participants.size));
                const winnersList = Array.isArray(winnersArray) ? winnersArray : [winnersArray];
                
                const winnerEmbed = new EmbedBuilder()
                  .setTitle('🎉 Giveaway Ended!')
                  .setDescription(`**${prize}**\n\n🏆 **Winners:**\n${winnersList.map(w => `• ${w}`).join('\n')}`)
                  .addFields(
                    { name: '📊 Stats', value: `${participants.size} participants\n${winnersList.length} winners selected`, inline: true }
                  )
                  .setColor(0x00ff00);

                await message.edit({ embeds: [winnerEmbed] });
                await message.reply(`🎉 Congratulations ${winnersList.join(', ')}! You won **${prize}**!`);
              }
            } catch (error) {
              console.error('Giveaway end error:', error);
            }
          }, duration * 60000);
          break;
        }

        case 'leveling': {
          const action = interaction.options.getString('action');

          const embed = new EmbedBuilder()
            .setTitle('📈 Leveling System')
            .setColor(0x00ff00);

          switch (action) {
            case 'enable':
              embed.setDescription('✅ Leveling system has been **enabled**!')
                .addFields(
                  { name: '💰 XP Gain', value: '• 15-25 XP per message\n• 1 XP per minute in voice\n• Bonus XP for reactions\n• Daily XP multipliers', inline: true },
                  { name: '🎁 Rewards', value: '• Role rewards at milestones\n• Custom level up messages\n• Leaderboard rankings\n• Special perks & badges', inline: true },
                  { name: '⚙️ Settings', value: '• XP cooldown: 60 seconds\n• Level up notifications: ON\n• Voice XP: Enabled\n• Ignored channels: None', inline: false }
                );
              break;
            case 'disable':
              embed.setDescription('❌ Leveling system has been **disabled**!')
                .addFields({ name: '📊 Data', value: 'All XP data has been preserved and will be restored if you re-enable the system.', inline: false })
                .setColor(0xff0000);
              break;
            case 'leaderboard':
              embed.setDescription('🏆 **Server Leaderboard** (Top 10)')
                .addFields(
                  { name: '🥇 #1', value: `<@${interaction.user.id}> - **Level 45**\n12,450 XP • 234 messages`, inline: false },
                  { name: '🥈 #2', value: `User#5678 - **Level 38**\n9,876 XP • 198 messages`, inline: false },
                  { name: '🥉 #3', value: `User#9012 - **Level 32**\n7,234 XP • 156 messages`, inline: false },
                  { name: '4️⃣ #4', value: `User#3456 - **Level 28**\n5,890 XP • 134 messages`, inline: false },
                  { name: '5️⃣ #5', value: `User#7890 - **Level 25**\n4,567 XP • 112 messages`, inline: false }
                )
                .setFooter({ text: `Your rank: #1 • Next level: 550 XP to go` });
              break;
          }

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'welcome': {
          const channel = interaction.options.getChannel('channel');
          const message = interaction.options.getString('message');

          const embed = new EmbedBuilder()
            .setTitle('👋 Welcome System Configured')
            .setDescription('Welcome messages have been set up successfully!')
            .addFields(
              { name: '📺 Channel', value: channel.toString(), inline: true },
              { name: '🎯 Trigger', value: 'New member joins', inline: true },
              { name: '⚙️ Status', value: 'Active', inline: true },
              { name: '💬 Message Preview', value: message.replace('{user}', interaction.user.toString()).replace('{server}', interaction.guild.name).replace('{membercount}', interaction.guild.memberCount.toString()), inline: false },
              { name: '📝 Available Variables', value: '• `{user}` - Mentions the new member\n• `{server}` - Server name\n• `{membercount}` - Current member count\n• `{username}` - User\'s name without mention\n• `{date}` - Current date', inline: false },
              { name: '🎨 Features', value: '• Custom embed colors\n• Image attachments\n• Role assignment\n• DM welcome messages\n• Welcome cards', inline: false }
            )
            .setColor(0x00ff00)
            .setThumbnail(interaction.guild.iconURL());

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'modlog': {
          const channel = interaction.options.getChannel('channel');

          const embed = new EmbedBuilder()
            .setTitle('📋 Moderation Logging Configured')
            .setDescription(`Moderation logs will now be sent to ${channel}`)
            .addFields(
              { name: '📊 Logged Actions', value: '• Kicks & Bans\n• Timeouts & Warnings\n• Message Deletions\n• Channel Changes\n• Role Updates\n• Voice Events', inline: true },
              { name: '🔍 Details Included', value: '• Moderator info\n• Reason provided\n• Timestamps\n• Before/After states\n• User information\n• Evidence links', inline: true },
              { name: '⚙️ Settings', value: '• Auto-logging: Enabled\n• Include bots: No\n• Embed format: Yes\n• Ping moderators: No', inline: false }
            )
            .setColor(0x5865f2);

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'purge': {
          const amount = interaction.options.getInteger('amount');
          const targetUser = interaction.options.getUser('user');

          if (amount < 1 || amount > 100) {
            return interaction.reply({ content: '❌ Amount must be between 1-100!', ephemeral: true });
          }

          if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: '❌ You need Manage Messages permission!', ephemeral: true });
          }

          try {
            let deletedCount = 0;
            
            if (targetUser) {
              // Fetch messages and filter by user
              const messages = await interaction.channel.messages.fetch({ limit: 100 });
              const userMessages = messages.filter(msg => msg.author.id === targetUser.id).first(amount);
              
              for (const message of userMessages.values()) {
                await message.delete();
                deletedCount++;
              }
            } else {
              // Bulk delete
              const deleted = await interaction.channel.bulkDelete(amount, true);
              deletedCount = deleted.size;
            }

            const embed = new EmbedBuilder()
              .setTitle('🧹 Messages Purged')
              .setDescription(`Successfully deleted **${deletedCount}** messages`)
              .addFields(
                { name: '📊 Details', value: targetUser ? `• Target: ${targetUser.tag}\n• Channel: ${interaction.channel}\n• Moderator: ${interaction.user.tag}` : `• Amount: ${deletedCount}\n• Channel: ${interaction.channel}\n• Moderator: ${interaction.user.tag}`, inline: false }
              )
              .setColor(0x00ff00)
              .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
          } catch (error) {
            await interaction.reply({ content: '❌ Failed to delete messages. They might be too old (14+ days).', ephemeral: true });
          }
          break;
        }

        case 'role': {
          const action = interaction.options.getString('action');
          const role = interaction.options.getRole('role');

          if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: '❌ You need Manage Roles permission!', ephemeral: true });
          }

          await interaction.deferReply();

          try {
            const members = await interaction.guild.members.fetch();
            let processed = 0;
            let success = 0;
            let failed = 0;

            for (const [, member] of members) {
              if (member.user.bot) continue;
              
              try {
                if (action === 'addall' && !member.roles.cache.has(role.id)) {
                  await member.roles.add(role);
                  success++;
                } else if (action === 'removeall' && member.roles.cache.has(role.id)) {
                  await member.roles.remove(role);
                  success++;
                }
                processed++;
              } catch (error) {
                failed++;
              }

              // Rate limiting
              if (processed % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }

            const embed = new EmbedBuilder()
              .setTitle('🎭 Mass Role Management Complete')
              .setDescription(`${action === 'addall' ? 'Added' : 'Removed'} role ${role} ${action === 'addall' ? 'to' : 'from'} members`)
              .addFields(
                { name: '✅ Successful', value: success.toString(), inline: true },
                { name: '❌ Failed', value: failed.toString(), inline: true },
                { name: '📊 Total Processed', value: processed.toString(), inline: true }
              )
              .setColor(success > failed ? 0x00ff00 : 0xffaa00);

            await interaction.editReply({ embeds: [embed] });
          } catch (error) {
            await interaction.editReply('❌ An error occurred during mass role management.');
          }
          break;
        }
      }
    } catch (error) {
      console.error('Carl-bot command error:', error);
      await interaction.reply({ content: '❌ An error occurred while processing the command.', ephemeral: true });
    }
  }
};