const path = require("path");
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
	openLink: (url) => ipcRenderer.invoke("open-link", url),
	requestUpdate: async () => {
		return await ipcRenderer.invoke("get-updates");
	},
	closeWindow: () => ipcRenderer.send("close-window"),
});

// function getAssetPath(asset) {
// 	if (process.env.NODE_ENV === "development") {
// 		return path.join(__dirname, "./Renderer/assets", asset);
// 	} else {
// 		// In production, point to the unpacked assets in the asar archive
// 		return path.join(
// 			process.resourcesPath,
// 			"app.asar.unpacked",
// 			"./Renderer/assets",
// 			asset
// 		);
// 	}
// }

// // Expose the function to the renderer process
// contextBridge.exposeInMainWorld("myAPI", {
// 	getAssetPath,
// });
