import classNames from "classnames";

export interface InputGroupProps {
	label: string;
	error: string | null;
	name: string;
}

type PropTypes = Partial<InputGroupProps> & React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>;
export default function InputGroup({ label, error, name, className, ...props }: PropTypes): JSX.Element {
	return (
		<div className={ className }>
			{(label || error) && <label
				className={ classNames("flex justify-between mb-2 text-sm font-medium text-gray-900 dark:text-white", error && "!text-red-500") }
				htmlFor={ name }>
				{ error ? error : label}
			</label>}
			<input
				className={ classNames("p-2.5 outline-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white hover:border-gray-500 focus:border-primary-500 focus:ring-[3px] focus:ring-primary-500", error && "!border-red-500 !ring-red-500") }
				{ ...props }
				name={ name } />
		</div>
	);
}