const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const adblocker = require("puppeteer-extra-plugin-adblocker");

puppeteer.use(StealthPlugin());
puppeteer.use(adblocker);

const getComicUpdates = async () => {
	// * Constants
	const URL = {
		asura: "https://asuracomics.com/",
		flame: "https://flamescans.org/",
		realm: "https://realmscans.to/",
		demon: "https://manga-demon.org/",
		freak: "https://manhwa-freak.com/",
		reset: "https://reset-scans.com/",
	};
	const MIN_WAIT = 4000;
	const MAX_WAIT = 8000;
	// TODO: Need to do the electron store to compare old and new update values
	const newUpdate = {};

	// * Web Scrapping Logic
	const browser = await puppeteer.launch({
		headless: false,
	});

	const page = await browser.newPage();

	for (const site in URL) {
		await page.goto(URL[site]);

		switch (site) {
			case "asura":
				const asuraUpdate = await page.$eval(
					"div.utao:nth-child(1) > div:nth-child(1) > div:nth-child(2) > a:nth-child(1)",
					(element) => {
						return Element.textContent;
					}
				);
				break;
			case "flame":
				// Code for handling flame
				break;
			case "realm":
				// Code for handling realm
				break;
			case "demon":
				// Code for handling demon
				break;
			case "freak":
				// Code for handling freak
				break;
			case "reset":
				// Code for handling reset
				break;
			default:
				// Code for handling an unexpected site
				break;
		}
		// see if the value is the same if not add it in newUpdate and update the electron store

		// Wait for some time between each navigation to avoid bot detection
		// Takes in integer values for max_wait and min_wait
		await page.waitForTimeout(waitTime(MAX_WAIT, MIN_WAIT));
	}
	// return the update manhwas name and link 
};

function waitTime(MAX_WAIT, MIN_WAIT) {
	return Math.floor(Math.random() * (MAX_WAIT - MIN_WAIT + 1)) + MIN_WAIT;
}
