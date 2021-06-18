require('dotenv').config();
const Enmap = require("enmap");
const express = require('express');
const app = express();
const Discord = require("discord.js");
const { MessageEmbed, Attachment, MessageCollector, MessageAttachment } = require("discord.js");
const fs = require("fs");
const low = require("lowdb");
const numWords = require("num-words");
const client = new Discord.Client({ 
  partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER'],
  intents: Discord.Intents.ALL,
  fetchAllMembers: true
});

client.Discord = Discord;
client.attachment = MessageAttachment;
client.embed = MessageEmbed;
client.fs = fs;
client.low = low;
client.numWords = numWords;

app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});


client.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let command = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    client.commands.set(commandName, command);
  });
});

client.login("ODM5MDc5OTI1MTc5ODc1MzM5.YJEcEw.lGQrUaAodiGBimL7D9UuDs7KytQ");