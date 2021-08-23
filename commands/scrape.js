exports.run = (client, message, args) => {
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
  await page.goto(args[0]);
  await page.screenshot({ path: 'example.png' });

  await browser.close();
})();
}