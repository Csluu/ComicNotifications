const { app, BrowserWindow, ipcMain, shell, Menu, Tray } = require("electron");
const Store = require("electron-store");
const path = require("path");
const getComicUpdates = require("./webscrap");

// * Constants and Variables
// ! Change this to "production" or "development" when in development in when ready for production
process.env.NODE_ENV = "production";

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";
const isWin = process.platform === "win32";

// To store the x and y coordinates
const store = new Store();

// Initializing main window so we can remove it from memory later to prevent memory leak
let mainWindow = [];
let tray = null;

// * Browser Windows
const createMainWindow = (updateData) => {
	// Gets x,y cords from windowPosition if not get the default position, undefined.
	let { x, y } = store.get("windowPosition", { x: undefined, y: undefined });

	// Create the browser window.
	mainWindow = new BrowserWindow({
		x: 1080,
		y: 20,
		width: isDev ? 1500 : 475,
		height: isDev ? 500 : 150,
		transparent: isDev ? false : true,
		resizable: isDev ? true : false,
		frame: isDev ? true : false,
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
	});

	// Store the window in an array
	mainWindows.push(mainWindow);

	// Save window position when the window is closed.
	mainWindow.on("close", () => {
		mainWindows = mainWindows.filter((win) => win !== mainWindow);
		let { x, y } = mainWindow.getBounds();
		store.set("windowPosition", { x, y });
	});
};

// * App Initialization
// This method will be called when Electron has finished
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
	tray = new Tray(path.join(__dirname, "./Renderer/assets/asura.png"));

	const contextMenu = Menu.buildFromTemplate([{ label: "Quit", role: "quit" }]);

	tray.setToolTip("This is my application.");
	tray.setContextMenu(contextMenu);

	tray.on("click", () => {
		// You can show your main app window here, for example.
	});

	createMainWindow();

	// Remove mainWindow from memory on close to prevent memory leak
	mainWindow.on("closed", () => (mainWindow = null));

	// Listen for updates from the main process
	ipcMain.on("send-update", (event, updateData) => {
		mainWindow.webContents.send("update-received", updateData);
	});

	// TODO Check what this does again
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createMainWindow();
		}
	});

	periodicallyCheckUpdates(); // Call this to start the periodic update check
});

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

// TODO Close out the popup after few seconds


async function periodicallyCheckUpdates() {
	try {
		const updates = await getComicUpdates();
		if (updates && updates.length > 0) {
			updates.forEach((updateData) => {
				createMainWindow(updateData); // Create a new window for each update
			});
		}
	} catch (error) {
		console.error(error + "There was an error fetching the data");
	}
	console.log("update complete", updates);
	setTimeout(periodicallyCheckUpdates, updateDelay());
}

function updateDelay() {
	// Random time between 30 mins (1800000) and a little over 30 mins.
	const waitTime =
		Math.floor(Math.random() * (2000000 - 1800000 + 1)) + 1800000;
	return waitTime;
}
