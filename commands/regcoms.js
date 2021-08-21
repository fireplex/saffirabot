exports.run = (client, message, args) => {
	const commandData = [
		/*{
			name: "roles",
			description: "Manage your roles",
			options: [
				{
					name: "add",
					description: "Add a role",
					type: 1,
					options: [
						{
							name: "role",
							description: "The role to add",
							type: 8,
							required: true
						}
					]
				},
				{
					name: "remove",
					description: "Remove a role",
					type: 1,
					options: [
						{
							name: "role",
							description: "The role to remove",
							type: 8,
							required: true
						}
					]
				}
			]
		},*/
		{
      name: "bulkdelete",
      description: "Delete bulk messages in order of date (max 100)",
      defaultPermission: false,
      "options": [
        {
          name: "amount",
          description: "The amount to delete (max 100)",
          type: 4,
          required: true
        },
      ]
    },
		{
			name: "roleselect",
			description: "Manage your roles with a select menu",
			options: [
				{
					name: "add",
					description: "Add a role",
					type: 1
				},
				{
					name: "remove",
					description: "Remove a role",
					type: 1
				}
			]
		},
		{
      name: "colorroles",
      description: "Assign a color role to your name",
      options: [
        {
          name: "add",
          description: "Add a new color role to a user",
          type: 1,
          options: [
            {
              name: "hexcode",
              description: "The hex code of the color to use",
              type: 3,
              required: true
            }
          ]
        }
      ]
    },
		{
			name: "blacklist",
			description: "Role blacklist",
			defaultPermission: false,
			options: [
				{
					name: "add",
					description: "Add new roles to the blacklist",
					type: 1,
					options: [
						{
							name: "roles",
							description: "A list of roles to add, seperate these with ',' (THIS IS SENSITIVE TO SPACES)",
							type: "STRING",
							required: true
						}
					]
				},
				{
					name: "remove",
					description: "Remove new roles from the blacklist",
					type: 1,
					options: [
						{
							name: "roles",
							description: "A list of roles to remove, seperate these with ',' (THIS IS SENSITIVE TO SPACES)",
							type: "STRING",
							required: true
						}
					]
				},
				{
					name: "view",
					description: "View a list of currently blacklisted roles",
					type: 1
				}
			]
		}
	]

	message.guild.commands.set(commandData).then(message.channel.send("Coms reg'd")).catch(console.error);
}