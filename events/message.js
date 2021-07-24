module.exports = (client, message) => {

	if (message.content.includes("furaffinity.net/view/")) {
		console.log("FA link");
		const FurAffinityClient = require("fa.js").FurAffinityClient;
		const fa = new FurAffinityClient("b=XXX; a=XXX; s=1");

		var subID = message.content.split("www.furaffinity.net/view/")[1];
		var subURL = message.content;
		subID = subID.slice(0, -1); 
		message.delete();

		fa.getSubmission(subID).then((sub) => {
		    console.log(sub);
		    const embed = new client.embed();
		    embed.setAuthor(sub.artist, sub.artist_thumb);
		    embed.setImage(sub.url);
		    embed.setTitle(sub.title);
		    embed.setURL(subURL);
		    embed.setFooter(`Created ${sub.when} | ${sub.when_title}`);
		    message.channel.send({ content: '** **', embeds: [embed] });
		});
	}

	if (message.author.bot) return;

	if (!message.content.match(/db\.|Db\.|DB\./)) return;
	
	const args = message.content.slice(3).trim().split(/ +/g);

	const command = args.shift().toLowerCase();
	
	const cmd = client.commands.get(command);
	
	if (!cmd) return;
	
	cmd.run(client, message, args);
};
