const StorageManager = require("./StorageManager.js");
const StringDecoder = require("string_decoder").StringDecoder;
const decoder = new StringDecoder("utf8");
const fs = require("fs");
var utf8 = require("utf8");

var spawn = require("child_process").spawn;

class MessageHandler {

  /**
   * @param {import('discord.js').Client} client
   * @param {object} appConfig
   */
  constructor(client, appConfig) {
    this.client = client;
    this.appConfig = appConfig;
    this.mode = 0; // start in menu mode
    this.game = null;
    /** @type {import('discord.js').TextChannel?} */
    this.targetChannel = null;
    /** @type {import('discord.js').TextChannel?} */
    this.listenChannel = null;
    this.compiledOutput = "";
    this.commandPrefix = this.appConfig.settings.commandPrefix;
    this.commentPrefix = this.appConfig.settings.commentPrefix;
    this.storageManager = new StorageManager("main");

    this.loadFromStorage();
  }

  /**
   * Reads the storage manager for anything we can load from storage that 
   * the user previously configured.
   */
  async loadFromStorage() {
    let targetChannelId = this.storageManager.get("target.channel"),
      listenChannelId = this.storageManager.get("target.listen");

    if(targetChannelId) {
      const targetChannel = await this.client.channels.fetch(targetChannelId);
      this.setTargetChannel(targetChannel, false, false);
    }

    if(listenChannelId) {
      const listenChannel = await this.client.channels.fetch(listenChannelId);
      this.setListenChannel(listenChannel, false, false);
    }
  }

  /**
   * Called automatically when the bot hears a message from any channel that 
   * it has access to.
   * 
   * @param {import('discord.js').Message} message The actual message that was
   * sent.
   */
  onMessage(message) {
    // message event will be called even on the bot's messages, so we
    // create this base-case to skip any message from the bot itself
    if(message.author.id == this.client.user.id) {
      return;
    }

    // If this message starts with the comment prefix (and one is set)
    // ignore this message no matter what
    if (this.commentPrefix 
        && this.commentPrefix !== "" 
        && message.content.startsWith(this.commentPrefix)) {
      return;
    }

    // we only accept messages that start with the command prefix
    if(!message.content.startsWith(this.commandPrefix)) {
      return;
    }

    // Strip the command prefix now. This allows the rest of processing
    // to be prefix agnostic.
    const messageContent = message.content.slice(this.commandPrefix.length);

    if(messageContent.match(/^(adventureListenChannel)/i)) {
      this.setListenChannel(message.channel, true);
      return;
    }

    // If a listen channel has been set, check the message is from it
    if (this.listenChannel != null
        && this.listenChannel.id != message.channel.id) {
      return;
    }

    if(messageContent.match(/^(info)/i)) {
      this.sendInfo(message.channel);
    }else if(messageContent.match(/^(help)/i)) {
      this.sendHelp(message.channel);
    }else if(messageContent.match(/^(list)/i)) {
      this.listGames(message.channel);
    }else if(messageContent.match(/^(targetChannel)/i)) {
      this.setTargetChannel(message.channel, true);
    }else if(messageContent.match(/^(start)/i)) {
      if(this.mode == 0) {
        this.attemptToLoadGame(messageContent);
      }else{
        this.reply("You cannot load a game because a game is already running!");
      }
    }else if(messageContent.match(/^(quit)|^(q)$/i)) {
      if(this.mode == 1) {
        this.closeGame();

        this.reply("The game has been closed!");
      } else {
        this.reply("Nothing to exit from!");
      }
    } else if(messageContent.match(/^(save)/i)) {
      // disable saving for now
      this.reply("Saving is disabled for now.");
    } else {
      // if nothing else, pass through the message to Frotz (assuming
      // Frotz is running
      this.handleMessage(messageContent);
    }
  }

  /**
   * Automatically sends the specified message either to the default channel
   * (if no channel is specified) or the specified channel. If there is no
   * default channel set, and a channel is not specified, then no message
   * will be sent.
   * 
   * @param {string} message The message to be sent.
   * @param {import('discord.js').TextChannel} channel (Optional) The channel to
   * send the reply message to.
   */
  reply(message, channel = null) {
    if (channel == null && !this.targetChannel) {
      return;
    }

    if (channel == null) {
      channel = this.targetChannel;
    }

    return channel.send(message);
  }

