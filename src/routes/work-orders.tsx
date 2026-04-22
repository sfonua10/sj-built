import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { type WorkOrderDraft, WorkOrderForm } from "#/components/WorkOrderForm";
import {
	type Contractor,
	JOB_STATUS_LABEL,
	type JobStatus,
	STORAGE_KEYS,
	type WorkOrder,
} from "#/lib/types";
import { randomId, useLocalStorageState } from "#/lib/useLocalStorageState";

type WorkOrdersSearch = { new?: 1 };

export const Route = createFileRoute("/work-orders")({
	component: WorkOrders,
	validateSearch: (search: Record<string, unknown>): WorkOrdersSearch => ({
		new: search.new === 1 || search.new === "1" ? 1 : undefined,
	}),
});

const STATUS_ORDER: JobStatus[] = ["pending", "in_progress", "done"];

function nextStatus(current: JobStatus): JobStatus {
	const idx = STATUS_ORDER.indexOf(current);
	return STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
}

function statusBadgeClass(status: JobStatus) {
	switch (status) {
		case "pending":
			return "bg-slate-200 text-slate-700";
		case "in_progress":
			return "bg-amber-200 text-amber-900";
		case "done":
			return "bg-emerald-200 text-emerald-900";
	}
}

function WorkOrders() {
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const [orders, setOrders] = useLocalStorageState<WorkOrder[]>(
		STORAGE_KEYS.workOrders,
		[],
	);
	const [contractors] = useLocalStorageState<Contractor[]>(
		STORAGE_KEYS.contractors,
		[],
	);
	const [formOpen, setFormOpen] = useState(false);

	useEffect(() => {
		if (search.new === 1) {
			setFormOpen(true);
			navigate({ search: {}, replace: true });
		}
	}, [search.new, navigate]);

	const contractorName = (id: string | null) =>
		contractors.find((c) => c.id === id)?.fullName ?? "Unassigned";

	const handleCreate = (draft: WorkOrderDraft) => {
		const order: WorkOrder = {
			...draft,
			id: randomId("wo"),
			createdAt: Date.now(),
			jobs: draft.jobs.map((j) => ({ ...j, status: "pending" as JobStatus })),
		};
		setOrders((prev) => [order, ...prev]);
		setFormOpen(false);
	};

	const cycleJobStatus = (orderId: string, jobId: string) => {
		setOrders((prev) =>
			prev.map((o) =>
				o.id !== orderId
					? o
					: {
							...o,
							jobs: o.jobs.map((j) =>
								j.id === jobId ? { ...j, status: nextStatus(j.status) } : j,
							),
						},
			),
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-2xl font-semibold sm:text-3xl">Work Orders</h1>
				<button
					type="button"
					onClick={() => setFormOpen(true)}
					className="inline-flex h-11 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-amber-400"
				>
					<Plus className="h-5 w-5" />
					Work Order
				</button>
			</div>

			<p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
				Heads up: no backend yet — data is stored in this browser (localStorage)
				and only visible on this device.
			</p>

			{orders.length === 0 ? (
				<div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
					<p className="text-slate-500">No work orders yet.</p>
					<p className="mt-2 text-sm text-slate-400">
						Tap "+ Work Order" above to create one.
					</p>
				</div>
			) : (
				<ul className="space-y-3">
					{orders.map((order) => {
						const doneCount = order.jobs.filter(
							(j) => j.status === "done",
						).length;
						return (
							<li
								key={order.id}
								className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
							>
								<div className="flex flex-wrap items-start justify-between gap-2">
									<div>
										<p className="font-semibold text-slate-900">
											{order.customerName || "Unnamed customer"}
										</p>
										<p className="text-sm text-slate-600">
											{order.vehicle || "Vehicle not specified"}
										</p>
									</div>
									<span className="text-xs text-slate-500">
										{new Date(order.createdAt).toLocaleString()}
									</span>
								</div>

								<dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
									<div>
										<dt className="text-xs uppercase tracking-wide text-slate-500">
											VIN
										</dt>
										<dd className="font-mono text-slate-800">
											{order.vin || "—"}
										</dd>
									</div>
									<div>
										<dt className="text-xs uppercase tracking-wide text-slate-500">
											Mileage
										</dt>
										<dd className="text-slate-800">{order.mileage || "—"}</dd>
									</div>
									<div>
										<dt className="text-xs uppercase tracking-wide text-slate-500">
											Assigned
										</dt>
										<dd className="text-slate-800">
											{contractorName(order.assignedContractorId)}
										</dd>
									</div>
									<div>
										<dt className="text-xs uppercase tracking-wide text-slate-500">
											Progress
										</dt>
										<dd className="text-slate-800">
											{order.jobs.length === 0
												? "—"
												: `${doneCount} of ${order.jobs.length} done`}
										</dd>
									</div>
								</dl>

								{order.jobs.length > 0 && (
									<div className="mt-3">
										<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
											Jobs
										</p>
										<ul className="mt-1 space-y-2">
											{order.jobs.map((job) => (
												<li
													key={job.id}
													className="flex items-start justify-between gap-2 rounded-md border border-slate-100 bg-slate-50 p-2"
												>
													<div className="min-w-0 flex-1">
														<p className="text-sm font-medium text-slate-800">
															{job.description}
														</p>
														{job.notes && (
															<p className="text-xs text-slate-500">
																{job.notes}
															</p>
														)}
													</div>
													<button
														type="button"
														onClick={() => cycleJobStatus(order.id, job.id)}
														aria-label={`Cycle status for ${job.description}. Current: ${JOB_STATUS_LABEL[job.status]}`}
														className={`inline-flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-semibold ${statusBadgeClass(job.status)}`}
													>
														{JOB_STATUS_LABEL[job.status]}
													</button>
												</li>
											))}
										</ul>
									</div>
								)}
							</li>
						);
					})}
				</ul>
			)}

			{formOpen && (
				<WorkOrderForm
					contractors={contractors}
					onClose={() => setFormOpen(false)}
					onSubmit={handleCreate}
				/>
			)}
		</div>
	);
}
