import classNames from "classnames";
import { useEffect, useRef } from "react";

interface InputFieldProps {
	label: string;
	hint?: string;
}

export default function InputField({ label, hint, className, ...props }: Partial<InputFieldProps> & React.InputHTMLAttributes<HTMLInputElement>) {
	const ref = useRef<HTMLDivElement>(null);
	props.id = props.id || Math.floor(Math.random() * 1e10).toString(36);

	useEffect(function() {
		const input = ref.current?.querySelector("input");
		const setHasContent = (hasContent: boolean) => ref.current?.classList.toggle("hascontents", hasContent);
		setHasContent((input?.value.length || 0) > 0);
		input?.addEventListener("input", () => setHasContent(input.value.length > 0));
		return () => input?.removeEventListener("input", () => setHasContent(input.value.length > 0));
	});

	return (
		<div className={ classNames("relative w-full h-12 group input-group", className) }
			ref={ ref }>
			<input className={ classNames("peer w-full h-full text-gray-700 dark:text-gray-200 font-roboto font-normal disabled:border-dashed transition-all placeholder-shown:border placeholder-shown:border-gray-500/20 border focus:border-2 text-sm px-3 py-2.5 focus:px-[11px] rounded-lg border-gray-400/40 dark:border-gray-400/25 focus:!border-primary backdrop-blur-2xl !bg-white/10 dark:!bg-gray-800/10 group-[.hascontents]:invalid:!border-error", className) }
				{ ...props } />
			{label && (
				<label className="text-gray-600 dark:text-gray-400 font-roboto font-normal text-sm px-1 absolute top-1/2 left-2 -translate-y-1/2 py-0.5 peer-focus:top-0.5 peer-focus:text-primary peer-focus:text-xs peer-focus:px-2 peer-placeholder-shown:text-xs peer-placeholder-shown:px-2 peer-placeholder-shown:top-0.5 z-[1] transition-all peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-placeholder-shown:bg-white dark:peer-placeholder-shown:bg-gray-800 peer-placeholder-shown:dark:bg-gray-800 group-[.hascontents]:bg-white dark:group-[.hascontents]:bg-gray-800 group-[.hascontents]:text-xs group-[.hascontents]:px-2 group-[.hascontents]:top-0.5 group-[.hascontents]:peer-invalid:!text-error"
					htmlFor={ props.id }>{label}</label>
			)}
			{hint && (
				<div className="absolute px-3 text-sm font-roboto my-0.5 text-gray-500 group-[.hascontents]:peer-invalid:!text-error">{hint}</div>
			)}
		</div>
	);
}
