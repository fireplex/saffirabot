exports.run = (client, interaction) => {
  interaction.reply(`Websocket heartbeat: ${client.ws.ping}ms`, { ephemeral: true }).catch(console.error);
}