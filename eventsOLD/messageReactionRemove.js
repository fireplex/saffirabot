module.exports = (client, reaction, user) => {
  const low = require('lowdb');
  const FileSync = require('lowdb/adapters/FileSync');

  const adapter = new FileSync('db.json');
  const db = low(adapter);
  //Check if the message is in our self serve roles DB.
  if(typeof db.get('selfRoles').find({ id: reaction.message.id }).value() != undefined && user.bot == false) {
    result = db.get('selfRoles').find({ id: reaction.message.id }).value();
    //Check the role exists in our list in the Db
    if(result["roles"][reaction.emoji.name.match(/\d+/)[0]]) {
      //Now we can remove the role from our user!
      var roleName = result["roles"][reaction.emoji.name.match(/\d+/)[0]];
      var role = reaction.message.guild.roles.cache.find(role => role.name.toLowerCase() === roleName.toLowerCase());
      var guildMember = reaction.message.guild.members.cache.get(user.id);
      guildMember.roles.remove(role).then(user.send(`Removed ${role.name} in The Derg Zone!`)).catch(console.error);
    }
    //console.log(result["roles"][0]);
  }
}