module.exports = (client, interaction) => {
  if (!interaction.isCommand()) return;

	const command = interaction.commandName;
  const cmd = client.commands.get(command);
	
	if (!cmd) return;
	
	cmd.run(client, interaction);
}