/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./Renderer/**/*.{html,js}"],
	theme: {
		extend: {
			colors: {
				"clear-blue": "rgba(112, 179, 226, 1.0)",
				"clear-dark-gray": "rgba(36, 36, 36, 0.90)",
				"opaque-dark-gray": "rgba(36, 36, 36, 1)",
				"dark-gray-highlight": "rgb(55, 55, 55)",
				"block-gray": "rgb(43, 53, 68)",
			},
			fontFamily: { quicksand: ["Quicksand", "sans-serif"] },
			boxShadow: {
				border:
					"0 3px 10px 2px rgba(0, 0, 0, 0.5), 0 5px 15px 2px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(87,88,89,1), inset 0 0 4px rgba(87,88,89,1)",
				highLight:
					"0 -1px 0px 0px rgba(2, 6, 23, 1), 0 4px 6px -1px rgba(2, 6, 23, 1), 0 2px 4px -1px rgba(2, 6, 23, 1)",
			},
		},
	},
	plugins: [],
};
