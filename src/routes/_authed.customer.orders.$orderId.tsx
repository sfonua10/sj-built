import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import PhotoFrame from "#/components/PhotoFrame";
import ProgressCells from "#/components/ProgressCells";
import SlugBanner from "#/components/SlugBanner";
import StatusStamp from "#/components/StatusStamp";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import VinPlate from "#/components/VinPlate";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/_authed/customer/orders/$orderId")({
	component: OrderDetailPage,
});

function OrderDetailPage() {
	const { orderId } = Route.useParams();
	const order = useQuery(api.workOrders.get, {
		workOrderId: orderId as Id<"workOrders">,
	});

	if (order === undefined) {
		return (
			<main className="page-wrap px-6 py-10">
				<Skeleton className="h-8 w-48" />
			</main>
		);
	}
	if (order === null) {
		return (
			<main className="page-wrap px-6 py-10">
				<p className="font-mono text-sm uppercase tracking-[0.2em] text-stone-600">
					Work order not found.
				</p>
				<Button asChild variant="link">
					<Link to="/customer">← Back</Link>
				</Button>
			</main>
		);
	}

	const done = order.items.filter((i) => i.state === "done").length;

	return (
		<>
			<SlugBanner
				kicker="Work order"
				title={order.title ?? order.vin}
				meta={order.truckDescription ?? order.organizationName}
				actions={<StatusStamp status={order.status} size="md" />}
			/>
			<main className="page-wrap space-y-6 px-6 py-8">
				<Link
					to="/customer"
					className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.16em] text-amber-deep hover:text-ink"
				>
					<ArrowLeft className="size-3" />
					All work orders
				</Link>

				<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
					<div className="space-y-6">
						<VinPlate vin={order.vin} size="lg" block />
						<Card>
							<CardContent className="space-y-4 p-6">
								<div className="flex items-center justify-between gap-4">
									<h2 className="font-display text-lg uppercase tracking-[0.1em] text-ink">
										Checklist
									</h2>
									<ProgressCells
										done={done}
										total={order.items.length}
										tone={done === order.items.length ? "timber" : "amber"}
									/>
								</div>
								<ol className="space-y-3">
									{order.items.map((item, index) => (
										<li
											key={item._id}
											className="border-2 border-ink bg-paper-raised"
										>
											<div className="flex items-start gap-3 p-4">
												<div className="flex size-10 flex-shrink-0 items-center justify-center border-2 border-ink bg-paper font-display text-base text-ink">
													{String(index + 1).padStart(2, "0")}
												</div>
												<div className="min-w-0 flex-1 space-y-2">
													<div className="flex flex-wrap items-start justify-between gap-2">
														<div className="min-w-0">
															<p className="font-display text-sm uppercase tracking-[0.08em] text-ink">
																{item.title}
															</p>
															{item.description ? (
																<p className="mt-1 text-sm text-stone-600">
																	{item.description}
																</p>
															) : null}
														</div>
														<ItemStateStamp state={item.state} />
													</div>
													{item.state === "rejected" && item.rejectionReason ? (
														<div className="border-2 border-flare bg-paper-raised p-3">
															<p className="font-display text-xs uppercase tracking-[0.14em] text-flare">
																Rejected
															</p>
															<p className="mt-1 text-sm text-ink">
																{item.rejectionReason}
															</p>
														</div>
													) : null}
													{item.photos.length > 0 ? (
														<div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
															{item.photos.map((p) =>
																p.url ? (
																	<a
																		key={p._id}
																		href={p.url}
																		target="_blank"
																		rel="noopener noreferrer"
																	>
																		<PhotoFrame
																			src={p.url}
																			alt="Checklist upload"
																		/>
																	</a>
																) : null,
															)}
														</div>
													) : null}
												</div>
											</div>
										</li>
									))}
								</ol>
							</CardContent>
						</Card>
					</div>

					<aside className="space-y-4">
						<Card>
							<CardContent className="space-y-4 p-6">
								<h2 className="font-display text-sm uppercase tracking-[0.12em] text-ink">
									Details
								</h2>
								<DetailRow label="Status">
									<StatusStamp status={order.status} size="sm" />
								</DetailRow>
								<DetailRow label="Organization">
									{order.organizationName}
								</DetailRow>
								<DetailRow label="Assigned to">
									{order.contractorName ?? "—"}
								</DetailRow>
								{order.notes ? (
									<DetailRow label="Notes">{order.notes}</DetailRow>
								) : null}
							</CardContent>
						</Card>
					</aside>
				</div>
			</main>
		</>
	);
}

function ItemStateStamp({ state }: { state: "pending" | "done" | "rejected" }) {
	if (state === "done")
		return <StatusStamp tone="timber" label="Done" size="sm" />;
	if (state === "rejected")
		return <StatusStamp tone="flare" label="Rejected" size="sm" />;
	return <StatusStamp tone="stone" label="Pending" size="sm" />;
}

function DetailRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<p className="kicker text-amber-deep">{label}</p>
			<div className="mt-1 text-sm text-ink">{children}</div>
		</div>
	);
}
