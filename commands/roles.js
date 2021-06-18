exports.run = (client, interaction) => {
	if(interaction.options.find(option => option.name === "add")) {
		//Init firebase

		var admin = require("firebase-admin");
		var serviceAccount = require("./saffira-bot-firebase-adminsdk-s9opn-6c877e1f23.json");
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
			databaseURL: "https://saffira-bot-default-rtdb.europe-west1.firebasedatabase.app"
		});
		
		var db = admin.database();
		
		var ref = db.ref("restrictedRoles"); 
		ref.once("value", function(snapshot) {
			var json = JSON.parse(snapshot.val()).roles;
			var jsonRoles = JSON.parse(snapshot.val()).roles;
			var argRole = interaction.options[0].options[0].role.name;
			for(var i=0; i<json.length; i++){
				jsonRoles[i]=json[i]+"\\b";
			}
			//return console.log(interaction.member.roles.cache.some(r => r.name === "Hatchling"), `'${argRole}'`, argRole.match(/(Weeb Dergs)|(Gamer Dergs)|(Roleplay Dergs)/gi));
			if(interaction.member.roles.cache.some(r => r.name === "Hatchling") == false) { //NOT A HATCHLING, PASS TO MANUAL CHECK
				if(argRole.match(/(Weeb Dergs)|(Gamer Dergs)|(Roleplay Dergs)/gi)) { //User wants standard role
					interaction.member.roles.add(interaction.options[0].options[0].role)
					.then(function() {
						if(interaction.member.roles.cache.get(interaction.options[0].options[0].role.id)) {
							interaction.reply(`Role **${argRole}** added successfully`).catch(console.error);
						}
					}).catch(function(error) {
						if(error) {
							interaction.reply("Failed to add role").catch(console.error);
						}
					});
				} else {
					if (new RegExp(jsonRoles.join("|"),"i").test(argRole)) {
						interaction.reply("You don't have permission to add this role").catch(console.error);
					} else {
						interaction.member.roles.add(interaction.options[0].options[0].role)
						.then(function() {
							if(interaction.member.roles.cache.get(interaction.options[0].options[0].role.id)) {
								interaction.reply(`Role **${argRole}** added successfully`).catch(console.error);
							}
						}).catch(function(error) {
							if(error) {
								interaction.reply("Failed to add role").catch(console.error);
							}
						});
					}
				}
			} else { //IS A HATCHLING, PASS BLACKLIST CHECK
				if (new RegExp(jsonRoles.join("|"),"i").test(argRole)) {
					interaction.reply("You don't have permission to add this role").catch(console.error);
				} else {
					interaction.member.roles.add(interaction.options[0].options[0].role)
					.then(function() {
						if(interaction.member.roles.cache.get(interaction.options[0].options[0].role.id)) {
							interaction.reply(`Role **${argRole}** added successfully`).catch(console.error);
						}
					}).catch(function(error) {
						if(error) {
							interaction.reply("Failed to add role").catch(console.error);
						}
					});
				}
			}
			admin.app().delete() 
		});
	}

	if(interaction.options.find(option => option.name === "remove")) {
		interaction.member.roles.remove(interaction.options[0].options[0].role)
			.then(interaction.reply("Role removed").catch(console.error)).catch(console.error);
	}
}