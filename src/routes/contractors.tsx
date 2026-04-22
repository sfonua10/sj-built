import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
	type ContractorDraft,
	ContractorForm,
} from "#/components/ContractorForm";
import { type Contractor, STORAGE_KEYS } from "#/lib/types";
import { randomId, useLocalStorageState } from "#/lib/useLocalStorageState";

export const Route = createFileRoute("/contractors")({
	component: Contractors,
});

function Contractors() {
	const [contractors, setContractors] = useLocalStorageState<Contractor[]>(
		STORAGE_KEYS.contractors,
		[],
	);
	const [formOpen, setFormOpen] = useState(false);

	const handleCreate = (draft: ContractorDraft) => {
		setContractors((prev) => [
			{ ...draft, id: randomId("c"), createdAt: Date.now() },
			...prev,
		]);
		setFormOpen(false);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-2xl font-semibold sm:text-3xl">Contractors</h1>
				<button
					type="button"
					onClick={() => setFormOpen(true)}
					className="inline-flex h-11 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-amber-400"
				>
					<Plus className="h-5 w-5" />
					Contractor
				</button>
			</div>

			<p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
				Heads up: no backend yet — data is stored in this browser (localStorage)
				and only visible on this device.
			</p>

			{contractors.length === 0 ? (
				<div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
					<p className="text-slate-500">No contractors yet.</p>
					<p className="mt-2 text-sm text-slate-400">
						Tap "+ Contractor" above to add one.
					</p>
				</div>
			) : (
				<ul className="space-y-2">
					{contractors.map((c) => (
						<li
							key={c.id}
							className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
						>
							<span className="font-medium text-slate-900">{c.fullName}</span>
							<span className="text-xs text-slate-500">
								{new Date(c.createdAt).toLocaleDateString()}
							</span>
						</li>
					))}
				</ul>
			)}

			{formOpen && (
				<ContractorForm
					onClose={() => setFormOpen(false)}
					onSubmit={handleCreate}
				/>
			)}
		</div>
	);
}
