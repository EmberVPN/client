import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

import { HTMLAttributes, useEffect, useState } from "react";

interface Props {
	timestamp: number;
}

export default function Timestamp({ timestamp, ...props }: Omit<Props & HTMLAttributes<HTMLSpanElement>, "children">): JSX.Element {

	// Elapsed time
	const [ elapsed, setElapsed ] = useState<number>(Date.now() - timestamp);
	
	// Update elapsed time
	useEffect(function() {
		const interval = setInterval(() => setElapsed(Date.now() - timestamp), 1000);
		return () => clearInterval(interval);
	}, [ timestamp ]);

	return (
		<span { ...props }>{dayjs.duration(elapsed).format(elapsed > 1000 * 60 * 60 * 24 ? "D[d] HH:mm:ss" : elapsed > 1000 * 60 * 60 ? "HH:mm:ss" : "mm:ss")}</span>
	);
}