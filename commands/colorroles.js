exports.run = (client, interaction) => {
  if(interaction.options[0].name === "add") {
    const namedColors = require("color-name-list");
    const nearestColor = require("nearest-color");

    var colorHex = null;
    var user = null;

    interaction.options[0].options.forEach(element => {
      if (element.name === "hexcode") {
        colorHex = element.value;
      }
      if (element.name === "user") {     
        user = element.value;
      }
    });

    client.guilds.fetch(interaction.guildID).then(guild => {
      //guild.members.cache.find(user => user.id ===).then(member => {
				var member = interaction.member;
				//console.log(member.roles.cache);
        //If we can't assign a color, use nearestColor to find one and use that
        if(!namedColors.find(color => color.hex === colorHex)) {
          const colors = namedColors.reduce((o, { name, hex }) => Object.assign(o, { [name]: hex }), {});
          const nearest = nearestColor.from(colors);

          var messageColor = {};
          messageColor.name = nearest(colorHex).name;
          messageColor.hex = nearest(colorHex).value;
          //return console.log(messageColor.name);
        } else {
          var messageColor = namedColors.find(color => color.hex === colorHex.toLowerCase());
        }

        console.log(messageColor);

        //Check if the role name exists in the guild cache, if it doesn't we can create it
        let guildColor = guild.roles.cache.find(role => role.name === messageColor.name);
        if(guildColor) { //If guildColor is true we have a color in the guild already, thus add it
          member.roles.add(guildColor).then(function() {
            interaction.reply(`Role **${guildColor.name}** added successfully`, { ephemeral: true }).catch(console.error);
          }).catch(function(error) {
            if(error) {
              interaction.reply(error.message).catch(console.error);
              console.error();
            }
          });
        } else { //Color doesn't exist, simply create it and add it.
          let botRole = guild.roles.cache.find(role => role.name === "SaffiraBot(rewrite)"); //Get the bots role for its positional number
          console.log(botRole.position);
          guild.roles.create({
            name: messageColor.name,
            color: messageColor.hex,
            position: botRole.position-1,
            reason: 'Role color didnt exist'
          }).then(newRole => {
            //Before we add the role, hoist it to the highest position possible, this ensures that it's
            //visible above the users other roles!
            member.roles.add(newRole).then(function() {
              interaction.reply(`Role **${newRole.name}** added successfully`, { ephemeral: true }).catch(console.error);
            }).catch(function(error) {
              if(error) {
                interaction.reply(error.message, {ephemeral: true}).catch(console.error);
                console.error(error);
              }
            });
          }).catch(function(error) {
            if(error) {
              interaction.reply(error.message, {ephemeral: true}).catch(console.error);
              console.error(error);
            }
          });
        }
      //});
    });
  }
}