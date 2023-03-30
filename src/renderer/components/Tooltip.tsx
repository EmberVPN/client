import { PropsWithChildren } from "react";

export default function Tooltip({ children }: PropsWithChildren) {
	return (
		<div className="absolute top-full bg-neutral-700 text-xs font-medium rounded-md h-6 flex items-center px-2 pointer-events-none opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all origin-top">{children}</div>
	);
}
