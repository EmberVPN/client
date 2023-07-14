/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [ "./src/renderer/index.html", "./src/renderer/**/*.{js,ts,jsx,tsx}" ],
	theme: {
		extend: {
			colors: {
				primary: { DEFAULT: colors.sky[500], ...colors.sky, "text": colors.white },
				error: { DEFAULT: colors.red[500], ...colors.red, "text": colors.white },
				success: { DEFAULT: colors.emerald[500], ...colors.emerald, "text": colors.white },
				warning: { DEFAULT: colors.amber[500], ...colors.amber, "text": colors.amber[950] },
			}
		},
	},
	darkMode: "class",
	fontFamily: {
		body: [ "Roboto" ],
	},
	plugins: [],
};
