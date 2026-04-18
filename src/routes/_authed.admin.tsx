import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Skeleton } from "#/components/ui/skeleton";
import { useRequireRole } from "#/lib/acl";

export const Route = createFileRoute("/_authed/admin")({
	component: AdminLayout,
});

function AdminLayout() {
	const me = useRequireRole("admin");
	if (!me || me.role !== "admin") {
		return (
			<main className="page-wrap py-10">
				<Skeleton className="h-8 w-48" />
			</main>
		);
	}
	return <Outlet />;
}
