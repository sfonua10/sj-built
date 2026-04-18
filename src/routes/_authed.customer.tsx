import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Skeleton } from "#/components/ui/skeleton";
import { useRequireRole } from "#/lib/acl";

export const Route = createFileRoute("/_authed/customer")({
	component: CustomerLayout,
});

function CustomerLayout() {
	const me = useRequireRole("customer");
	if (!me || me.role !== "customer") {
		return (
			<main className="page-wrap py-10">
				<Skeleton className="h-8 w-48" />
			</main>
		);
	}
	return <Outlet />;
}
