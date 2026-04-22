import { useCallback, useEffect, useState } from "react";
import type { Role } from "#/lib/types";

export type CurrentUser = {
	memberId: string;
	role: Role;
	fullName: string;
};

const STORAGE_KEY = "sjbuilt.currentUser.v2";
const USER_CHANGED_EVENT = "sjbuilt:currentUserChanged";

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

function notifyUserChanged() {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new Event(USER_CHANGED_EVENT));
}

export function useCurrentUser() {
	const [user, setUser] = useState<CurrentUser | null>(null);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setUser(readStoredUser());
		setHydrated(true);

		const refresh = () => setUser(readStoredUser());
		const onStorage = (event: StorageEvent) => {
			if (event.key === STORAGE_KEY) refresh();
		};
		window.addEventListener("storage", onStorage);
		window.addEventListener(USER_CHANGED_EVENT, refresh);
		return () => {
			window.removeEventListener("storage", onStorage);
			window.removeEventListener(USER_CHANGED_EVENT, refresh);
		};
	}, []);

	const signIn = useCallback((next: CurrentUser) => {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		setUser(next);
		notifyUserChanged();
	}, []);

	const signOut = useCallback(() => {
		window.localStorage.removeItem(STORAGE_KEY);
		setUser(null);
		notifyUserChanged();
	}, []);

	return { user, hydrated, signIn, signOut };
}

export function isAdminRole(role: Role | undefined | null): boolean {
	return role === "owner" || role === "member";
}
