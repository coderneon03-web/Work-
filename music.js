const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');

// Simple queue system
const queues = new Map();
const players = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('music')
    .setDescription('Music player commands')
    .addSubcommand(sub => sub
      .setName('play')
      .setDescription('Play a song')
      .addStringOption(o => o.setName('query').setDescription('Song name or URL').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('skip')
      .setDescription('Skip current song'))
    .addSubcommand(sub => sub
      .setName('stop')
      .setDescription('Stop music and clear queue'))
    .addSubcommand(sub => sub
      .setName('queue')
      .setDescription('Show current queue'))
    .addSubcommand(sub => sub
      .setName('pause')
      .setDescription('Pause/Resume music'))
    .addSubcommand(sub => sub
      .setName('nowplaying')
      .setDescription('Show currently playing song'))
    .addSubcommand(sub => sub
      .setName('volume')
      .setDescription('Set volume (1-100)')
      .addIntegerOption(o => o.setName('level').setDescription('Volume level').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('loop')
      .setDescription('Toggle loop mode'))
    .addSubcommand(sub => sub
      .setName('shuffle')
      .setDescription('Shuffle the queue')),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const voiceChannel = interaction.member.voice.channel;

    // Check if user is in voice channel for most commands
    if (!voiceChannel && ['play', 'skip', 'stop', 'pause', 'volume'].includes(subcommand)) {
      return interaction.reply({ content: '❌ You need to join a voice channel first!', ephemeral: true });
    }

    try {
      switch (subcommand) {
        case 'play': {
          const query = interaction.options.getString('query');
          
          await interaction.reply('🔍 Searching for your song...');
          
          try {
            // Simulate song search and add to queue
            const song = {
              title: this.extractSongTitle(query),
              url: query,
              duration: Math.floor(Math.random() * 300) + 60, // Random duration 1-5 minutes
              thumbnail: `https://picsum.photos/320/320?random=${Date.now()}`,
              requestedBy: interaction.user
            };

            // Get or create queue
            let queue = queues.get(interaction.guildId);
            if (!queue) {
              queue = {
                songs: [],
                playing: false,
                connection: null,
                player: null,
                volume: 50,
                loop: false
              };
              queues.set(interaction.guildId, queue);
            }

            queue.songs.push(song);

            if (!queue.playing) {
              await this.playSong(interaction, queue, voiceChannel);
            }

            const embed = new EmbedBuilder()
              .setTitle('🎵 Added to Queue')
              .setDescription(`**${song.title}**`)
              .addFields(
                { name: 'Duration', value: this.formatDuration(song.duration), inline: true },
                { name: 'Position', value: `${queue.songs.length}`, inline: true },
                { name: 'Requested by', value: interaction.user.toString(), inline: true }
              )
              .setThumbnail(song.thumbnail)
              .setColor(0x1db954);

            await interaction.editReply({ embeds: [embed] });
          } catch (error) {
            console.error('Music play error:', error);
            await interaction.editReply('❌ Error playing music. Please try a different song.');
          }
          break;
        }

        case 'skip': {
          const queue = queues.get(interaction.guildId);
          if (!queue || !queue.playing) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
          }

          if (queue.player) {
            queue.player.stop();
          }
          await interaction.reply('⏭️ Skipped the current song!');
          break;
        }

        case 'stop': {
          const queue = queues.get(interaction.guildId);
          if (!queue || !queue.playing) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
          }

          queue.songs = [];
          if (queue.player) {
            queue.player.stop();
          }
          if (queue.connection) {
            queue.connection.destroy();
          }
          queues.delete(interaction.guildId);
          
          await interaction.reply('⏹️ Stopped music and cleared queue!');
          break;
        }

        case 'queue': {
          const queue = queues.get(interaction.guildId);
          if (!queue || queue.songs.length === 0) {
            return interaction.reply({ content: '❌ Queue is empty!', ephemeral: true });
          }

          const current = queue.songs[0];
          const upcoming = queue.songs.slice(1, 11).map((song, i) => 
            `${i + 2}. **${song.title}** - \`${this.formatDuration(song.duration)}\``
          ).join('\n');

          const embed = new EmbedBuilder()
            .setTitle('🎶 Current Queue')
            .setDescription(`**Now Playing:**\n1. ${current.title}\n\n**Up Next:**\n${upcoming || 'No upcoming songs'}`)
            .addFields(
              { name: '🔄 Loop', value: queue.loop ? 'Enabled' : 'Disabled', inline: true },
              { name: '🔊 Volume', value: `${queue.volume}%`, inline: true }
            )
            .setColor(0x1db954)
            .setFooter({ text: `${queue.songs.length} songs in queue` });

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'pause': {
          const queue = queues.get(interaction.guildId);
          if (!queue || !queue.playing) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
          }

          if (queue.player) {
            if (queue.player.state.status === AudioPlayerStatus.Paused) {
              queue.player.unpause();
              await interaction.reply('▶️ Resumed music!');
            } else {
              queue.player.pause();
              await interaction.reply('⏸️ Paused music!');
            }
          }
          break;
        }

        case 'nowplaying': {
          const queue = queues.get(interaction.guildId);
          if (!queue || !queue.playing || queue.songs.length === 0) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
          }

          const song = queue.songs[0];
          const embed = new EmbedBuilder()
            .setTitle('🎶 Now Playing')
            .setDescription(`**${song.title}**`)
            .addFields(
              { name: 'Duration', value: this.formatDuration(song.duration), inline: true },
              { name: 'Requested by', value: song.requestedBy.toString(), inline: true },
              { name: 'Queue Position', value: `1 of ${queue.songs.length}`, inline: true },
              { name: '🔊 Volume', value: `${queue.volume}%`, inline: true },
              { name: '🔄 Loop', value: queue.loop ? 'Enabled' : 'Disabled', inline: true }
            )
            .setThumbnail(song.thumbnail)
            .setColor(0x1db954);

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('music_pause')
              .setLabel(queue.player && queue.player.state.status === AudioPlayerStatus.Paused ? '▶️ Resume' : '⏸️ Pause')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('music_skip')
              .setLabel('⏭️ Skip')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId('music_stop')
              .setLabel('⏹️ Stop')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('music_loop')
              .setLabel('🔄 Loop')
              .setStyle(queue.loop ? ButtonStyle.Success : ButtonStyle.Secondary)
          );

          await interaction.reply({ embeds: [embed], components: [row] });
          break;
        }

        case 'volume': {
          const level = interaction.options.getInteger('level');
          
          if (level < 1 || level > 100) {
            return interaction.reply({ content: '❌ Volume must be between 1-100!', ephemeral: true });
          }

          const queue = queues.get(interaction.guildId);
          if (!queue) {
            return interaction.reply({ content: '❌ No music session active!', ephemeral: true });
          }

          queue.volume = level;
          
          const embed = new EmbedBuilder()
            .setTitle('🔊 Volume Updated')
            .setDescription(`Volume set to **${level}%**`)
            .setColor(0x1db954);

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'loop': {
          const queue = queues.get(interaction.guildId);
          if (!queue) {
            return interaction.reply({ content: '❌ No music session active!', ephemeral: true });
          }

          queue.loop = !queue.loop;
          
          const embed = new EmbedBuilder()
            .setTitle('🔄 Loop Mode')
            .setDescription(`Loop mode is now **${queue.loop ? 'enabled' : 'disabled'}**`)
            .setColor(queue.loop ? 0x00ff00 : 0xff0000);

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'shuffle': {
          const queue = queues.get(interaction.guildId);
          if (!queue || queue.songs.length <= 1) {
            return interaction.reply({ content: '❌ Need at least 2 songs to shuffle!', ephemeral: true });
          }

          // Shuffle all songs except the currently playing one
          const currentSong = queue.songs.shift();
          queue.songs = this.shuffleArray(queue.songs);
          queue.songs.unshift(currentSong);

          const embed = new EmbedBuilder()
            .setTitle('🔀 Queue Shuffled')
            .setDescription(`Shuffled **${queue.songs.length - 1}** songs in the queue`)
            .setColor(0x1db954);

          await interaction.reply({ embeds: [embed] });
          break;
        }
      }
    } catch (error) {
      console.error('Music command error:', error);
      const errorReply = { content: '❌ An error occurred while processing the music command.', ephemeral: true };
      
      if (interaction.deferred) {
        await interaction.editReply(errorReply);
      } else {
        await interaction.reply(errorReply);
      }
    }
  },

  async playSong(interaction, queue, voiceChannel) {
    if (queue.songs.length === 0) {
      queue.playing = false;
      return;
    }

    const song = queue.songs[0];
    queue.playing = true;

    try {
      // Join voice channel
      if (!queue.connection) {
        queue.connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guildId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });
      }

      // Create audio player
      if (!queue.player) {
        queue.player = createAudioPlayer();
        queue.connection.subscribe(queue.player);
      }

      // Simulate audio resource (in real implementation, you'd use ytdl-core or similar)
      const resource = createAudioResource('https://www.soundjay.com/misc/sounds/bell-ringing-05.wav');
      
      // Play the song
      queue.player.play(resource);

      // Handle player events
      queue.player.once(AudioPlayerStatus.Idle, () => {
        if (queue.loop && queue.songs.length > 0) {
          // If loop is enabled, move current song to end of queue
          const currentSong = queue.songs.shift();
          queue.songs.push(currentSong);
        } else {
          queue.songs.shift();
        }
        
        this.playSong(interaction, queue, voiceChannel);
      });

      // Send now playing message
      const embed = new EmbedBuilder()
        .setTitle('🎵 Now Playing')
        .setDescription(`**${song.title}**`)
        .addFields(
          { name: 'Requested by', value: song.requestedBy.toString(), inline: true },
          { name: 'Duration', value: this.formatDuration(song.duration), inline: true }
        )
        .setThumbnail(song.thumbnail)
        .setColor(0x1db954);

      if (interaction.channel) {
        interaction.channel.send({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Play song error:', error);
      queue.songs.shift();
      this.playSong(interaction, queue, voiceChannel);
    }
  },

  extractSongTitle(query) {
    // Simple title extraction from query
    if (query.includes('youtube.com') || query.includes('youtu.be')) {
      return 'YouTube Song';
    } else if (query.includes('spotify.com')) {
      return 'Spotify Track';
    } else {
      return query.length > 50 ? query.slice(0, 50) + '...' : query;
    }
  },

  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // Register button handlers
  registerHandlers(client) {
    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton() || !interaction.customId.startsWith('music_')) return;

      const queue = queues.get(interaction.guildId);

      try {
        switch (interaction.customId) {
          case 'music_pause':
            if (!queue || !queue.playing) {
              return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
            }
            
            if (queue.player.state.status === AudioPlayerStatus.Paused) {
              queue.player.unpause();
              await interaction.reply({ content: '▶️ Resumed!', ephemeral: true });
            } else {
              queue.player.pause();
              await interaction.reply({ content: '⏸️ Paused!', ephemeral: true });
            }
            break;

          case 'music_skip':
            if (!queue || !queue.playing) {
              return interaction.reply({ content: '❌ Nothing to skip!', ephemeral: true });
            }
            
            queue.player.stop();
            await interaction.reply({ content: '⏭️ Skipped!', ephemeral: true });
            break;

          case 'music_stop':
            if (!queue || !queue.playing) {
              return interaction.reply({ content: '❌ Nothing to stop!', ephemeral: true });
            }
            
            queue.songs = [];
            queue.player.stop();
            queue.connection.destroy();
            queues.delete(interaction.guildId);
            await interaction.reply({ content: '⏹️ Stopped!', ephemeral: true });
            break;

          case 'music_loop':
            if (!queue) {
              return interaction.reply({ content: '❌ No music session active!', ephemeral: true });
            }
            
            queue.loop = !queue.loop;
            await interaction.reply({ content: `🔄 Loop ${queue.loop ? 'enabled' : 'disabled'}!`, ephemeral: true });
            break;
        }
      } catch (error) {
        console.error('Music button error:', error);
        await interaction.reply({ content: '❌ Error processing music control.', ephemeral: true });
      }
    });
  }
};