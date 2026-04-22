import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { Contractor } from "#/lib/types";
import { randomId } from "#/lib/useLocalStorageState";

export type JobDraft = {
	id: string;
	description: string;
	notes: string;
};

export type WorkOrderDraft = {
	vin: string;
	customerName: string;
	vehicle: string;
	mileage: string;
	assignedContractorId: string | null;
	jobs: JobDraft[];
};

type Props = {
	contractors: Contractor[];
	onClose: () => void;
	onSubmit: (draft: WorkOrderDraft) => void;
};

function newJob(): JobDraft {
	return { id: randomId("job"), description: "", notes: "" };
}

export function WorkOrderForm({ contractors, onClose, onSubmit }: Props) {
	const [vin, setVin] = useState("");
	const [customerName, setCustomerName] = useState("");
	const [vehicle, setVehicle] = useState("");
	const [mileage, setMileage] = useState("");
	const [assignedContractorId, setAssignedContractorId] = useState<string>("");
	const [jobs, setJobs] = useState<JobDraft[]>([newJob()]);
	const [vinError, setVinError] = useState<string | null>(null);

	const updateJob = (id: string, patch: Partial<JobDraft>) => {
		setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
	};

	const removeJob = (id: string) => {
		setJobs((prev) =>
			prev.length === 1 ? prev : prev.filter((j) => j.id !== id),
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedVin = vin.trim().toUpperCase();
		if (trimmedVin.length > 0 && trimmedVin.length !== 17) {
			setVinError("VIN must be exactly 17 characters.");
			return;
		}
		setVinError(null);
		const validJobs = jobs
			.map((j) => ({
				...j,
				description: j.description.trim(),
				notes: j.notes.trim(),
			}))
			.filter((j) => j.description.length > 0);
		onSubmit({
			vin: trimmedVin,
			customerName: customerName.trim(),
			vehicle: vehicle.trim(),
			mileage: mileage.trim(),
			assignedContractorId: assignedContractorId || null,
			jobs: validJobs,
		});
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
			role="dialog"
			aria-modal="true"
			aria-labelledby="work-order-form-title"
		>
			<button
				type="button"
				aria-label="Close form"
				onClick={onClose}
				className="absolute inset-0 -z-10 cursor-default"
			/>
			<div className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-w-2xl sm:rounded-2xl">
				<div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
					<h2
						id="work-order-form-title"
						className="text-lg font-semibold sm:text-xl"
					>
						New Work Order
					</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close"
						className="-m-2 flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<form
					onSubmit={handleSubmit}
					className="flex flex-1 flex-col overflow-hidden"
				>
					<div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
						<div className="space-y-1">
							<label
								htmlFor="wo-vin"
								className="block text-sm font-medium text-slate-700"
							>
								VIN
							</label>
							<input
								id="wo-vin"
								type="text"
								value={vin}
								onChange={(e) => setVin(e.target.value)}
								maxLength={17}
								placeholder="17-character VIN"
								autoCapitalize="characters"
								className="block h-11 w-full rounded-lg border border-slate-300 px-3 text-base uppercase shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
							/>
							{vinError && <p className="text-sm text-red-600">{vinError}</p>}
						</div>

						<div className="space-y-1">
							<label
								htmlFor="wo-customer"
								className="block text-sm font-medium text-slate-700"
							>
								Customer name
							</label>
							<input
								id="wo-customer"
								type="text"
								value={customerName}
								onChange={(e) => setCustomerName(e.target.value)}
								className="block h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
							/>
						</div>

						<div className="space-y-1">
							<label
								htmlFor="wo-vehicle"
								className="block text-sm font-medium text-slate-700"
							>
								Vehicle (year / make / model)
							</label>
							<input
								id="wo-vehicle"
								type="text"
								value={vehicle}
								onChange={(e) => setVehicle(e.target.value)}
								placeholder="e.g. 2018 Ford F-150"
								className="block h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
							/>
						</div>

						<div className="space-y-1">
							<label
								htmlFor="wo-mileage"
								className="block text-sm font-medium text-slate-700"
							>
								Mileage
							</label>
							<input
								id="wo-mileage"
								type="text"
								inputMode="numeric"
								pattern="[0-9]*"
								value={mileage}
								onChange={(e) =>
									setMileage(e.target.value.replace(/[^0-9]/g, ""))
								}
								placeholder="e.g. 84500"
								className="block h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
							/>
						</div>

						<div className="space-y-1">
							<label
								htmlFor="wo-contractor"
								className="block text-sm font-medium text-slate-700"
							>
								Assigned to
							</label>
							<select
								id="wo-contractor"
								value={assignedContractorId}
								onChange={(e) => setAssignedContractorId(e.target.value)}
								className="block h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
							>
								<option value="">— Unassigned —</option>
								{contractors.map((c) => (
									<option key={c.id} value={c.id}>
										{c.fullName}
									</option>
								))}
							</select>
							{contractors.length === 0 && (
								<p className="text-xs text-slate-500">
									No contractors yet. Add some on the Contractors page.
								</p>
							)}
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="block text-sm font-medium text-slate-700">
									Job list
								</span>
								<button
									type="button"
									onClick={() => setJobs((prev) => [...prev, newJob()])}
									className="inline-flex h-11 items-center gap-1 rounded-lg bg-slate-100 px-3 text-sm font-medium text-slate-700 hover:bg-slate-200"
								>
									<Plus className="h-4 w-4" />
									Add job
								</button>
							</div>

							<ul className="space-y-3">
								{jobs.map((job, idx) => (
									<li
										key={job.id}
										className="rounded-lg border border-slate-200 bg-slate-50 p-3"
									>
										<div className="mb-2 flex items-center justify-between">
											<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
												Job {idx + 1}
											</span>
											<button
												type="button"
												onClick={() => removeJob(job.id)}
												disabled={jobs.length === 1}
												aria-label={`Remove job ${idx + 1}`}
												className="-m-2 flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>
										<div className="space-y-2">
											<input
												type="text"
												value={job.description}
												onChange={(e) =>
													updateJob(job.id, { description: e.target.value })
												}
												placeholder="Description (e.g. Replace front brake pads)"
												aria-label={`Job ${idx + 1} description`}
												className="block h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
											/>
											<textarea
												value={job.notes}
												onChange={(e) =>
													updateJob(job.id, { notes: e.target.value })
												}
												placeholder="Notes (optional)"
												aria-label={`Job ${idx + 1} notes`}
												rows={2}
												className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
											/>
										</div>
									</li>
								))}
							</ul>
						</div>
					</div>

					<div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-end sm:px-6">
						<button
							type="button"
							onClick={onClose}
							className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-100"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="inline-flex h-11 items-center justify-center rounded-lg bg-amber-500 px-4 text-sm font-semibold text-slate-900 hover:bg-amber-400"
						>
							Create work order
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
