module.exports = {
  apps : [{
    name: 'Saffirabot',
    script: './bot.js',
    watch: true,
    ignore_watch : ["node_modules", "db.json"],
    watch_options: {
      "followSymlinks": false
    }
  }]
};
