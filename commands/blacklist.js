exports.run = (client, interaction) => {
	var admin = require("firebase-admin");
	var serviceAccount = require("./pk.json");
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
		databaseURL: "https://saffira-bot-default-rtdb.europe-west1.firebasedatabase.app"
	});
	
	var db = admin.database();
	if(interaction.options.getSubCommand() === "add") {
		interaction.defer().then(() => {
			function uniqueArray(arr) { //Remove duplicates
				return arr.filter(function(item, index){
					return arr.indexOf(item) >= index;
				});
			}
			
			var ref = db.ref("restrictedRoles"); 
			ref.once("value", function(snapshot) {
				var json = JSON.parse(snapshot.val());
				var argsRoles = interaction.options.getString("roles").split(",");
				argsRoles = argsRoles.concat(json.roles);
				var roles = '{"roles":' + JSON.stringify(uniqueArray(argsRoles)) + "}";
				db.ref('/').update({
					restrictedRoles: roles
					}, function(error) {
						if (error) {
							interaction.editReply("Write failed: " + error).catch(console.error);
							admin.app().delete()
						} else {
							interaction.editReply(`Restricted roles successfully`).catch(console.error);
							admin.app().delete()
						}
					}
				);
			});
		});
	}

	if(interaction.options.getSubCommand() === "remove") {
		interaction.defer().then(() => {
			var ref = db.ref("restrictedRoles"); 
			ref.once("value", function(snapshot) {
				var json = JSON.parse(snapshot.val());
				var jsonRoles = json.roles;
				var argsRoles = interaction.options.getString("roles").split(",");
				
				roles = jsonRoles.filter(function (item) { //Filter out args roles from json roles
						return argsRoles.indexOf(item) === -1;
				});
				roles = '{"roles":' + JSON.stringify(roles) + "}";
				db.ref('/').update({
					restrictedRoles: roles
					}, function(error) {
						if (error) {
							interaction.editReply("Write failed: " + error).catch(console.error);
							admin.app().delete()
						} else {
							interaction.editReply(`Unrestricted roles successfully`).catch(console.error);
							admin.app().delete()
						}
					}
				);
			});
		});
	}

	if(interaction.options.getSubCommand() === "view") {
		interaction.defer().then(() => {
			var ref = db.ref("restrictedRoles"); 
			ref.once("value", function(snapshot) {
				var json = JSON.parse(snapshot.val());
				var jsonRoles = json.roles;

				console.log(json, jsonRoles);
				
				var embed = new client.Discord.MessageEmbed()
					.addField("Restricted roles:", jsonRoles.join(", ") || "NULL");
				
				console.log(embed);
				interaction.editReply({ content: '** **', embeds: [embed] }).catch(console.error);
				admin.app().delete()
			});
		});
	}
}