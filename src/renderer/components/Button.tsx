import classNames from "classnames";
import { HTMLAttributes } from "react";

interface ButtonProps {
	size: "sm" | "md" | "lg";
	color: "primary" | "error" | "success";
	raised: boolean;
}

export default function Button({ children, className, size = "sm", color = "primary", raised = true, ...props }: Partial<ButtonProps> & HTMLAttributes<HTMLButtonElement> & { type?: "button" | "submit" | "reset" }) {

	const base = "rounded-md font-medium uppercase text-white font-roboto tracking-[0.75px] duration-150 select-none  appearance-none";
	const sizes = {
		sm: "px-4 h-9 py-1 text-sm",
		md: "px-6 h-12 py-2 text-base",
		lg: "px-8 py-3 text-lg"
	};

	const colors = {
		primary: "bg-primary hover:bg-primary-600 focus:bg-primary-600 active:bg-primary-700 !shadow-primary-800/50",
		error: "bg-error hover:bg-error-600 focus:bg-error-600 active:bg-error-700 !shadow-error-800/50",
		success: "bg-success hover:bg-success-600 focus:bg-success-600 active:bg-success-700 !shadow-success-800/50"
	};

	return (
		<button className={ classNames(base, sizes[size], colors[color], className, raised && "shadow-md hover:shadow-lg") }
			{ ...props }>
			{children}
		</button>
	);
}
