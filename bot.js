require('dotenv').config();
const Enmap = require("enmap");
const express = require('express');
const app = express();
const Discord = require("discord.js");
const { MessageEmbed, Attachment, MessageCollector, MessageAttachment, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const fs = require("fs");
const low = require("lowdb");
const numWords = require("num-words");
const config = require("./config.json");
const Game = require("./game.js");
const client = new Discord.Client({ 
  partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER'],
  intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_PRESENCES', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MESSAGE_TYPING', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_TYPING'],
  fetchAllMembers: true
});

client.Discord = Discord;
client.attachment = MessageAttachment;
client.embed = MessageEmbed;
client.fs = fs;
client.low = low;
client.numWords = numWords;
client.messageActionRow = MessageActionRow;
client.messageButton = MessageButton;
client.messageSelectMenu = MessageSelectMenu;
client.config = config;

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

client.login(config.token);

//Add special overrides for client events specifically for game functions
client.once("ready", () => {
  game = new Game(client, config);
})

client.on("message", (message) => {
  game.onMessage(message);
})