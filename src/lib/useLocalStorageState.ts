import { useCallback, useEffect, useState } from "react";

export function useLocalStorageState<T>(key: string, defaultValue: T) {
	const [value, setInternal] = useState<T>(defaultValue);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(key);
			if (stored !== null) {
				setInternal(JSON.parse(stored) as T);
			}
		} catch {
			// ignore parse / storage errors
		}
		setHydrated(true);
	}, [key]);

	const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback(
		(update) => {
			setInternal((prev) => {
				const next =
					typeof update === "function" ? (update as (p: T) => T)(prev) : update;
				try {
					window.localStorage.setItem(key, JSON.stringify(next));
				} catch {
					// ignore quota / serialization errors
				}
				return next;
			});
		},
		[key],
	);

	return [value, setValue, hydrated] as const;
}

export function randomId(prefix: string) {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
