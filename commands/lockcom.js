exports.run = async (client, message, args) => {
	const command = await message.guild.commands.fetch(args[0]);

	const permissions = [
		{
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
	];

	await command.permissions.add({ permissions });
}