import { useEffect, useState } from "react";

export default function useMounted(callback?: () => void): boolean {
	const [ mounted, setMounted ] = useState(false);
	useEffect(function() {
		setMounted(true);
		if (callback) callback();
		return function() {
			setMounted(false);
		};
	}, [ ]);
	return mounted;

}