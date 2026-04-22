import { X } from "lucide-react";
import { useState } from "react";

export type ContractorDraft = {
	fullName: string;
};

type Props = {
	onClose: () => void;
	onSubmit: (draft: ContractorDraft) => void;
};

export function ContractorForm({ onClose, onSubmit }: Props) {
	const [fullName, setFullName] = useState("");
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = fullName.trim();
		if (trimmed.length === 0) {
			setError("Full name is required.");
			return;
		}
		setError(null);
		onSubmit({ fullName: trimmed });
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
			role="dialog"
			aria-modal="true"
			aria-labelledby="contractor-form-title"
		>
			<button
				type="button"
				aria-label="Close form"
				onClick={onClose}
				className="absolute inset-0 -z-10 cursor-default"
			/>
			<div className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-w-md sm:rounded-2xl">
				<div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
					<h2
						id="contractor-form-title"
						className="text-lg font-semibold sm:text-xl"
					>
						New Contractor
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
								htmlFor="contractor-name"
								className="block text-sm font-medium text-slate-700"
							>
								Full name
							</label>
							<input
								id="contractor-name"
								type="text"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								placeholder="e.g. John Smith"
								className="block h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
							/>
							{error && <p className="text-sm text-red-600">{error}</p>}
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
							Add contractor
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
