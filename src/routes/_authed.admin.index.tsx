import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ArrowRight } from "lucide-react";
import AdminNav from "#/components/AdminNav";
import SlugBanner from "#/components/SlugBanner";
import StatCard from "#/components/StatCard";
import StatusStamp from "#/components/StatusStamp";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import VinPlate from "#/components/VinPlate";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/_authed/admin/")({
	component: AdminHome,
});

function AdminHome() {
	const unassigned = useQuery(api.workOrders.listForMe, {
		status: "unassigned",
	});
	const inProgress = useQuery(api.workOrders.listForMe, {
		status: "in_progress",
	});
	const awaitingReview = useQuery(api.workOrders.listForMe, {
		status: "awaiting_review",
	});
	const complete = useQuery(api.workOrders.listForMe, { status: "complete" });

	const today = new Date();
	const meta = today
		.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
		})
		.toUpperCase();

	return (
		<>
			<SlugBanner kicker="Command" title="Overview" meta={meta} />
			<AdminNav />
			<main className="page-wrap space-y-10 px-6 py-10">
				<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<StatCard
						label="Unassigned"
						value={unassigned?.length ?? "—"}
						tone="amber"
						href="/admin/orders"
						hrefLabel="Queue"
					/>
					<StatCard
						label="In progress"
						value={inProgress?.length ?? "—"}
						tone="torch"
						href="/admin/orders"
						hrefLabel="Track"
					/>
					<StatCard
						label="Awaiting review"
						value={awaitingReview?.length ?? "—"}
						tone="flare"
						href="/admin/orders"
						hrefLabel="Review"
					/>
					<StatCard
						label="Complete"
						value={complete?.length ?? "—"}
						tone="timber"
						href="/admin/orders"
						hrefLabel="Archive"
					/>
				</section>

				<section className="grid gap-6 lg:grid-cols-2">
					<QueueCard
						kicker="Up next"
						title="Unassigned queue"
						accent="amber"
						orders={unassigned ?? null}
						emptyLabel="No unassigned orders"
						ctaLabel="Assign"
					/>
					<QueueCard
						kicker="Review"
						title="Awaiting review"
						accent="flare"
						orders={awaitingReview ?? null}
						emptyLabel="No orders awaiting review"
						ctaLabel="Review"
					/>
				</section>
			</main>
		</>
	);
}

type QueueOrder = {
	_id: string;
	vin: string;
	title?: string;
	status:
		| "unassigned"
		| "assigned"
		| "in_progress"
		| "awaiting_review"
		| "complete";
};

function QueueCard({
	kicker,
	title,
	accent,
	orders,
	emptyLabel,
	ctaLabel,
}: {
	kicker: string;
	title: string;
	accent: "amber" | "flare";
	orders: QueueOrder[] | null;
	emptyLabel: string;
	ctaLabel: string;
}) {
	return (
		<Card accent={accent}>
			<CardHeader className="flex-col gap-1">
				<p className="kicker text-amber-deep">{kicker}</p>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				{orders === null ? (
					<p className="font-mono text-xs uppercase tracking-[0.2em] text-stone-600">
						Loading…
					</p>
				) : orders.length === 0 ? (
					<div className="flex h-20 items-center justify-center border-2 border-dashed border-stone-300">
						<p className="font-mono text-xs uppercase tracking-[0.2em] text-stone-600">
							{emptyLabel}
						</p>
					</div>
				) : (
					orders.slice(0, 5).map((o) => (
						<Link
							key={o._id}
							to="/admin/orders/$orderId"
							params={{ orderId: o._id }}
							className="group flex items-center justify-between gap-4 border-b border-stone-200 py-3 transition-colors last:border-b-0 hover:bg-stone-100"
						>
							<div className="min-w-0 space-y-1">
								<VinPlate vin={o.vin} size="sm" />
								{o.title ? (
									<p className="truncate text-sm text-ink">{o.title}</p>
								) : null}
							</div>
							<div className="flex flex-shrink-0 items-center gap-3">
								<StatusStamp status={o.status} size="sm" />
								<span className="hidden font-display text-xs uppercase tracking-[0.14em] text-amber-deep group-hover:text-ink sm:inline-flex items-center gap-1">
									{ctaLabel}
									<ArrowRight className="size-3" />
								</span>
							</div>
						</Link>
					))
				)}
			</CardContent>
		</Card>
	);
}
