function createUpdateElement(update) {
	// Create the main container
	const linkElement = document.createElement("a");
	linkElement.className =
		"update-container flex flex-row gap-5 h-[125px] w-[450px] justify-start px-5 place-items-center border-black shadow-border border-[1px] bg-clear-dark-gray rounded-2xl py-3 no-drag select-none absolute";
	linkElement.onclick = () => window.electron.openLink(update.url);

	// Create the image container
	const imageContainer = document.createElement("span");
	imageContainer.className = "w-20 h-20 ";

	const imageElement = document.createElement("img");
	imageElement.src = `./assets/${update.image}.png`;

	// Add an error event listener to handle the case where the image does not load
	imageElement.onerror = () => {
		imageElement.src = "./assets/default.png"; // Set to default image if loading fails
	};

	imageElement.alt = update.name;
	imageElement.className = "flex h-full w-full";
	imageContainer.appendChild(imageElement);

	// Create the text container
	const textContainer = document.createElement("header");
	textContainer.className = "flex gap-2 flex-col h-20 justify-between py-2";

	const siteNameElement = document.createElement("p");
	siteNameElement.className = "text-2xl";
	siteNameElement.textContent = update.name || "Site Name";

	const manhwaTitleElement = document.createElement("p");
	manhwaTitleElement.className = "text-base text-gray-500";

	// Truncate the title to 25 characters and add ellipsis if longer
	const titleText = update.title || "Manhwa Title";
	manhwaTitleElement.textContent =
		titleText.length > 35 ? titleText.substring(0, 35) + "..." : titleText;

	textContainer.appendChild(siteNameElement);
	textContainer.appendChild(manhwaTitleElement);

	// Append everything to the main container
	linkElement.appendChild(imageContainer);
	linkElement.appendChild(textContainer);

	// Append the close button to the linkElement
	const closeButton = createCloseButton();
	linkElement.appendChild(closeButton);

	return linkElement;
}

function createCloseButton() {
	const button = document.createElement("button");
	button.className =
		"absolute right-1 top-1 flex justify-center place-items-center w-8 h-8 rounded-lg no-drag z-50";
	button.type = "submit";
	button.onclick = function (event) {
		event.stopPropagation();
		this.parentElement.remove(); // Remove the update element

		// Check if there are no more update elements left
		if (document.querySelectorAll(".update-container").length === 0) {
			window.close(); // Close the window, adjust this if using a specific window management method
		}
	};

	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("width", "24");
	svg.setAttribute("height", "24");
	svg.setAttribute("viewBox", "0 0 16 16");
	svg.setAttribute("version", "1.1");
	svg.setAttribute("fill", "#ff0000");
	svg.classList.add(
		"opacity-50",
		"hover:opacity-100",
		"duration-150",
		"ease-in-out",
		"hover:scale-110"
	);

	const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
	path1.setAttribute("style", "fill: gray");
	path1.setAttribute(
		"d",
		"M 5,4 C 4.4477,4 4,4.4477 4,5 4,5.2652 4.1055,5.5195 4.293,5.707 L 10.293,11.707 C 10.48,11.895 10.735,12 11,12 11.552,12 12,11.552 12,11 12,10.735 11.895,10.48 11.707,10.293 L 5.707,4.293 C 5.5195,4.1055 5.2652,4 5,4 Z"
	);

	const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
	path2.setAttribute("style", "fill: gray");
	path2.setAttribute(
		"d",
		"M 5,12 C 4.4477,12 4,11.552 4,11 4,10.735 4.1055,10.48 4.293,10.293 L 10.293,4.293 C 10.48,4.105 10.735,4 11,4 11.552,4 12,4.448 12,5 12,5.265 11.895,5.52 11.707,5.707 L 5.707,11.707 C 5.5195,11.895 5.2652,12 5,12 Z"
	);

	svg.appendChild(path1);
	svg.appendChild(path2);
	button.appendChild(svg);

	return button;
}

function updateUI(updateData) {
	const container = document.body; // Or any other container element
	container.innerHTML = ""; // Clear previous content

	updateData.forEach((update) => {
		const updateElement = createUpdateElement(update);
		container.appendChild(updateElement);
		console.log(update);
	});
}

// Listen for the 'update-data' event from the main process
window.electron.receive("update-data", (updateData) => {
	updateUI(updateData);
});
