import { useEffect, useState } from "react";

export function useLocalStorageState<T>(key: string, defaultValue: T) {
	const [value, setValue] = useState<T>(defaultValue);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(key);
			if (stored !== null) {
				setValue(JSON.parse(stored) as T);
			}
		} catch {
			// ignore parse / storage errors
		}
		setHydrated(true);
	}, [key]);

	useEffect(() => {
		if (!hydrated) return;
		try {
			window.localStorage.setItem(key, JSON.stringify(value));
		} catch {
			// ignore quota / serialization errors
		}
	}, [key, value, hydrated]);

	return [value, setValue, hydrated] as const;
}

export function randomId(prefix: string) {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
