const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const adblocker = require("puppeteer-extra-plugin-adblocker");
const Store = require("electron-store");
const store = new Store();
const fs = require("fs");
const path = require("path");

puppeteer.use(StealthPlugin());
puppeteer.use(adblocker());

const getComicUpdates = async () => {
	// * Constants
	// Parsing JSON
	const constantsFilePath = path.join(__dirname, "constants.json");
	// fs.readFileSync is used to read JSON absolute
	// json.parse converts json string to a javascript object
	const constants = JSON.parse(fs.readFileSync(constantsFilePath, "utf8"));

	// Constant variables
	const URLS = constants.urls;
	const URLS_NAMES = constants.websiteName;
	const SELECTORS = constants.selectors;
	const MIN_WAIT = constants.minWaitTime;
	const MAX_WAIT = constants.maxWaitTIme;
	const CURRENTLY_READING = constants.currentlyReading;

	// Getting the last updated manhwa on the websites
	const lastUpdate = store.get("lastUpdate", {}); // Get the last updates from Electron Store
	// store.clear(); // For clearing and testing purposes
	console.log(lastUpdate);
	const newUpdate = {}; // Object to hold new updates

	// * Web Scrapping Logic
	// Configuring Puppeteer
	const browser = await puppeteer.launch({
		headless: false,
	});
	const page = await browser.newPage();

	// Going to each Website and grabbing the latest update
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

		// Checks to see if the new update is the same as the old update
		// if its different check to see if the updated manhwa is what we are currently reading
		// if it is then update to the newUpdate variable so that we can send it to main
		if (lastUpdate[site] !== currentUpdate) {
			// Check if the current update is in the list of custrrently reading manhwas
			if (CURRENTLY_READING[site].includes(currentUpdate)) {
				newUpdate[site] = {
					title: currentUpdate, // The title or update information
					url: URLS[site], // The URL of the site where the update was found
					name: URLS_NAMES[site], // Website name
					image: site,
				};
			}
			// Update Electron Store with the new value
			store.set(`lastUpdate.${site}`, currentUpdate);
		}

		// Wait for some time between each navigation to avoid bot detection
		// Takes in integer values for max_wait and min_wait
		await page.waitForTimeout(waitTime(MAX_WAIT, MIN_WAIT));
	}
	await browser.close(); // Don't forget to close the browser
	// return the update manhwas name and link
	console.log(newUpdate);
	return newUpdate; // Return the updates
};

// * Supporting Functions
function waitTime(MAX_WAIT, MIN_WAIT) {
	return Math.floor(Math.random() * (MAX_WAIT - MIN_WAIT + 1)) + MIN_WAIT;
}

// Evaluate the page for the contents
async function evaluatePage(page, selector) {
	return await page.$eval(selector, (element) => {
		// Replace tabs and newlines with an empty string and trim leading/trailing spaces
		return element.textContent.replace(/[\t\n]/g, "").trim();
	});
}
module.exports = getComicUpdates;
