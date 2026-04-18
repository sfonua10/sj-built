import { createFileRoute, Outlet } from "@tanstack/react-router";
import ContractorBottomNav from "#/components/ContractorBottomNav";
import { Skeleton } from "#/components/ui/skeleton";
import { useRequireRole } from "#/lib/acl";

export const Route = createFileRoute("/_authed/contractor")({
	component: ContractorLayout,
});

function ContractorLayout() {
	const me = useRequireRole("contractor");
	if (!me || me.role !== "contractor") {
		return (
			<main className="page-wrap px-6 py-10">
				<Skeleton className="h-8 w-48" />
			</main>
		);
	}
	return (
		<div className="pb-20 md:pb-0">
			<Outlet />
			<ContractorBottomNav />
		</div>
	);
}
