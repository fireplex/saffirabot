exports.run = (client, message, args) => {
    if(!message.author.id === "185077819557150720") return;
    const { exec } = require("child_process");

    exec("sudo pm2 stop Saffirabot", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}