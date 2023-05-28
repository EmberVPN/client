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
				"primary": { ...colors.orange, DEFAULT: colors.orange[500] },
				"success": { ...colors.emerald, DEFAULT: colors.emerald[500] },
				"warn": { ...colors.amber, DEFAULT: colors.amber[500] },
				"error": { ...colors.red, DEFAULT: colors.red[500] },
				"gray": { ...colors.gray, DEFAULT: colors.gray[500], "850": "#18202f" },
			}
		},
	},
	darkMode: "class",
	fontFamily: {
		"body": [
			"Roboto"
		]
	},
	plugins: [],
};
