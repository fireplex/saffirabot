module.exports = (client) => {
	console.log("ONLINE");
  client.user.setActivity("db.");
  var cron = client.cron;

  /*cron.schedule('* * * * * *', () => { //sec, min, hr, day, mnth, day>week
    console.log("test");
  }, {
    scheduled: true,
    timezone: "Universal"
  });*/
}
