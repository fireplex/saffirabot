client.on('ready', () => {
  console.log("ONLINE");

  const commandData = {

  }
  client.api.applications(client.user.id).guilds("809214093163626527").commands.post({
      data: {
          name: "ping",
          description: "Get the roundtrip ping of the Discord API"
      }
  });

  client.api.applications(client.user.id).guilds("809214093163626527").commands.post({
    data: {
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
    }
  });

  client.api.applications(client.user.id).guilds("809214093163626527").commands.post({
    data: {
      name: "bulkdelete",
      description: "Delete bulk messages in order of date (max 100)",
      default_permission: false,
      "options": [
        {
          name: "amount",
          description: "The amount to delete (max 100)",
          type: 4,
          required: true
        },
      ]
    }
  });

  client.api.applications(client.user.id).guilds("809214093163626527").commands.post({
    data: {
      name: "colorroles",
      description: "Assign a color role to your name",
      default_permission: false,
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
            },
            {
              name: "user",
              description: "User to assign the color role to",
              type: 6,
              required: true
            }
          ]
        },
        {
          name: "edit",
          description: "Edit an exisitng color roles name and color",
          type: 2,
          options: [
            {
              name: "name",
              description: "Edit the name of a selected color role",
              type: 1,
              options: [
                {
                  name: "role",
                  description: "The role to edit",
                  type: 8,
                  required: true
                },
                {
                  name: "name",
                  description: "The new name for the color role",
                  type: 3,
                  required: true
                }
              ]
            },
            {
              name: "color",
              description: "Edit the color of a selected color role",
              type: 1,
              options: [
                {
                  name: "role",
                  description: "The role to edit",
                  type: 8,
                  required: true
                },
                {
                  name: "hexcode",
                  description: "The new color for the color role",
                  type: 3,
                  required: true
                }
              ]
            }
          ]
        }
      ]
    }
  });

  client.ws.on('INTERACTION_CREATE', async interaction => {
    const command = interaction.data.name.toLowerCase();
    const args = interaction.data.options;

    if (command === 'ping'){ 
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: `Websocket heartbeat: ${client.ws.ping}ms`,
            flags: 64
          }
        }
      })
    }

    if(command === "bulkdelete"){
     interaction.data.options.forEach(option => {
      if(option.name === "amount") {
        client.channels.fetch(interaction.channel_id).then(channel => {
          channel.bulkDelete(option.value).then(messages => {
            client.api.interactions(interaction.id, interaction.token).callback.post({
              data: {
                type: 4,
                data: {
                  content: `Bulk deleted ${messages.size} messages`
                }
              }
            })
          });
        });
      }
     });
    }

    if(command === "roles") {
      client.guilds.fetch(interaction.guild_id).then(guild => {
        guild.members.fetch(interaction.member.user.id).then(member => {
          var role = guild.roles.cache.get(interaction.data.options[0].options[0].value);
          if(interaction.data.options[0].name === "add") {
            member.roles.add(role).then(() => {
              client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                  type: 4,
                  data: {
                    content: `Success`,
                    flags: 64
                  }
                }
              });
            }).catch(err => {
              client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                  type: 4,
                  data: {
                    content: err.message,
                    flags: 64
                  }
                }
              });
            });
          }

          if(interaction.data.options[0].name === "remove") {
            member.roles.remove(role).then(() => {
              client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                  type: 4,
                  data: {
                    content: `Success`,
                    flags: 64
                  }
                }
              });
            }).catch(err => {
              client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                  type: 4,
                  data: {
                    content: err.message,
                    flags: 64
                  }
                }
              });
            });
          }
        });
      });
    }

    if(command === "colorroles") {
      if(interaction.data.options[0].name === "add") {
        const namedColors = require("color-name-list");
        const nearestColor = require("nearest-color");

        var colorHex = null;
        var user = null;

        interaction.data.options[0].options.forEach(element => {
          if (element.name === "hexcode") {
            colorHex = element.value;
          }
          if (element.name === "user") {     
            user = element.value;
          }
        });

        client.guilds.fetch(interaction.guild_id).then(guild => {
          guild.members.fetch(user).then(member => {
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
                if(member.roles.cache.get(guildColor.id)) {
                  //message.channel.send(`Role **${guildColor.name}** added successfully`).catch(console.error);
                  client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                      type: 4,
                      data: {
                        content: `Role **${guildColor.name}** added successfully`,
                        flags: 64
                      }
                    }
                  });
                }
              }).catch(function(error) {
                if(error) {
                  //message.channel.send("Failed to add role").catch(console.error);
                  client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                      type: 4,
                      data: {
                        content: error.message
                      }
                    }
                  });
                }
              });
            } else { //Color doesn't exist, simply create it and add it.
              let botRole = guild.roles.cache.find(role => role.name === "Derg Bot"); //Get the bots role for its positional number
              guild.roles.create({
                data: {
                  name: messageColor.name,
                  color: messageColor.hex,
                  position: botRole.position-1,
                },
                reason: 'Role color didnt exist',
              }).then(newRole => {
                //Before we add the role, hoist it to the highest position possible, this ensures that it's
                //visible above the users other roles!
                member.roles.add(newRole).then(function() {
                  if(member.roles.cache.get(newRole.id)) {
                    //message.channel.send(`Role **${messageColor.name}** added successfully`).catch(console.error);
                    client.api.interactions(interaction.id, interaction.token).callback.post({
                      data: {
                        type: 4,
                        data: {
                          content: `Role **${guildColor.name}** added successfully`,
                          flags: 64
                        }
                      }
                    });
                  }
                }).catch(function(error) {
                  if(error) {
                    //message.channel.send("Failed to add role").catch(console.error);#
                    client.api.interactions(interaction.id, interaction.token).callback.post({
                      data: {
                        type: 4,
                        data: {
                          content: `Add role err: ${error.message}`
                        }
                      }
                    });
                  }
                });
              }).catch(function(error) {
                if(error) {
                  //message.channel.send("Failed to add role").catch(console.error);
                  client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                      type: 4,
                      data: {
                        content: `Create role err: ${error.message}`
                      }
                    }
                  });
                }
              });
            }
          });
        });
      }
    }
  });
});