import classNames from "classnames";
import { useRef } from "react";
import { MdCheck } from "react-icons/md";

export default function Checkbox({ children, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { children?: React.ReactNode; }) {
	const ref = useRef<HTMLDivElement>(null);
	props.id = props.id || Math.floor(Math.random() * 1e10).toString(36);

	return (
		<div className={ classNames("group flex items-center font-roboto gap-4", className) }>
			<div className="relative flex"
				ref={ ref }>
				<input className="peer appearance-none border-2 rounded-sm w-5 h-5 border-gray-300 dark:border-gray-600 checked:!border-primary checked:border-[10px] transition-all after:content[''] after:bg-gray-500/10 after:absolute after:w-12 after:h-12 after:left-1/2 after:top-1/2 after:rounded-full after:-translate-x-1/2 after:-translate-y-1/2 after:pointer-events-none after:-z-[1] after:scale-0 focus:after:scale-100 group-active:after:scale-100 duration-100 after:transition-transform checked:after:bg-primary-500/10 active:border-gray-400 active:dark:border-gray-500"
					type="checkbox"
					{ ...props } />
				<MdCheck className="m-0.5 text-white scale-0 peer-checked:scale-125 absolute transition-transform pointer-events-none" />
			</div>
			<label className="select-none text-sm"
				htmlFor={ props.id }>{children}</label>
		</div>
	);
}
