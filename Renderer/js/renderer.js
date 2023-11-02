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

// move to main
function periodicallyCheckUpdates() {
	// Get the information on startup 
	displayComicUpdate();

	// Call the function again after about 30 mins or so. 
	setTimeout(periodicallyCheckUpdates, updateDelay());
}

periodicallyCheckUpdates();

// move to main
export default function updateDelay() {
	// Random time between 30 mins (1800000) and a little over 30 mins.
	const waitTime =
		Math.floor(Math.random() * (2000000 - 1800000 + 1)) + 1800000;
	return waitTime;
}
