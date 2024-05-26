const { SlashCommandBuilder} = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { google } = require('googleapis');
const ffmpeg = require('ffmpeg-static');
const { OAuth2Client } = require('google-auth-library');
const youtube = google.youtube('v3');
const oauth2Client = new OAuth2Client(process.env.YT_CLIENT_ID, process.env.YT_CLIENT_SECRET, 'http://localhost');

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
                part: 'snippet',
                q: query,
                type: 'video',
                auth: oauth2Client});
            console.log(response);
            const video = response.data.items[0];
            const url = `https://www.youtube.com/watch?v=${video.id.videoId}`;
            playSong(interaction, url);
        } catch (error) {
            console.error('Error earching for video: ', error);
            interaction.reply('Cant find the video');
        }
	},
};

async function playSong(interaction, url) {
    const guild = interaction.member.guild;
    const member = guild.members.cache.get(interaction.member.user.id);
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
        return interaction.reply('join vc first');
    }

    const connection = joinVoiceChannel({
        channelID: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator
    });

    console.log(voiceChannel);
    console.log(connection);

    const stream = ytdl(url, { filter: 'audioonly' });
    const resource = createAudioResource(stream);

    const player = createAudioPlayer();
    connection.subscribe(player);
    player.play(resource);

    connection.on('debug', (m) => {
        console.log('voice debug:', m);
    });

/*
    player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
    });
*/
    interaction.reply(`Now playing: ${url}`);
    }
