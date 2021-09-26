module.exports = (client, interaction) => {
	const io = require('@pm2/io');

	const currentInteractions = io.counter({
		name: 'Realtime interactions count',
		id: 'bot/realtime/interactions'
	});
	if (!interaction.isCommand()) return;

	const command = interaction.commandName;
	const cmd = client.commands.get(command);
	
	if (!cmd) return;
	
	currentInteractions.inc();
	cmd.run(client, interaction);
}