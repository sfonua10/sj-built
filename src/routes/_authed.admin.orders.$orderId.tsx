import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AdminNav from "#/components/AdminNav";
import PhotoFrame from "#/components/PhotoFrame";
import SlugBanner from "#/components/SlugBanner";
import StatusStamp from "#/components/StatusStamp";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "#/components/ui/sheet";
import { Skeleton } from "#/components/ui/skeleton";
import { Textarea } from "#/components/ui/textarea";
import VinPlate from "#/components/VinPlate";
import { cn } from "#/lib/utils";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/_authed/admin/orders/$orderId")({
	component: AdminOrderDetailPage,
});

function AdminOrderDetailPage() {
	const { orderId } = Route.useParams();
	const orderIdTyped = orderId as Id<"workOrders">;
	const order = useQuery(api.workOrders.get, {
		workOrderId: orderIdTyped,
	});
	const approve = useMutation(api.workOrders.approveWorkOrder);
	const [assignOpen, setAssignOpen] = useState(false);
	const [rejectingItem, setRejectingItem] = useState<{
		id: Id<"checklistItems">;
		title: string;
	} | null>(null);

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
					<Link to="/admin/orders">← Back</Link>
				</Button>
			</main>
		);
	}

	async function onApprove() {
		try {
			await approve({ workOrderId: orderIdTyped });
			toast.success("Work order approved");
		} catch (err) {
			toast.error((err as Error).message);
		}
	}

	return (
		<>
			<SlugBanner
				kicker="Work order"
				title={order.title ?? order.vin}
				meta={`${order.organizationName} · Created ${new Date(order._creationTime).toLocaleDateString()}`}
				actions={<StatusStamp status={order.status} size="md" />}
			/>
			<AdminNav />
			<main className="page-wrap space-y-6 px-6 py-8">
				<Link
					to="/admin/orders"
					className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.16em] text-amber-deep hover:text-ink"
				>
					<ArrowLeft className="size-3" />
					All work orders
				</Link>

				<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
					<div className="space-y-6">
						<VinPlate vin={order.vin} size="lg" block />

						{(order.status === "unassigned" ||
							order.status === "assigned" ||
							order.status === "awaiting_review") && (
							<div className="flex flex-col gap-3 sm:flex-row">
								{(order.status === "unassigned" ||
									order.status === "assigned") && (
									<Button
										size="hero"
										onClick={() => setAssignOpen(true)}
										className="flex-1"
									>
										{order.status === "unassigned"
											? "Assign contractor"
											: "Reassign contractor"}
									</Button>
								)}
								{order.status === "awaiting_review" && (
									<Button size="hero" onClick={onApprove} className="flex-1">
										Approve order
									</Button>
								)}
							</div>
						)}

						<Card>
							<CardContent className="space-y-4 p-6">
								<div className="flex items-center justify-between">
									<h2 className="font-display text-lg uppercase tracking-[0.1em] text-ink">
										Checklist
									</h2>
									<span className="font-mono text-xs uppercase tracking-[0.18em] text-stone-600">
										{order.items.filter((i) => i.state === "done").length}/
										{order.items.length} done
									</span>
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
														<div className="flex items-center gap-2">
															<ItemStateStamp state={item.state} />
															{order.status === "awaiting_review" &&
																item.state === "done" && (
																	<Button
																		size="sm"
																		variant="outline"
																		onClick={() =>
																			setRejectingItem({
																				id: item._id,
																				title: item.title,
																			})
																		}
																	>
																		Reject
																	</Button>
																)}
														</div>
													</div>
													{item.state === "rejected" && item.rejectionReason ? (
														<div className="relative overflow-hidden border-2 border-flare bg-paper-raised p-3">
															<div className="hazard-stripes absolute inset-x-0 top-0 h-[3px]" />
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
								<DetailRow label="Status" mono>
									<StatusStamp status={order.status} size="sm" />
								</DetailRow>
								<DetailRow label="Organization">
									{order.organizationName}
								</DetailRow>
								<DetailRow label="Assigned to">
									{order.contractorName ?? "—"}
								</DetailRow>
								{order.truckDescription ? (
									<DetailRow label="Truck">{order.truckDescription}</DetailRow>
								) : null}
								{order.notes ? (
									<DetailRow label="Notes">{order.notes}</DetailRow>
								) : null}
							</CardContent>
						</Card>
					</aside>
				</div>

				<AssignContractorSheet
					open={assignOpen}
					onOpenChange={setAssignOpen}
					workOrderId={orderIdTyped}
					currentContractorId={order.assignedContractorId ?? null}
				/>
				<RejectItemDialog
					item={rejectingItem}
					onClose={() => setRejectingItem(null)}
				/>
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
	mono,
}: {
	label: string;
	children: React.ReactNode;
	mono?: boolean;
}) {
	return (
		<div>
			<p className="kicker text-amber-deep">{label}</p>
			<div
				className={cn(
					"mt-1 text-sm text-ink",
					mono && "font-mono uppercase tracking-[0.1em]",
				)}
			>
				{children}
			</div>
		</div>
	);
}

