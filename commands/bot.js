exports.run = (client, interaction) => {
	const { exec } = require("child_process");

	if(interaction.options.getSubcommand() === "shutdown") {
		exec("sudo su -c 'pm2 stop 1'", (error, stdout, stderr) => {
			if (error) {
				console.log(`error: ${error.message}`);
				return;
			}
			if(stderr) {
				console.log(`stderr: ${stderr}`);
				return;
			}
			console.log(`stdout: ${stdout}`);
		});
	}

	if(interaction.options.getSubcommand() === "start") {
		exec('ssh server.ldcave.org -p 55522 "sudo su -c \'pm2 start 1\'"', (error, stdout, stderr) => {
			if (error) {
				console.log(`error: ${error.message}`);
				return;
			}
			if(stderr) {
				console.log(`stderr: ${stderr}`);
				return;
			}
			console.log(`stdout: ${stdout}`);
			process.exit(0);
		});
	}
}