  /**
   * Attempts to load a game based on the given user message. If no game is
   * found, the default channel will be notified.
   * 
   * @param {string} message The user message that was sent along with the 
   *  load command.
   */
  attemptToLoadGame(message) {
    var split = message.split(" ");

    if(split.length < 2) {
      this.reply("What game do you want to start?");
      return;
    }

    var gameName = split[1].trim();
    var gameConfig = this.findGameConfig(gameName);

    if(gameConfig) {
      this.reply("Loading " + gameConfig.prettyName + "!");

      this.loadGame(gameConfig);
    } else {
      this.reply("There is no game by that name!");
    }
  }

  /**
   * Sets the default channel that is used by the reply() method.
   * 
   * @param {import('discord.js').TextChannel} channel The channel to set as the
   * default target channel.
   * 
   * @param {boolean} notify Optional, defaults to false. If true, will
   *  attempt to send a message to the new channel saying it was set.
   * 
   * @param {boolean} doWrite Optional, defaults to true. If true, will 
   *  store the set channel in the config file so the bot will default to that
   *  channel the next time it boots up.
   */
  setTargetChannel(channel, notify = false, doWrite = true) {
    this.targetChannel = channel;

    if(doWrite) {
      this.storageManager.set("target.channel", channel.id);
    }

    if(notify) {
      this.reply("Channel target set to this channel!", channel);
    }
  }

  /**
   * Sets the channel to exclusively listen for commands on. If used again on
   * that channel, disables the effect.
   * 
   * @param {import('discord.js').TextChannel} channel The channel to
   * exclusively listen to.
   * @param {boolean?} notify Optional, defaults to false. If true, will 
   *  send a message to the channel specified with the channelID saying that 
   *  it has been set as the listen channel.
   * @param {boolean?} doWrite Optional, defaults to true. If true, will store 
   *  the listen channel with the storage manager in case the bot is shut 
   *  down.
   */
  setListenChannel(channel, notify = false, doWrite = true) {
    if (this.listenChannel == null || this.listenChannel.id != channel.id) {
      this.listenChannel = channel;

      if(doWrite) {
        this.storageManager.set("target.listen", channel.id);
      }

      if(notify){
        this.reply("Commands now only accepted on this channel!", channel);
      }
    } else {
      this.listenChannel = null;

      if(doWrite) {
        this.storageManager.destroy("target.listen");
      }

      if(notify) {
        this.reply("Commands now accepted on all channels!", channel);
      }
    }
  }

  /**
   * Loads and starts the game specified by the given game config. This game
   * config should usuially come from the appConfig file.
   * 
   * @param {object} gameConfig
   */
  loadGame(gameConfig) {
    this.game = {
      config: gameConfig
    };

    // Validate that the game file exists before starting dfrotz
    if (!fs.existsSync(gameConfig.path)) {
      this.reply(
        "Tried to locate game file on server, but failed. See server logs for "
        + "more details.");
      return;
    }

    // Create child process
    this.game.child = spawn("./dfrotz.exe", ["-p", gameConfig.path]);

    // Setup stream from frotz's stdout so that we can get its output
    this.game.child.stdout.on("data", (chunk) => {
      this.recievedGameOutput(chunk);
    });

    // Try to set the game status of the bot to the current game (this
    // won't always succeed, depending on the bot's permissions)
    this.setBotOnline(gameConfig.prettyName);

    // 1 == game mode
    this.mode = 1;
  }

  /*
  * Ends the current game and cleans up the process for the game.
  */
  closeGame() {
    // cleanup the child process
    if(this.game && this.game.child){
      this.game.child.kill();
    }

    // clear the game status in Discord
    this.setBotIdle();

    // reset handler
    this.game = null;
    this.compiledOutput = "";
    this.mode = 0;
  }

  /**
   * @param {string} message
   */
  handleMessage(message) {
    if(this.mode == 1 && this.game) {
      this.game.child.stdin.write(message + "\n");
    }
  }

  /**
   * @param {Buffer} chunk
   */
  recievedGameOutput(chunk) {
    const _string = decoder.write(chunk);

    if(_string.trim() === ""){
      return;
    }

    let output = _string.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    output = this.cleanUpOutput(output);

    this.compiledOutput += _string;

    // this marks the end of input
    if(output.match(/(>\r)/)){
      this.sendGameOutput();
    }
  }

