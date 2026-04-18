import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ArrowRight } from "lucide-react";
import AdminNav from "#/components/AdminNav";
import SlugBanner from "#/components/SlugBanner";
import StatusStamp from "#/components/StatusStamp";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import VinPlate from "#/components/VinPlate";
import { cn } from "#/lib/utils";
import { statusLabels, statusOrder } from "#/lib/workOrder";
import { api } from "../../convex/_generated/api";

type Status = (typeof statusOrder)[number];

export const Route = createFileRoute("/_authed/admin/orders/")({
	component: AdminOrdersPage,
	validateSearch: (search): { status?: Status } => {
		const raw = (search.status as string | undefined) ?? undefined;
		if (raw && (statusOrder as readonly string[]).includes(raw)) {
			return { status: raw as Status };
		}
		return {};
	},
});

const tabs = [
	{ value: "all", label: "All" },
	...statusOrder.map((s) => ({ value: s, label: statusLabels[s] })),
] as const;

function AdminOrdersPage() {
	const navigate = Route.useNavigate();
	const { status } = Route.useSearch();
	const orders = useQuery(api.workOrders.listForMe, status ? { status } : {});
	const orgs = useQuery(api.organizations.list, {});

	const orgMap = new Map(orgs?.map((o) => [o._id, o.name] as const) ?? []);
	const activeTab = status ?? "all";

	return (
		<>
			<SlugBanner
				kicker="Command"
				title="Work orders"
				meta={
					orders
						? `${orders.length} ${orders.length === 1 ? "order" : "orders"}`
						: undefined
				}
			/>
			<AdminNav />
			<main className="page-wrap space-y-6 px-6 py-8">
				<div className="border-b-2 border-ink overflow-x-auto">
					<div className="flex min-w-max items-end gap-1">
						{tabs.map((tab) => {
							const isActive = activeTab === tab.value;
							return (
								<button
									type="button"
									key={tab.value}
									onClick={() =>
										navigate({
											search:
												tab.value === "all"
													? {}
													: { status: tab.value as Status },
										})
									}
									className={cn(
										"relative -mb-[2px] border-2 border-transparent border-b-0 px-4 py-2 font-display text-xs uppercase tracking-[0.14em] transition-colors",
										isActive
											? "border-ink bg-paper-raised text-ink"
											: "text-stone-600 hover:text-ink",
									)}
								>
									{tab.label}
									{isActive ? (
										<span className="absolute inset-x-0 -top-[2px] h-[3px] bg-amber" />
									) : null}
								</button>
							);
						})}
					</div>
				</div>

				{orders === undefined ? (
					<p className="font-mono text-xs uppercase tracking-[0.2em] text-stone-600">
						Loading orders…
					</p>
				) : orders.length === 0 ? (
					<div className="flex h-32 items-center justify-center border-2 border-dashed border-stone-300">
						<p className="font-mono text-xs uppercase tracking-[0.2em] text-stone-600">
							No orders in this queue
						</p>
					</div>
				) : (
					<>
						{/* Mobile — card list */}
						<ul className="space-y-3 md:hidden">
							{orders.map((o) => (
								<li key={o._id}>
									<Link
										to="/admin/orders/$orderId"
										params={{ orderId: o._id }}
										className="shop-card block space-y-3 px-4 py-4 transition-colors hover:bg-stone-100"
									>
										<div className="flex items-start justify-between gap-3">
											<VinPlate vin={o.vin} size="sm" />
											<StatusStamp status={o.status} size="sm" />
										</div>
										{o.title ? (
											<p className="text-sm text-ink">{o.title}</p>
										) : null}
										<div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-stone-600">
											<span>{orgMap.get(o.organizationId) ?? "—"}</span>
											<span>
												{new Date(o._creationTime).toLocaleDateString()}
											</span>
										</div>
									</Link>
								</li>
							))}
						</ul>

						{/* Desktop — table */}
						<div className="hidden border-2 border-ink bg-paper-raised md:block">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>VIN</TableHead>
										<TableHead>Title</TableHead>
										<TableHead>Organization</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Created</TableHead>
										<TableHead aria-label="actions" />
									</TableRow>
								</TableHeader>
								<TableBody>
									{orders.map((o) => (
										<TableRow key={o._id}>
											<TableCell>
												<VinPlate vin={o.vin} size="sm" />
											</TableCell>
											<TableCell className="text-ink">
												{o.title ?? "—"}
											</TableCell>
											<TableCell className="text-stone-600">
												{orgMap.get(o.organizationId) ?? "—"}
											</TableCell>
											<TableCell>
												<StatusStamp status={o.status} size="sm" />
											</TableCell>
											<TableCell className="font-mono text-xs text-stone-600">
												{new Date(o._creationTime).toLocaleDateString()}
											</TableCell>
											<TableCell className="text-right">
												<Link
													to="/admin/orders/$orderId"
													params={{ orderId: o._id }}
													className="inline-flex items-center gap-1 font-display text-xs uppercase tracking-[0.14em] text-amber-deep hover:text-ink"
												>
													Open
													<ArrowRight className="size-3" />
												</Link>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</>
				)}
			</main>
		</>
	);
}
