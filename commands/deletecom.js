exports.run = (client, message, args) => {
	if (args[0] === "true") {
		message.guild.commands.set([]).catch(console.error);
		message.channel.send("Global coms deleted").catch(console.error);
	} else {
		message.guild.commands.delete(args[0]).then(message.channel.send("Com deleted").catch(console.error)).catch(console.error);
	}
}