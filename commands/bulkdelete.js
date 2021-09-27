exports.run = (client, interaction) => {
  client.channels.fetch(interaction.channelId).then(channel => {
    channel.bulkDelete(interaction.options.getInteger("amount")).then(messages => {
      interaction.reply( `Bulk deleted ${messages.size} messages`).catch(console.error);
    });
  });
}