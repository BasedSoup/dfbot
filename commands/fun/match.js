const { SlashCommandBuilder } = require('discord.js');
var stringSimilarity = require('string-similarity');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('match')
		.setDescription("Rates a couple's compatability out of 100")
        .addUserOption(option => option
            .setName('romeo')
            .setDescription('Top Dogger'))
        .addUserOption(option => option
            .setName('juliet')
            .setDescription('Top Dogged')),

	async execute(interaction) {
        var user1 = interaction.options.getUser('romeo');
        var user2 = interaction.options.getUser('juliet');
        var guild_u1 = interaction.guild.members.cache.get(user1.id);
        var guild_u2 = interaction.guild.members.cache.get(user2.id);
        var u1name = guild_u1.displayName.toLowerCase();
        var u2name = guild_u2.displayName.toLowerCase();
        var rating = stringSimilarity.compareTwoStrings(u1name, u2name);
        switch (true) {
            case (rating < 0.1):
		         await interaction.reply(`${rating} compatability? lad youve got no chance`);
                 break;
            case (rating < 0.3):
		         await interaction.reply(`Eh, ${rating * 100}%? Thats poor :frowning2:`);
                 break;
            case (rating < 0.5):
		         await interaction.reply(`I've seen worse. ${rating * 100}%`);
                 break;
            case (rating < 0.7):
		         await interaction.reply(`${rating * 100}% -  u can defo bag her`);
                 break;
            case (rating < 0.9):
		         await interaction.reply(`Wayhey,  ${rating * 100}%! :tada:`);
                 break;
             case (rating < 1):
		         await interaction.reply(`W rizz sexy boy. You got got yourself a  ${rating * 100}%! :man_dancing:`);
                 break;
             case (rating == 1):
		         await interaction.reply(`Silly bitch, I'm not falling for that. :middle_finger:`);
                 break;
             default:
		        await interaction.reply(`${rating * 100}%? You've broken something tho`);
                break;
        }
	},
};

