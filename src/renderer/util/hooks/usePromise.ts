import { useEffect, useState } from "react";

export function usePromise<T>(promise: Promise<T>, dependencies = []): T | undefined {
	const [ value, setValue ] = useState<T>();
	useEffect(() => {
		promise.then(setValue);
	}, dependencies);
	return value;
}
