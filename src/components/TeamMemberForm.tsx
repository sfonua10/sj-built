import { X } from "lucide-react";
import { useState } from "react";
import type { Role } from "#/lib/types";

export type TeamMemberDraft = {
	fullName: string;
	email: string;
	role: Exclude<Role, "owner">;
};

type Props = {
	existingEmails: string[];
	onClose: () => void;
	onSubmit: (draft: TeamMemberDraft) => void;
};

function isEmail(value: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function TeamMemberForm({ existingEmails, onClose, onSubmit }: Props) {
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<Exclude<Role, "owner">>("contractor");
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = fullName.trim();
		const trimmedEmail = email.trim().toLowerCase();
		if (!trimmedName) {
			setError("Full name is required.");
			return;
		}
		if (!isEmail(trimmedEmail)) {
			setError("Enter a valid email address.");
			return;
		}
		if (existingEmails.includes(trimmedEmail)) {
			setError("Someone with that email is already on the team.");
			return;
		}
		setError(null);
		onSubmit({ fullName: trimmedName, email: trimmedEmail, role });
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
			role="dialog"
			aria-modal="true"
			aria-labelledby="team-member-form-title"
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
						id="team-member-form-title"
						className="text-lg font-semibold sm:text-xl"
					>
						Invite Team Member
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
								htmlFor="tm-name"
								className="block text-sm font-medium text-slate-700"
							>
								Full name
							</label>
							<input
								id="tm-name"
								type="text"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								placeholder="e.g. John Smith"
								autoComplete="name"
								className="block h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
							/>
						</div>

						<div className="space-y-1">
							<label
								htmlFor="tm-email"
								className="block text-sm font-medium text-slate-700"
							>
								Email
							</label>
							<input
								id="tm-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="name@example.com"
								autoComplete="email"
								inputMode="email"
								className="block h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
							/>
							<p className="text-xs text-slate-500">
								Their invite link will be shown after you save (demo — no real
								email sent yet).
							</p>
						</div>

						<fieldset className="space-y-2">
							<legend className="block text-sm font-medium text-slate-700">
								Role
							</legend>
							<div className="grid grid-cols-2 gap-2">
								<RolePick
									active={role === "member"}
									onClick={() => setRole("member")}
									title="Member"
									body="Full access — create work orders, manage the team."
								/>
								<RolePick
									active={role === "contractor"}
									onClick={() => setRole("contractor")}
									title="Contractor"
									body="Only sees their assigned jobs."
								/>
							</div>
						</fieldset>

						{error && <p className="text-sm text-red-600">{error}</p>}
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
							Create invite
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

function RolePick({
	active,
	onClick,
	title,
	body,
}: {
	active: boolean;
	onClick: () => void;
	title: string;
	body: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={`flex min-h-20 flex-col items-start gap-1 rounded-lg border p-3 text-left text-sm transition ${
				active
					? "border-amber-500 bg-amber-500/10"
					: "border-slate-300 bg-white hover:border-slate-400"
			}`}
		>
			<span className="font-semibold text-slate-900">{title}</span>
			<span className="text-xs text-slate-600">{body}</span>
		</button>
	);
}
