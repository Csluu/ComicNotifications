export default async function displayComicUpdate() {
	// Gets the information
	try {
		const data = await window.electron.requestUpdate();
	} catch (error) {
		console.error(error);
	}
	console.log(data);
	// links the image
	// sets the title
}
