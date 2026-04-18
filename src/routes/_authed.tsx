import {
	createFileRoute,
	Outlet,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { Skeleton } from "#/components/ui/skeleton";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/_authed")({
	beforeLoad: ({ context, location }) => {
		if (!context.userId) {
			throw redirect({
				to: "/sign-in/$",
				params: { _splat: "" },
				search: { redirect_url: location.href },
			});
		}
	},
	component: AuthedLayout,
});

function AuthedLayout() {
	const ensureUser = useMutation(api.users.ensureUser);
	const navigate = useNavigate();
	const [status, setStatus] = useState<"checking" | "ready">("checking");

	useEffect(() => {
		let cancelled = false;
		ensureUser({})
			.then((result) => {
				if (cancelled) return;
				if (result.status === "no_access") {
					navigate({ to: "/no-access", replace: true });
					return;
				}
				setStatus("ready");
			})
			.catch(() => {
				if (!cancelled) navigate({ to: "/no-access", replace: true });
			});
		return () => {
			cancelled = true;
		};
	}, [ensureUser, navigate]);

	if (status === "checking") {
		return (
			<main className="page-wrap py-10">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="mt-4 h-4 w-80" />
				<Skeleton className="mt-2 h-4 w-64" />
			</main>
		);
	}

	return <Outlet />;
}
