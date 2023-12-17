const { app, BrowserWindow, ipcMain, shell, Menu, Tray } = require("electron");
const Store = require("electron-store");
const path = require("path");
const getComicUpdates = require("./webscrap");
const fs = require("fs");

// * Constants and Variables
// ! Change this to "production" or "development" when in development in when ready for production
process.env.NODE_ENV = "production";

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";
const isWin = process.platform === "win32";

// To store the x and y coordinates
const store = new Store();

// Initializing main window so we can remove it from memory later to prevent memory leak
let mainWindow;
let tray = null;

// * Browser Windows
const createMainWindow = (updateData) => {
	// Gets x,y cords from windowPosition if not get the default position, undefined.
	let { x, y } = store.get("windowPosition", { x: undefined, y: undefined });

	// Create the browser window.
	mainWindow = new BrowserWindow({
		x,
		y,
		width: isDev ? 1500 : 500,
		height: isDev ? 500 : 175,
		transparent: isDev ? false : true,
		resizable: isDev ? true : false,
		frame: isDev ? true : false,
		icon: path.join(__dirname, "./build/logo.png"),
		webPreferences: {
			// allows dev tools to be opened
			devTools: isDev ? true : false,
			// Security risk if turned on BUT currently preload.js doesn't work without it..... Still being worked on in electron
			// Only turn on for modules like fs for writing files on the web app (frontend)
			nodeIntegration: true,
			// Separates the web app (frontend) from the electron app (backend) to prevent malicious code
			// Have to use preload.js script to set up communication
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	// opens up dev tools
	if (isDev) {
		mainWindow.webContents.openDevTools();
	}

	// and load the index.html of the app.
	mainWindow.loadFile(path.join(__dirname, "./Renderer/index.html"));

	// Wait for the window to finish loading
	mainWindow.webContents.once("did-finish-load", () => {
		// Send the updateData to the renderer process
		mainWindow.webContents.send("update-data", updateData);

		// Set a timeout to close the window after 10 seconds (10000 milliseconds)
		setTimeout(() => {
			// Checking to see if we have manually closed the window or not
			if (mainWindow) {
				mainWindow.close();
			}
		}, 30000);
	});

	// Save window position when the window is closed.
	mainWindow.on("close", () => {
		if (mainWindow) {
			let { x, y } = mainWindow.getBounds();
			store.set("windowPosition", { x, y });
		}

		// When the window is closed, set mainWindow to null to help with the automatic timeout
		mainWindow = null;
	});
};

//  App Initialization
// Request single instance lock
// Making sure if there is another instance of this application or not.
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	// If we don't get the lock, another instance is running, so quit
	console.log("Application is already running");
	app.quit();
} else {
	app.on("second-instance", (event, commandLine, workingDirectory) => {
		// Someone tried to run a second instance, we should focus our window
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
		}
	});

	// This method will be called when Electron has finished
	// Some APIs can only be used after this event occurs.
	app.whenReady().then(async () => {
		tray = new Tray(path.join(__dirname, "./Renderer/assets/tray.png"));

		const contextMenu = Menu.buildFromTemplate([
			{ label: "Stocks", click: finviz },
			{ label: "Open Links", click: openAllLinks },
			{ type: "separator" },
			{ label: "Quit", role: "quit" },
		]);

		tray.setToolTip("This is my application.");
		tray.setContextMenu(contextMenu);

		const userDataPath = app.getPath("userData");
		const constantsFilePath = path.join(userDataPath, "constants.json");

		// If constant file does not exist in users app data then copy it the one from development
		if (!fs.existsSync(constantsFilePath)) {
			const devConstantsPath = path.join(__dirname, "constants.json");
			if (fs.existsSync(devConstantsPath)) {
				fs.copyFileSync(devConstantsPath, constantsFilePath);
			}
		}

		periodicallyCheckUpdates(constantsFilePath); // Call this to start the periodic update check
	});
}

// * Basic Window Functions
ipcMain.on("minimize-window", () => {
	const window = BrowserWindow.getFocusedWindow();
	if (window) {
		window.minimize();
	}
});

// Closing the window
ipcMain.on("close-window", () => {
	const window = BrowserWindow.getFocusedWindow();
	if (window) {
		window.close();
	}
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	// if (!isMac) {
	// 	app.quit();
	// }
});

ipcMain.handle("open-link", (_, url) => {
	shell.openExternal(url);
	console.log("Launch");
});

// * Supporting Functions
async function periodicallyCheckUpdates(constantsFilePath) {
	let updates;
	try {
		const updates = await getComicUpdates(constantsFilePath);
		if (updates && Object.keys(updates).length > 0) {
			const updatesArray = Object.values(updates);
			createMainWindow(updatesArray);
		}
		console.log("update complete", updates); // Log statement moved here
	} catch (error) {
		console.error("There was an error fetching the data:", error);
	}
	setTimeout(periodicallyCheckUpdates, updateDelay());
}

function updateDelay() {
	// Random time between 30 mins (1800000) and a little over 30 mins.
	const waitTime =
		Math.floor(Math.random() * (2000000 - 1800000 + 1)) + 1800000;
	return waitTime;
}

// For the tray button
async function openAllLinks() {
	const constantsFilePath = getConstantsFilePath();
	const constants = JSON.parse(fs.readFileSync(constantsFilePath, "utf8"));
	const URLS = constants.urls;

	Object.values(URLS).forEach((url) => {
		shell.openExternal(url);
	});
}

async function finviz() {
	shell.openExternal("https://finviz.com/");
}

function getConstantsFilePath() {
	return path.join(app.getPath("userData"), "constants.json");
}

// const fakeData = {
// 	asura: {
// 		title: "Terminally-Ill Genius Dark Knight",
// 		url: "https://asuratoon.com/",
// 		name: "Asuratoon",
// 		image: "asura",
// 	},
// 	demon: {
// 		title: "Becoming A Sword Deity By Expanding My Sword Domain",
// 		url: "https://asuratoon.com/",
// 		name: "Manga Demon",
// 		image: "demon",
// 	},
// 	freak: {
// 		title: "1 Million Times A...",
// 		url: "https://asuratoon.com/",
// 		name: "Manga freak",
// 		image: "manhwa",
// 	},
// };

// const updatesArray = Object.values(fakeData);
