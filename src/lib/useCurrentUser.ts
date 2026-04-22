import { useCallback, useEffect, useState } from "react";
import type { Role } from "#/lib/types";

export type CurrentUser = {
	memberId: string;
	role: Role;
	fullName: string;
};

const STORAGE_KEY = "sjbuilt.currentUser.v2";

function readStoredUser(): CurrentUser | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Partial<CurrentUser>;
		if (
			typeof parsed?.memberId !== "string" ||
			typeof parsed?.fullName !== "string" ||
			(parsed.role !== "owner" &&
				parsed.role !== "member" &&
				parsed.role !== "contractor")
		) {
			return null;
		}
		return {
			memberId: parsed.memberId,
			role: parsed.role,
			fullName: parsed.fullName,
		};
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

export function isAdminRole(role: Role | undefined | null): boolean {
	return role === "owner" || role === "member";
}
