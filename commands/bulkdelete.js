exports.run = (client, interaction) => {
  interaction.options.forEach(option => {
    if(option.name === "amount") {
      client.channels.fetch(interaction.channelID).then(channel => {
        channel.bulkDelete(option.value).then(messages => {
          interaction.reply( `Bulk deleted ${messages.size} messages`).catch(console.error);
        });
      });
    }
   });
}