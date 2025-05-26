const { SlashCommandBuilder} = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { google } = require('googleapis');
const ffmpeg = require('ffmpeg-static');
const { OAuth2Client } = require('google-auth-library');
const youtube = google.youtube('v3');
const oauth2Client = new OAuth2Client(
    process.env.YT_CLIENT_ID,
    process.env.YT_CLIENT_SECRET,
    'http://localhost:3000/callback'
);

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription("Plays a song from YT")
        .addStringOption(option => option
            .setName('song')
            .setDescription('Search Query')
            .setRequired(true)),

	async execute(interaction) {
        const query = interaction.options.getString('song');
        try {
            const response = await youtube.search.list({
                part: ['snippet'],
                q: query,
                type: ['video'],
                maxResults: 1,
                auth: oauth2Client
            });
            
            if (!response.data.items || response.data.items.length === 0) {
                return interaction.reply('No videos found for that search query.');
            }
            
            const video = response.data.items[0];
            const url = `https://www.youtube.com/watch?v=${video.id.videoId}`;
            await playSong(interaction, url);
        } catch (error) {
            console.error('Error searching for video: ', error);
            await interaction.reply('Error searching for video. Please try again.');
        }
	},
};

async function playSong(interaction, url) {
    const guild = interaction.member.guild;
    const member = guild.members.cache.get(interaction.member.user.id);
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
        return interaction.reply('Please join a voice channel first.');
    }

    try {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        });

        const stream = ytdl(url, { 
            filter: 'audioonly',
            quality: 'highestaudio'
        });
        
        const resource = createAudioResource(stream, {
            inputType: 'opus'
        });

        const player = createAudioPlayer();
        connection.subscribe(player);
        player.play(resource);

        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
        });

        await interaction.reply(`Now playing: ${url}`);
    } catch (error) {
        console.error('Error playing song:', error);
        await interaction.reply('Error playing the song. Please try again.');
    }
}
