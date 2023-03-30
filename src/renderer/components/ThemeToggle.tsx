import { HTMLAttributes, ReactNode, useEffect, useState } from "react";
import { MdBrightnessHigh, MdOutlineBrightnessAuto, MdOutlineDarkMode } from "react-icons/md";

export type ThemeMode = "DARK" | "LIGHT" | "AUTO";

export default function ThemeToggle({ provider = false, children, ...props }: { provider?: boolean, children?: ReactNode } & HTMLAttributes<HTMLDivElement>): JSX.Element | null {

	const [ state, setState ] = useState("theme" in localStorage ? localStorage.theme === "dark" ? "DARK" : "LIGHT" : "AUTO");

	useEffect(function() {
		if (state === "DARK" || !("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [ state ]);

	useEffect(function() {
		function keydown(event: KeyboardEvent) {
			if (event.key === "F10") {
				event.preventDefault();
				nextState();
			}
		}
		document.addEventListener("keydown", keydown);
		return () => document.removeEventListener("keydown", keydown);
	});

	function nextState() {
		if (state === "DARK") {
			localStorage.removeItem("theme");
			setState("AUTO");
		}
		if (state === "AUTO") {
			localStorage.theme = "light";
			setState("LIGHT");
		}
		if (state === "LIGHT") {
			localStorage.theme = "dark";
			setState("DARK");
		}
	}

	if (provider) return null;

	return (
		<div onClick={ nextState }
			{ ...props }>
			{ state === "AUTO" && <MdOutlineBrightnessAuto className="w-6 h-6 opacity-50" /> }
			{ state === "LIGHT" && <MdBrightnessHigh className="w-6 h-6 opacity-50" /> }
			{state === "DARK" && <MdOutlineDarkMode className="w-6 h-6 opacity-50" />}
			<div className="flex flex-col font-roboto grow">
				<p className="text-gray-800 dark:text-gray-300 -mb-0.5">Toggle Theme</p>
				<p className="text-gray-500 dark:text-gray-400 text-xs font-medium">{
					state === "AUTO" ? "Automatic" : state === "LIGHT" ? "Light Mode" : "Night Mode"
				}</p>
			</div>
			{children}
		</div>
	);
}
