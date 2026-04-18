import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ArrowRight, Plus } from "lucide-react";
import SlugBanner from "#/components/SlugBanner";
import StatusStamp from "#/components/StatusStamp";
import { Button } from "#/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import VinPlate from "#/components/VinPlate";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/_authed/customer/")({
	component: CustomerHome,
});

function CustomerHome() {
	const orders = useQuery(api.workOrders.listForMe, {});

	return (
		<>
			<SlugBanner
				kicker="Customer"
				title="Work orders"
				meta={
					orders
						? `${orders.length} ${orders.length === 1 ? "order" : "orders"} on file`
						: undefined
				}
				actions={
					<Button asChild size="default">
						<Link to="/customer/orders/new">
							<Plus className="size-4" />
							New work order
						</Link>
					</Button>
				}
			/>
			<main className="page-wrap space-y-6 px-6 py-8">
				{orders === undefined ? (
					<p className="font-mono text-xs uppercase tracking-[0.2em] text-stone-600">
						Loading orders…
					</p>
				) : orders.length === 0 ? (
					<div className="relative border-2 border-ink bg-paper-raised">
						<div className="hazard-stripes absolute inset-x-0 top-0 h-[3px]" />
						<div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
							<p className="font-display text-2xl uppercase tracking-[0.08em] text-ink">
								No work orders yet
							</p>
							<p className="max-w-sm text-sm text-stone-600">
								Submit your first work order to get a truck into the shop.
							</p>
							<Button asChild size="hero">
								<Link to="/customer/orders/new">
									Start a work order
									<ArrowRight className="size-4" />
								</Link>
							</Button>
						</div>
					</div>
				) : (
					<>
						<ul className="space-y-3 md:hidden">
							{orders.map((o) => (
								<li key={o._id}>
									<Link
										to="/customer/orders/$orderId"
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
										<p className="font-mono text-xs uppercase tracking-[0.18em] text-stone-600">
											{new Date(o._creationTime).toLocaleDateString()}
										</p>
									</Link>
								</li>
							))}
						</ul>
						<div className="hidden border-2 border-ink bg-paper-raised md:block">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>VIN</TableHead>
										<TableHead>Title</TableHead>
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
											<TableCell>
												<StatusStamp status={o.status} size="sm" />
											</TableCell>
											<TableCell className="font-mono text-xs text-stone-600">
												{new Date(o._creationTime).toLocaleDateString()}
											</TableCell>
											<TableCell className="text-right">
												<Link
													to="/customer/orders/$orderId"
													params={{ orderId: o._id }}
													className="inline-flex items-center gap-1 font-display text-xs uppercase tracking-[0.14em] text-amber-deep hover:text-ink"
												>
													View
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
