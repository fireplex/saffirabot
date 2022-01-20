module.exports = (client, oldMember, newMember) => {
	if(newMember.isCommunicationDisabled()) {
		client.guilds.cache.find(guild => guild.id === "516779786811473939")
			.channels.cache.find(channel => channel.name === "logs")
			.send(`\`${newMember.displayName} was timed out.\``)
			.catch(console.error);
	}
}