  sendGameOutput() {
    let final = utf8.encode(this.compiledOutput).replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

    final.replace("\r", "\n");

    final = this.cleanUpOutput(final, true);

    // lets also make the output monospace
    final = "```\n" + final + "\n```";

    this.reply(final);
    this.compiledOutput = "";
  }

  /**
   * @param {import('discord.js').TextChannel} channel
   */
  sendInfo(channel) {
    var response = "**Mode:** " + this.getModeName(this.mode) + "\n";

    if(!this.targetChannel){
      response += "*Target channel not set. Please set a target channel " +
                "with `" + this.commandPrefix + "targetChannel`!*\n";
    }

    this.reply(response, channel);
  }

  /**
   * @param {import('discord.js').TextChannel} channel
   */
  listGames(channel) {
    let response = "";
    if (this.appConfig.games.length == 0) {
      response = "No games found, remember to edit the config.json file";
    }

    let x, current;

    for(x = 0; x < this.appConfig.games.length; x++){
      current = this.appConfig.games[x];
      response += "**" +
          current.prettyName +
          "** start by using `" +
          this.commandPrefix +
          "start " +
          current.name +
          "`\n";
    }

    if(!this.targetChannel){
      response += "*Target channel not set. Please set a target channel " +
                "with `" + this.commandPrefix+" targetChannel`!*\n";
    }

    this.reply(response, channel);
  }

  /**
   * @param {import('discord.js').TextChannel} channel
   */
  sendHelp(channel) {
    var response = "**Commands:** \n"
            + "`"+this.commandPrefix+"help` shows this menu\n"
            + "`"+this.commandPrefix+"start [gameName]` will start a game\n"
            + "`"+this.commandPrefix+"list` will display the list of games available for this bot\n"
            + "`"+this.commandPrefix+"info` tells you which mode you're in\n"
            + "`"+this.commandPrefix+"quit` or `$q` will quit the game\n"
            + "`"+this.commandPrefix+"targetChannel` will set the channel in which the messages are sent\n"
            + "`"+this.commandPrefix+"adventureListenChannel` to set the *only* channel which the bot will accept commands from\n"
            + "Remember, once a game is started, start every command with `"+this.commandPrefix+"`. eg. `"+this.commandPrefix+"get lamp`\n"
            + "You may need to send a random command right after a game is started to get it going.\n";

    if(!this.targetChannel) {
      response += "*Target channel not set. Please set a target channel " +
                "with `" + this.commandPrefix + "targetChannel`!*\n";
    }

    this.reply(response, channel);
  }

  /**
   * @param {string} name
   * @return {object|boolean}
   */
  findGameConfig(name) {
    var x, current;

    for(x = 0; x < this.appConfig.games.length; x++) {
      current = this.appConfig.games[x];

      if(current.name === name) {
        return current;
      }
    }

    return false;
  }

  /**
   * @param {number} rawMode
   * @return {string}
   */
  getModeName(rawMode) {
    switch(rawMode) {
    case 0:
      return "Menu Mode";
    case 1:
      return "Game Mode";
    default:
      return "Unknown Mode";
    }
  }

  /**
   * @param {string} raw
   * @param {boolean?} forDisplay
   * @return {string}
   */
  cleanUpOutput(raw, forDisplay = false) {
    var splitRaw = raw.split(/[\n]|[\r]/);
    var output = "";

    for(var x = 0; x < splitRaw.length; x++) {
      var curr = splitRaw[x];

      // if we're cleaning up the output for display, we can skip the last 
      // line as it just contains the ">" prompt, unlessit contains other 
      // characters
      if(forDisplay && x == splitRaw.length - 1 && curr.match(/^[\s>]*$/)) {
        continue;
      }
            

      curr = splitRaw[x];

      // For some reason, dfrotz on macOS outputs random dots here and
      // there...which we can just skip as far as I can tell
      if(curr.trim() !== ".") {
        if(curr[0] === "d") {
          output += curr.substring(1, curr.length).trim();
        } else {
          output += curr.trim();
        }
      }

      if(forDisplay) {
        output += "\n";
      } else {
        output += "\r";
      }
    }

    return output;
  }

  setBotIdle() {
    this.client.user.setPresence({
      activity: null,
      status: "online"
    });
  }

  /**
   * @param {string} gameName
   */
  setBotOnline(gameName) {
    this.client.user.setPresence({
      activity: {
        name: gameName,
        type: "PLAYING"
      }
    });
  }
}

module.exports = MessageHandler;