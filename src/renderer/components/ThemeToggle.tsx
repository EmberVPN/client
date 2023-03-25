import { HTMLAttributes, ReactNode, useEffect, useState } from "react";
import { BsBrightnessHigh } from "react-icons/bs";
import { MdOutlineBrightnessAuto, MdOutlineDarkMode } from "react-icons/md";

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

	if (children) return <div onClick={ nextState }
		{ ...props }>
		{ state === "AUTO" && <MdOutlineBrightnessAuto className="w-6 h-6" /> }
		{ state === "LIGHT" && <BsBrightnessHigh className="w-6 h-6" /> }
		{ state === "DARK" && <MdOutlineDarkMode className="w-6 h-6" /> }
		{children}
	</div>;

	return (
		<div className="btn"
			onClick={ nextState }>
			{ state === "AUTO" && <MdOutlineBrightnessAuto className="w-6 h-6" /> }
			{ state === "LIGHT" && <BsBrightnessHigh className="w-6 h-6" /> }
			{state === "DARK" && <MdOutlineDarkMode className="w-6 h-6" />}
			<span>Change theme</span>
		</div>
	);
}
