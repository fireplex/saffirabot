exports.run = (client, message, args) => {
	message.guild.commands.setPermissions(args[0], [{
			id: '809366915675324466', //Danneth
			type: 'ROLE',
			permission: true,
		},
		{
			id: '809393947583184960', //Viv
			type: 'ROLE',
			permission: true,
		},
		{
			id: '836184261723291658', //Mod
			type: 'ROLE',
			permission: true,
		},
		{
			id: '185077819557150720', //Me
			type: 'USER',
			permission: true,
		}
	]).then(message.channel.send("Com unlocked")).catch(console.error);
}