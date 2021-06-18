exports.run = (client, message, args) => {
	var commandString = [];
	message.guild.commands.fetch()
  .then(commands => {
		commands.forEach(command => {
			console.log(`${command.name}: ${command.id}`);
			commandString.push(`${command.name}: ${command.id} (guid: ${command.guild.id})`);
		});
		var messageString = "";
		commandString.forEach(element => {
			messageString += element + "\n";
		});
		message.channel.send(messageString || "No commands found").catch(console.error);
	}).catch(console.error);
}