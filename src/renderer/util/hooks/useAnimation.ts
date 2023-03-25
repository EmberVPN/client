import { useEffect } from "react";
import useMounted from "./useMounted";

export default function useAnimation(callback: () => void) {

	const mounted = useMounted();
	
	useEffect(function() {
		(function frame() {
			if (mounted) requestAnimationFrame(frame);
			callback();
		}());
	}, [ callback, mounted ]);

}