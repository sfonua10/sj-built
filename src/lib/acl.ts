import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";

export type Role = "admin" | "customer" | "contractor";

export function useRequireRole(role: Role) {
	const me = useQuery(api.users.me);
	const navigate = useNavigate();

	useEffect(() => {
		if (me === undefined) return;
		if (me === null) {
			navigate({ to: "/no-access", replace: true });
			return;
		}
		if (me.role !== role) {
			navigate({ to: "/dashboard", replace: true });
		}
	}, [me, role, navigate]);

	return me;
}
