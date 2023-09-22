const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const adblocker = require("puppeteer-extra-plugin-adblocker");
const Store = require("electron-store");
const store = new Store();

puppeteer.use(StealthPlugin());
puppeteer.use(adblocker());

const getComicUpdates = async () => {
	// * Constants

	const URLS = {
		asura: "https://asuracomics.com/",
		demon: "https://manga-demon.org/",
		freak: "https://manhwa-freak.com/",
		reset: "https://reset-scans.com/",
		realm: "https://realmscans.to/",
		flame: "https://flamescans.org/",
	};

	const SELECTORS = {
		demon:
			"li.updates-item:nth-child(1) > div:nth-child(1) > div:nth-child(2) > h2:nth-child(1) > a:nth-child(1)",
		asura:
			"div.utao:nth-child(1) > div:nth-child(1) > div:nth-child(2) > a:nth-child(1)",
		freak:
			".lastest > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > a:nth-child(1)",
		reset:
			"div.col-md-6:nth-child(1) > div:nth-child(2) > a:nth-child(1) > h5:nth-child(1)",
		realm:
			"#content > div.wrapper > div.postbody > div > div.listupd > div:nth-child(1) > div > div.luf > a > h4",
		flame:
			"div.styletere:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > a:nth-child(1) > div:nth-child(1)",
	};
	const MIN_WAIT = 10000;
	const MAX_WAIT = 15000;

	const lastUpdate = store.get("lastUpdate", {}); // Get the last updates from Electron Store
	console.log(lastUpdate);
	const newUpdate = {}; // Object to hold new updates

	// * Web Scrapping Logic
	const browser = await puppeteer.launch({
		headless: false,
	});

	const page = await browser.newPage();

	for (const site in URLS) {
		try {
			await page.goto(URLS[site]);
			// If page is stuck on loading state even after everything is loaded it will check if the selector is there then continue on instead of breaking
			await page.waitForSelector(SELECTORS[site]);
		} catch (error) {
			console.error(
				`Error loading or evaluating page for site ${site}: ${error.message}`
			);
		}

		let currentUpdate;

		currentUpdate = await evaluatePage(page, SELECTORS[site]);

		// see if the value is the same if not add it in newUpdate and update the electron store
		// Compare with the last update for this site
		console.log(currentUpdate, "current update");
		console.log(lastUpdate[site], "last update");

		if (lastUpdate[site] !== currentUpdate) {
			newUpdate[site] = currentUpdate; // Add to new updates if different

			// Update Electron Store with the new value
			store.set(`lastUpdate.${site}`, currentUpdate);
		}

		// Wait for some time between each navigation to avoid bot detection
		// Takes in integer values for max_wait and min_wait
		await page.waitForTimeout(waitTime(MAX_WAIT, MIN_WAIT));
	}
	await browser.close(); // Don't forget to close the browser
	// return the update manhwas name and link
	return newUpdate; // Return the updates
};

function waitTime(MAX_WAIT, MIN_WAIT) {
	return Math.floor(Math.random() * (MAX_WAIT - MIN_WAIT + 1)) + MIN_WAIT;
}

// Evaluate the page for the contents
async function evaluatePage(page, path) {
	return await page.$eval(path, (element) => {
		return element.textContent;
	});
}

module.exports = getComicUpdates;
