module.exports = (client, message) => {

	if (message.content.includes("furaffinity.net/view/")) {
		console.log("FA link");
		var urlRegex = /(https?:\/\/[^ ]*)/;
		var url = message.content.match(urlRegex)[1];
		const puppeteer = require('puppeteer');

		(async () => {
			const browser = await puppeteer.launch({
				executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
				headless: true,
				ignoreDefaultArgs: ['--disable-extensions'],
				args: [
				'--user-data-dir=C:\\Users\\Feeka\\AppData\\Local\\Google\\Chrome\\User Data'
				],
			});
			const page = await browser.newPage();
			await page.goto(url);
	
			var sub = await page.evaluate(() => {
				var views = document.getElementsByClassName("views")[0].getElementsByTagName('span')[0].innerText.toString();
				var comments = document.getElementsByClassName("comments")[0].getElementsByTagName('span')[0].innerText.toString();
				var favs = document.getElementsByClassName("favorites")[0].getElementsByTagName('span')[0].innerText.toString();
				var avatar = document.getElementsByClassName("submission-user-icon")[0].src;
				var author = document.getElementsByClassName("submission-id-sub-container")[0].getElementsByTagName('a')[0].innerText.toString();
				var date = document.getElementsByClassName("popup_date")[0].innerText.toString();
				var url = document.getElementById("submissionImg").src;
				var title = document.getElementsByClassName("submission-title")[0].getElementsByTagName("p")[0].innerText.toString();
				var subCont = {views: views, comments: comments, favs: favs, avatar: avatar, author: author, date: date, url: url, title: title};
	
				return subCont;
			});
			message.delete();

			const embed = new client.embed();
			embed.setAuthor(sub.author, sub.avatar);
			embed.setImage(sub.url);
			embed.setTitle(sub.title);
			embed.setURL(sub.url);
			embed.setFooter(`Views: ${sub.views} | Favs: ${sub.favs} | Comments: ${sub.comments} || Created ${sub.date}`);
			message.channel.send({ content: '** **', embeds: [embed] });

			await browser.close();
		})();
	}

	if (message.author.bot) return;

	if (!message.content.match(/db\.|Db\.|DB\./)) return;
	
	const args = message.content.slice(3).trim().split(/ +/g);

	const command = args.shift().toLowerCase();
	
	const cmd = client.commands.get(command);
	
	if (!cmd) return;
	
	cmd.run(client, message, args);
};
