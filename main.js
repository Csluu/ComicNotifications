const { app, BrowserWindow, ipcMain } = require("electron");
const Store = require("electron-store");
const path = require("path");

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

// * Browser Windows
const createMainWindow = () => {
	// Gets x,y cords from windowPosition if not get the default position, undefined.
	let { x, y } = store.get("windowPosition", { x: undefined, y: undefined });

	// Create the browser window.
	mainWindow = new BrowserWindow({
		x,
		y,
		width: isDev ? 1500 : 850,
		height: 535,
		transparent: true,
		resizable: false,
		frame: false,
		webPreferences: {
			// allows dev tools to be opened
			devTools: isDev ? true : false,
			// Security risk if turned on
			// Only turn on for modules like fs for writing files on the web app (frontend)
			nodeIntegration: false,
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

	// Save window position when the window is closed.
	mainWindow.on("close", () => {
		let { x, y } = mainWindow.getBounds();
		store.set("windowPosition", { x, y });
	});
};

// * App Initialization
// This method will be called when Electron has finished
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createMainWindow();

	// Remove mainWindow from memory on close to prevent memory leak
	mainWindow.on("closed", () => (mainWindow = null));

	// TODO Check what this does again
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createMainWindow();
		}
	});
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
	if (!isMac) {
		app.quit();
	}
});

// * Web Scrapping
ipcMain.handle("get-updates", async () => {
	try {
		const data = await getWeatherData();
		return data;
	} catch (error) {
		console.error(error);
	}
});
