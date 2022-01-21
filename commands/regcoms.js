exports.run = (client, message, args) => {
	const commandData = [
		{
			name: "bot",
			description: "Bot controls",
			defaultPermission: false,
			options: [
				{
					name: "shutdown",
					description: "Shutdown the PM2 Process and the bot",
					type: 1,
				},
				{
					name: "start",
					description: "Starts the PM2 Process and the bot",
					type: 1,
				}
			]
		},
	]

	message.guild.commands.set(commandData).then(message.channel.send("Coms reg'd")).catch(console.error);
}