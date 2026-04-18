import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { Skeleton } from "#/components/ui/skeleton";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/_authed/dashboard")({
	component: DashboardRedirect,
});

function DashboardRedirect() {
	const me = useQuery(api.users.me);
	const navigate = useNavigate();

	useEffect(() => {
		if (!me) return;
		if (me.role === "admin") navigate({ to: "/admin", replace: true });
		else if (me.role === "customer")
			navigate({ to: "/customer", replace: true });
		else if (me.role === "contractor")
			navigate({ to: "/contractor", replace: true });
	}, [me, navigate]);

	return (
		<main className="page-wrap py-10">
			<Skeleton className="h-8 w-48" />
		</main>
	);
}
