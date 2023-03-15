import classNames from "classnames";
import { HTMLAttributes } from "react";
import "./index.less";

export interface Props extends HTMLAttributes<SVGElement> {
	className?: string;
}

export default function Spinner({ className }: Props): JSX.Element {
	return (
		<svg className={ classNames("spinner", className) }
			viewBox="0 0 50 50">
			<circle className="path"
				cx="25"
				cy="25"
				fill="none"
				r="20"
				strokeWidth="5" />
		</svg>
	);
}