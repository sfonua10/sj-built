import { createFileRoute } from "@tanstack/react-router";
import {
	JOB_STATUS_LABEL,
	type JobStatus,
	STORAGE_KEYS,
	type WorkOrder,
} from "#/lib/types";
import { useCurrentUser } from "#/lib/useCurrentUser";
import { useLocalStorageState } from "#/lib/useLocalStorageState";

export const Route = createFileRoute("/my-jobs")({ component: MyJobs });

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

function MyJobs() {
	const { user } = useCurrentUser();
	const [orders, setOrders] = useLocalStorageState<WorkOrder[]>(
		STORAGE_KEYS.workOrders,
		[],
	);

	const myOrders = user
		? orders.filter((o) => o.assignedMemberId === user.memberId)
		: [];

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
			<div>
				<h1 className="text-2xl font-semibold sm:text-3xl">My Jobs</h1>
				<p className="mt-1 text-sm text-slate-500">
					Work orders assigned to you.
				</p>
			</div>

			<p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
				Heads up: no backend yet — data is stored in this browser (localStorage)
				and only visible on this device.
			</p>

			{myOrders.length === 0 ? (
				<div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
					<p className="text-slate-500">Nothing assigned yet.</p>
					<p className="mt-2 text-sm text-slate-400">
						New jobs will show up here when the shop assigns them to you.
					</p>
				</div>
			) : (
				<ul className="space-y-3">
					{myOrders.map((order) => {
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

								<p className="mt-2 text-xs text-slate-500">
									{order.jobs.length === 0
										? "No jobs on this order yet"
										: `${doneCount} of ${order.jobs.length} done`}
								</p>

								{order.jobs.length > 0 && (
									<ul className="mt-3 space-y-2">
										{order.jobs.map((job) => (
											<li
												key={job.id}
												className="flex items-start justify-between gap-2 rounded-md border border-slate-100 bg-slate-50 p-3"
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
													className={`inline-flex h-9 shrink-0 items-center rounded-full px-3 text-xs font-semibold ${statusBadgeClass(job.status)}`}
												>
													{JOB_STATUS_LABEL[job.status]}
												</button>
											</li>
										))}
									</ul>
								)}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
