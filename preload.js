const path = require("path");
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
	openLink: (url) => ipcRenderer.invoke("open-link", url),
	closeWindow: () => ipcRenderer.send("close-window"),

	// Add a method to receive messages from the main process
	receive: (channel, func) => {
		// Define a whitelist of channels to listen to
		const validChannels = ["update-data"];
		if (validChannels.includes(channel)) {
			// Strip off the event as it includes 'sender' and is a potential security risk
			ipcRenderer.on(channel, (event, ...args) => func(...args));
		}
	},
});

function getAssetPath(asset) {
	if (process.env.NODE_ENV === "development") {
		return path.join(__dirname, "./Renderer/assets", asset);
	} else {
		// In production, point to the unpacked assets in the asar archive
		return path.join(
			process.resourcesPath,
			"app.asar.unpacked",
			"./Renderer/assets",
			asset
		);
	}
}

// Expose the function to the renderer process
contextBridge.exposeInMainWorld("myAPI", {
	getAssetPath,
});
