import { useCallback, useEffect, useState } from "react";

export type Role = "admin" | "contractor";

export type CurrentUser = {
	role: Role;
	fullName: string;
	contractorId: string | null;
};

const STORAGE_KEY = "sjbuilt.currentUser.v1";

function readStoredUser(): CurrentUser | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as CurrentUser;
	} catch {
		return null;
	}
}

export function useCurrentUser() {
	const [user, setUser] = useState<CurrentUser | null>(null);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setUser(readStoredUser());
		setHydrated(true);

		const onStorage = (event: StorageEvent) => {
			if (event.key === STORAGE_KEY) {
				setUser(readStoredUser());
			}
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);

	const signIn = useCallback((next: CurrentUser) => {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		setUser(next);
	}, []);

	const signOut = useCallback(() => {
		window.localStorage.removeItem(STORAGE_KEY);
		setUser(null);
	}, []);

	return { user, hydrated, signIn, signOut };
}
