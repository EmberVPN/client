import { useState } from "react";

export function usePromise<T>(promise: Promise<T>): T | undefined {
	const [ value, setValue ] = useState<T>();
	promise.then(setValue);
	return value;
}
