import { HTMLAttributes, PropsWithChildren } from "react";
import Checkbox from "../Checkbox";

export default function ToggleOption({ children, ...props }: PropsWithChildren & HTMLAttributes<HTMLInputElement>): JSX.Element {
	props.id = props.id || Math.floor(Math.random() * 10e10).toString(16);
	return (
		<label className="flex items-center justify-between h-14"
			htmlFor={ props.id }>
			<p className="text-gray-800 dark:text-gray-300">{children}</p>
			<Checkbox { ...props } />
		</label>
	);
}