function AssignContractorSheet({
	open,
	onOpenChange,
	workOrderId,
	currentContractorId,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	workOrderId: Id<"workOrders">;
	currentContractorId: Id<"users"> | null;
}) {
	const contractors = useQuery(api.users.listUsers, { role: "contractor" });
	const assign = useMutation(api.workOrders.assignWorkOrder);
	const [value, setValue] = useState<string>(currentContractorId ?? "");
	const [submitting, setSubmitting] = useState(false);

	async function onSubmit() {
		if (!value) {
			toast.error("Pick a contractor.");
			return;
		}
		setSubmitting(true);
		try {
			await assign({
				workOrderId,
				contractorUserId: value as Id<"users">,
			});
			toast.success("Assigned");
			onOpenChange(false);
		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Assign contractor</SheetTitle>
					<SheetDescription>
						The contractor will see this job on their dashboard.
					</SheetDescription>
				</SheetHeader>
				<div className="flex flex-1 flex-col gap-4 px-4">
					<div className="flex flex-col gap-2">
						<Label htmlFor="contractor-select">Contractor</Label>
						<Select value={value} onValueChange={setValue}>
							<SelectTrigger id="contractor-select" className="w-full">
								<SelectValue placeholder="Pick a contractor" />
							</SelectTrigger>
							<SelectContent>
								{contractors?.length ? (
									contractors
										.filter((c) => c.active)
										.map((c) => (
											<SelectItem key={c._id} value={c._id}>
												{c.name}
											</SelectItem>
										))
								) : (
									<SelectItem disabled value="__none__">
										No contractors — invite one first
									</SelectItem>
								)}
							</SelectContent>
						</Select>
					</div>
				</div>
				<SheetFooter>
					<Button onClick={onSubmit} disabled={submitting}>
						{submitting ? "Assigning…" : "Assign"}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

function RejectItemDialog({
	item,
	onClose,
}: {
	item: { id: Id<"checklistItems">; title: string } | null;
	onClose: () => void;
}) {
	const reject = useMutation(api.checklistItems.rejectItem);
	const [reason, setReason] = useState("");
	const [submitting, setSubmitting] = useState(false);

	async function onSubmit() {
		if (!item) return;
		if (!reason.trim()) {
			toast.error("Provide a reason so the contractor knows what to fix.");
			return;
		}
		setSubmitting(true);
		try {
			await reject({ itemId: item.id, reason });
			toast.success("Item rejected; order returned to in-progress");
			setReason("");
			onClose();
		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Dialog open={item !== null} onOpenChange={(o) => !o && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Reject item</DialogTitle>
					<DialogDescription>
						{item?.title ?? ""} — explain what needs to change.
					</DialogDescription>
				</DialogHeader>
				<Textarea
					rows={4}
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					placeholder="Photo is blurry, retake under better light"
				/>
				<DialogFooter>
					<Button variant="ghost" onClick={onClose} disabled={submitting}>
						Cancel
					</Button>
					<Button onClick={onSubmit} disabled={submitting}>
						{submitting ? "Rejecting…" : "Reject"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
