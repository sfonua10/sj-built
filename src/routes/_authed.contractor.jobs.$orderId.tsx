import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Camera, Check, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import PhotoFrame from "#/components/PhotoFrame";
import ProgressCells from "#/components/ProgressCells";
import SlugBanner from "#/components/SlugBanner";
import StatusStamp from "#/components/StatusStamp";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import VinPlate from "#/components/VinPlate";
import { resizeImage } from "#/lib/image";
import { cn } from "#/lib/utils";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/_authed/contractor/jobs/$orderId")({
	component: ContractorJobPage,
});

type OrderItem = {
	_id: Id<"checklistItems">;
	title: string;
	description?: string;
	state: "pending" | "done" | "rejected";
	rejectionReason?: string;
	photos: {
		_id: Id<"checklistPhotos">;
		storageId: Id<"_storage">;
		url: string | null;
	}[];
};

function ContractorJobPage() {
	const { orderId } = Route.useParams();
	const orderIdTyped = orderId as Id<"workOrders">;
	const order = useQuery(api.workOrders.get, { workOrderId: orderIdTyped });
	const submit = useMutation(api.workOrders.submitForReview);
	const [submitting, setSubmitting] = useState(false);

	if (order === undefined) {
		return (
			<main className="page-wrap px-6 py-6">
				<Skeleton className="h-8 w-48" />
			</main>
		);
	}
	if (order === null) {
		return (
			<main className="page-wrap px-6 py-6">
				<p className="font-mono text-sm uppercase tracking-[0.2em] text-stone-600">
					Job not found.
				</p>
				<Button asChild variant="link">
					<Link to="/contractor">← Back</Link>
				</Button>
			</main>
		);
	}

	const done = order.items.filter((i) => i.state === "done").length;
	const allDone = done === order.items.length;
	const canSubmit =
		(order.status === "assigned" || order.status === "in_progress") && allDone;
	const readOnly =
		order.status === "complete" || order.status === "awaiting_review";

	async function onSubmit() {
		setSubmitting(true);
		try {
			await submit({ workOrderId: orderIdTyped });
			toast.success("Submitted for review");
		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<>
			<SlugBanner
				kicker="Job"
				title={order.title ?? order.truckDescription ?? "Work order"}
				meta={order.truckDescription ?? undefined}
				actions={<StatusStamp status={order.status} size="md" />}
			/>
			<main className="page-wrap space-y-5 px-4 pb-32 pt-4 sm:px-6">
				<Link
					to="/contractor"
					className="inline-flex min-h-[48px] items-center gap-2 font-display text-sm uppercase tracking-[0.14em] text-amber-deep"
				>
					<ArrowLeft className="size-4" />
					All jobs
				</Link>

				<VinPlate vin={order.vin} size="lg" block />

				<div className="flex items-center justify-between gap-4 border-2 border-ink bg-paper-raised px-4 py-3">
					<p className="font-display text-xs uppercase tracking-[0.16em] text-ink">
						Progress
					</p>
					<ProgressCells
						done={done}
						total={order.items.length}
						tone={allDone ? "timber" : "amber"}
					/>
				</div>

				<section className="space-y-3">
					{order.items.map((item, index) => (
						<ChecklistItemCard
							key={item._id}
							item={item as OrderItem}
							index={index}
							readOnly={readOnly}
						/>
					))}
				</section>
			</main>

			{canSubmit ? (
				<div className="fixed inset-x-0 bottom-16 z-40 border-t-2 border-ink bg-amber amber-pulse md:bottom-0">
					<div className="page-wrap px-4 py-3 sm:px-6">
						<Button
							size="hero"
							className="w-full bg-ink text-paper hover:bg-ink/90 active:scale-[0.99]"
							onClick={onSubmit}
							disabled={submitting}
						>
							{submitting ? "Submitting…" : "Submit for review"}
						</Button>
					</div>
				</div>
			) : null}
		</>
	);
}

function ChecklistItemCard({
	item,
	index,
	readOnly,
}: {
	item: OrderItem;
	index: number;
	readOnly: boolean;
}) {
	const generateUploadUrl = useMutation(api.files.generateUploadUrl);
	const attachPhoto = useMutation(api.files.attachPhoto);
	const removePhoto = useMutation(api.files.removePhoto);
	const markDone = useMutation(api.checklistItems.markItemDone);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [uploading, setUploading] = useState(false);

	async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;
		setUploading(true);
		try {
			const blob = await resizeImage(file);
			const uploadUrl = await generateUploadUrl({ checklistItemId: item._id });
			const res = await fetch(uploadUrl, {
				method: "POST",
				headers: { "Content-Type": blob.type },
				body: blob,
			});
			if (!res.ok) {
				throw new Error(`Upload failed: ${res.status}`);
			}
			const { storageId } = (await res.json()) as {
				storageId: Id<"_storage">;
			};
			await attachPhoto({ checklistItemId: item._id, storageId });
			toast.success("Photo uploaded");
		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			setUploading(false);
		}
	}

	async function onMarkDone() {
		try {
			await markDone({ itemId: item._id });
			toast.success("Item done");
		} catch (err) {
			toast.error((err as Error).message);
		}
	}

	async function onRemovePhoto(photoId: Id<"checklistPhotos">) {
		try {
			await removePhoto({ photoId });
		} catch (err) {
			toast.error((err as Error).message);
		}
	}

	const rejected = item.state === "rejected";

	return (
		<Card
			accent={rejected ? "flare" : item.state === "done" ? "timber" : "amber"}
		>
			<CardContent className="space-y-3 p-4">
				<div className="flex items-start gap-4">
					<ItemStatePad state={item.state} />
					<div className="min-w-0 flex-1">
						<p className="font-mono text-xs uppercase tracking-[0.18em] text-stone-600">
							Item {String(index + 1).padStart(2, "0")}
						</p>
						<p className="mt-1 font-display text-base uppercase leading-tight tracking-[0.04em] text-ink">
							{item.title}
						</p>
						{item.description ? (
							<p className="mt-1 text-sm text-stone-600">{item.description}</p>
						) : null}
					</div>
				</div>

				{rejected && item.rejectionReason ? (
					<div className="relative overflow-hidden border-2 border-flare bg-paper-raised p-3">
						<div className="hazard-stripes absolute inset-x-0 top-0 h-[3px]" />
						<p className="font-display text-xs uppercase tracking-[0.14em] text-flare">
							Rejected
						</p>
						<p className="mt-1 text-sm text-ink">{item.rejectionReason}</p>
					</div>
				) : null}

				{item.photos.length > 0 ? (
					<div className="grid grid-cols-3 gap-2">
						{item.photos.map((p) =>
							p.url ? (
								<div key={p._id} className="relative">
									<PhotoFrame src={p.url} alt="Checklist upload" />
									{!readOnly && (
										<button
											type="button"
											aria-label="Remove photo"
											className="absolute right-1 top-1 flex size-7 items-center justify-center border-2 border-ink bg-paper-raised text-ink shadow-none hover:bg-flare hover:text-paper-raised"
											onClick={() => onRemovePhoto(p._id)}
										>
											<Trash2 className="size-3" />
										</button>
									)}
								</div>
							) : null,
						)}
					</div>
				) : null}

				{!readOnly && (
					<div className="flex flex-col gap-2 sm:flex-row">
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							capture="environment"
							className="hidden"
							onChange={onFileSelected}
						/>
						<Button
							variant="outline"
							size="hero"
							className="flex-1"
							onClick={() => fileInputRef.current?.click()}
							disabled={uploading}
						>
							<Camera className="size-5" />
							{uploading ? "Uploading…" : "Add photo"}
						</Button>
						{item.state !== "done" && item.photos.length > 0 ? (
							<Button size="hero" className="flex-1" onClick={onMarkDone}>
								<Check className="size-5" />
								Mark done
							</Button>
						) : null}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function ItemStatePad({ state }: { state: "pending" | "done" | "rejected" }) {
	return (
		<div
			className={cn(
				"flex size-16 flex-shrink-0 items-center justify-center border-2",
				state === "done" && "border-timber bg-timber text-paper-raised",
				state === "rejected" && "border-flare bg-flare text-paper-raised",
				state === "pending" && "border-ink bg-paper-raised text-ink",
			)}
		>
			{state === "done" ? (
				<Check className="size-8" strokeWidth={3} />
			) : state === "rejected" ? (
				<X className="size-8" strokeWidth={3} />
			) : (
				<span className="size-3 rounded-full border-2 border-ink" />
			)}
		</div>
	);
}
