import classNames from "classnames";
import { HTMLAttributes } from "react";

interface ButtonProps {
	size: "sm" | "md" | "lg";
	color: "primary";
}

export default function Button({ children, className, size = "sm", color = "primary", ...props }: Partial<ButtonProps> & HTMLAttributes<HTMLButtonElement> & { type?: "button" | "submit" | "reset" }) {

	const base = "m-1 rounded-md font-medium uppercase text-white shadow-md font-roboto tracking-[0.75px] hover:shadow-lg duration-150 select-none !shadow-primary-800/50 appearance-none";
	const sizes = {
		sm: "px-4 h-9 py-1 text-sm",
		md: "px-6 h-12 py-2 text-base",
		lg: "px-8 py-3 text-lg"
	};
	const colors = {
		primary: "bg-primary hover:bg-primary-600 focus:bg-primary-600 active:bg-primary-700"
	};

	return (
		<button className={ classNames(base, sizes[size], colors[color], className) }
			{ ...props }>
			{children}
		</button>
	);
}
