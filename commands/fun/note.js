const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = { 
	data: new SlashCommandBuilder()
		.setName('note')
		.setDescription("Discord wide labelling")
        .addSubcommand(subcommand =>
		subcommand
			.setName('add')
			.setDescription('Stick a Post-it note on someone!')
            .addUserOption(option => option
                .setName('victim')
                .setDescription('Who\'s getting stuck?'))
            .addStringOption(option => option
            .setName('message')
            .setDescription('Whatcha stickin?')))
        .addSubcommand(subcommand =>
		subcommand
			.setName('list')
			.setDescription('View Post-it notes')
            .addUserOption(option => option
                .setName('victim')
                .setDescription('Check their back'))),

	async execute(interaction) {
        var notedata = JSON.parse(fs.readFileSync('./commands/fun/notes.json', 'utf-8')) // load notes json data
        var user1 = interaction.user; // get info needed for notes
        var user2 = interaction.options.getUser('victim');
        var curCommand = interaction.options.getSubcommand();
        var newMsg = interaction.options.getString('message');
        var u2notes = notedata.find((element) => element.id == user2.id);
        switch (curCommand) {
            case 'add':
                if (u2notes == undefined) {
                    var newnote = {
                    "id": user2.id,
                     "notes": [
                      {
                        "message": newMsg, 
                        "author": {
                           "name":user1.username,
                           "id": user1.id
                        }}]}
                notedata.push(newnote);
                } else {
                   newnote = {
                    "message": newMsg,
                    "author": {
                        "name":user1.username,
                        "id":user1.id
                    }}
                   u2notes.push(newnote); 
                }
                fs.writeFileSync('./commands/fun/notes.json', JSON.stringify(notedata, null, 2), 'utf-8') // save notes json data
		        await interaction.reply(`${user2.username}'s new note:\n${newMsg}\n- ${user1.username}`);
                break;

             case 'list':
                    
                    var messagelist = []
                    try {
                        for (i = 1; i < 6; i++){
                            curnotedata = u2notes.notes[u2notes.notes.length - i];
                            // _s = `${curnotedata.message}\n- ${curnotedata.author.name}\n`; 
                            _s = { name: curnotedata.author.name, value: curnotedata.message}
                            messagelist.push(_s);
}} catch (error) { }
                    try {
                    const noteEmbed = new EmbedBuilder()
                    .setTitle(`${user2.username}'s Notes:\n`)
                    .setFooter(`Page 1/${u2notes.notes.length}`)
                    .addFields(messagelist)
		        await interaction.reply({ embeds: [noteEmbed]});
                    } catch (error){
                        await interaction.reply(`${user2.username} has no notes. :frowning2:`);
                    }
                break;

             default:
		        await interaction.reply('Use a real command lol');
                break;
        }
	},
};

