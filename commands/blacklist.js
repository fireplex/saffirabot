exports.run = (client, interaction) => {
	var admin = require("firebase-admin");
	var serviceAccount = require("./saffira-bot-firebase-adminsdk-s9opn-6c877e1f23.json");
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
		databaseURL: "https://saffira-bot-default-rtdb.europe-west1.firebasedatabase.app"
	});
	
	var db = admin.database();
	if(interaction.options.find(option => option.name === "add")) {
		function uniqueArray(arr) { //Remove duplicates
			return arr.filter(function(item, index){
				return arr.indexOf(item) >= index;
			});
		}
		
		var ref = db.ref("restrictedRoles"); 
		ref.once("value", function(snapshot) {
			var json = JSON.parse(snapshot.val());
			var argsRoles = interaction.options[0].options[0].value.split(","); //Structure args into array and concat
			argsRoles = argsRoles.concat(json.roles);
			var roles = '{"roles":' + JSON.stringify(uniqueArray(argsRoles)) + "}";
			db.ref('/').update({
				restrictedRoles: roles
				}, function(error) {
					if (error) {
						interaction.reply("Write failed: " + error).catch(console.error);
						admin.app().delete()
					} else {
						interaction.reply(`Restricted roles successfully`).catch(console.error);
						admin.app().delete()
					}
				}
			);
		});
	}

	if(interaction.options.find(option => option.name === "remove")) {
		ref.once("value", function(snapshot) {
			var json = JSON.parse(snapshot.val());
			var jsonRoles = json.roles;
			var argsRoles = interaction.options[0].options[0].value.split(","); //Structure args into array
			
			roles = jsonRoles.filter(function (item) { //Filter out args roles from json roles
					return argsRoles.indexOf(item) === -1;
			});
			roles = '{"roles":' + JSON.stringify(roles) + "}";
			db.ref('/').update({
				restrictedRoles: roles
				}, function(error) {
					if (error) {
						interaction.reply("Write failed: " + error).catch(console.error);
						admin.app().delete()
					} else {
						interaction.reply(`Unrestricted roles successfully`).catch(console.error);
						admin.app().delete()
					}
				}
			);
		});
	}

	if(interaction.options.find(option => option.name === "view")) {
		var ref = db.ref("restrictedRoles"); 
		ref.once("value", function(snapshot) {
			var json = JSON.parse(snapshot.val());
			var jsonRoles = json.roles;
			
			var embed = new client.Discord.MessageEmbed()
				.addField("Restricted roles:", jsonRoles.join(", ") || "NULL")
				interaction.reply(embed).catch(console.error);
			admin.app().delete()
		});
	}
}