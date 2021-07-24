exports.run = (client, interaction) => {
	var selectinteraction = interaction;
	if(interaction.options.find(option => option.name === "add")) {
		var selectinteraction = interaction;
		var admin = require("firebase-admin");
		var serviceAccount = require("./pk.json");

		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
			databaseURL: "https://saffira-bot-default-rtdb.europe-west1.firebasedatabase.app"
		});
		var db = admin.database();
		
		var ref = db.ref("restrictedRoles"); 
		ref.once("value", function(snapshot) {
			var rows = [];
			var json = JSON.parse(snapshot.val());
			var jsonRoles = json.roles;
			var guildRoles = interaction.guild.roles.cache.map(role => role.name);
				
			roles = guildRoles.filter(function (item) { //Filter out json roles from guild roles
				return jsonRoles.indexOf(item) === -1;
			});
			roles = roles.sort();
			
			//We need to craft the options for the select menu before it's created.
			//First check if the user is under 18, to further define roles to display
			var options = [];
			roles.forEach(element => { //Setup options for our selects
				options.push({label: element, value: element});
			});	
				
			var maxLen = 25;
			if(options.length > maxLen) {
				var menus = options.length/maxLen;
					
				for (var i = 0; i < menus; i++) { //Here we break up our selects into seperate 25 max due to hard limits
					let indexLen = options.slice(i*maxLen,i*maxLen+maxLen).length;
					let firstIndexChar = options.slice(i*maxLen,i*maxLen+maxLen)[0]["value"].charAt(0); 
					let lastIndexChar = options.slice(i*maxLen,i*maxLen+maxLen)[indexLen-1]["value"].charAt(0);
					rows[i] = new client.messageActionRow().addComponents(
					new client.messageSelectMenu()
						.setCustomId(`roleadd`)
						.setMinValues(1)
						.setMaxValues(options.slice(i*maxLen,i*maxLen+maxLen).length)
						.setPlaceholder(`${firstIndexChar}-${lastIndexChar}`)
						.addOptions(options.slice(i*maxLen,i*maxLen+maxLen)),
					);
				}
			}
			interaction.reply({ content: 'Select roles to add:', ephemeral: true, components: rows });
		});
	}
	
	if(interaction.options.find(option => option.name === "remove")) {
		var roles = interaction.member.roles.cache.map(role => role.name).sort();
		var selectinteraction = interaction;
		var rows = [];
		
		var options = [];
		roles.forEach(element => {
			options.push({label: element, value: element});
		});	
				
		var maxLen = 25;
		var menus = options.length/maxLen;
			
			for (var i = 0; i < menus; i++) { //Here we break up our selects into seperate 25 max due to hard limits
				let indexLen = options.slice(i*maxLen,i*maxLen+maxLen).length;
				let firstIndexChar = options.slice(i*maxLen,i*maxLen+maxLen)[0]["value"].charAt(0);
				let lastIndexChar = options.slice(i*maxLen,i*maxLen+maxLen)[indexLen-1]["value"].charAt(0);
				rows[i] = new client.messageActionRow().addComponents(
				new client.messageSelectMenu()
					.setCustomId(`roleremove`)
					.setMinValues(1)
					.setMaxValues(options.slice(i*maxLen,i*maxLen+maxLen).length)
					.setPlaceholder(`${firstIndexChar}-${lastIndexChar}`)
					.addOptions(options.slice(i*maxLen,i*maxLen+maxLen)),
				);
			} 
		interaction.reply({ content: 'Select roles to remove:', ephemeral: true, components: rows });
	}
	
		client.on('interactionCreate', interaction => {
			if (!interaction.isSelectMenu()) return;
			if (interaction.customId === "roleadd") {
				var newRoles = [];
				interaction.values.forEach(element => { //Create an array of roles from the selected found in the guild
					newRoles.push(interaction.guild.roles.cache.find(r => r.name === element));
				});
				interaction.member.roles.add(newRoles).then(interaction.reply(({ content: 'New roles added!', ephemeral: true} )));
			}
			if (interaction.customId === "roleremove") {
				var newRoles = [];
				interaction.values.forEach(element => { //Create an array of roles from the selected found in the guild
					newRoles.push(interaction.guild.roles.cache.find(r => r.name === element));
				});
				interaction.member.roles.remove(newRoles).then(interaction.reply(({ content: 'Roles removed!', ephemeral: true} )));
			}
		});
}