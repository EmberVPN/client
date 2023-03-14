/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/renderer/index.html",
		"./src/renderer/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				"primary": colors.orange,
				"success": colors.emerald,
			}
		},
	},
	fontFamily: {
		"body": [
			"Roboto"
		]
	},
	plugins: [],
};
