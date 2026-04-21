import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
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
	return (
		<div className="md:flex">
			<aside
				className="hidden md:sticky md:top-[57px] md:block md:h-[calc(100vh-57px)] md:w-60 md:shrink-0 md:border-r-2 md:border-ink md:bg-paper-raised"
				aria-label="Main menu"
			>
				<nav className="flex flex-col gap-1 p-4">
					<Link
						to="/admin"
						activeOptions={{ exact: true }}
						className="flex min-h-11 items-center gap-3 border-l-[3px] border-transparent px-3 py-2 font-display text-sm uppercase tracking-[0.14em] text-stone-600 transition-colors hover:text-ink [&.active]:border-amber [&.active]:text-ink"
						activeProps={{ className: "active" }}
					>
						<LayoutDashboard className="size-5" aria-hidden />
						<span>Dashboard</span>
					</Link>
				</nav>
			</aside>
			<div className="min-w-0 flex-1">
				<Outlet />
			</div>
		</div>
	);
}
