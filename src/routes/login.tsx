import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HardHat, LogIn, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { type Contractor, STORAGE_KEYS } from "#/lib/types";
import { type Role, useCurrentUser } from "#/lib/useCurrentUser";
import { useLocalStorageState } from "#/lib/useLocalStorageState";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
	const navigate = useNavigate();
	const { user, hydrated, signIn } = useCurrentUser();
	const [contractors] = useLocalStorageState<Contractor[]>(
		STORAGE_KEYS.contractors,
		[],
	);
	const [role, setRole] = useState<Role>("admin");
	const [fullName, setFullName] = useState("");
	const [contractorId, setContractorId] = useState("");

	useEffect(() => {
		if (hydrated && user) {
			navigate({ to: user.role === "admin" ? "/" : "/my-jobs", replace: true });
		}
	}, [hydrated, user, navigate]);

	const contractorInvalid =
		role === "contractor" && (contractors.length === 0 || !contractorId);
	const submitDisabled = !fullName.trim() || contractorInvalid;

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (submitDisabled) return;
		const trimmed = fullName.trim();
		signIn({
			role,
			fullName: trimmed,
			contractorId: role === "contractor" ? contractorId : null,
		});
		navigate({ to: role === "admin" ? "/" : "/my-jobs", replace: true });
	};

	return (
		<div className="mx-auto flex min-h-[80vh] w-full max-w-sm flex-col justify-center">
			<div className="mb-8 text-center">
				<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500 text-2xl font-bold text-slate-900">
					S
				</div>
				<h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
				<p className="mt-1 text-sm text-slate-500">S&amp;J Built</p>
			</div>

			<p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
				Demo sign-in. No password yet — pick a role to preview the app.
			</p>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="grid grid-cols-2 gap-2">
					<RoleButton
						active={role === "admin"}
						onClick={() => setRole("admin")}
						icon={<ShieldCheck className="h-5 w-5" />}
						label="Admin"
					/>
					<RoleButton
						active={role === "contractor"}
						onClick={() => setRole("contractor")}
						icon={<HardHat className="h-5 w-5" />}
						label="Contractor"
					/>
				</div>

				<label className="block text-sm">
					<span className="mb-1 block font-medium text-slate-700">
						Your name
					</span>
					<input
						type="text"
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
						required
						autoComplete="name"
						className="h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
					/>
				</label>

				{role === "contractor" && (
					<div className="block text-sm">
						<label
							htmlFor="login-contractor"
							className="mb-1 block font-medium text-slate-700"
						>
							Which contractor are you?
						</label>
						{contractors.length === 0 ? (
							<p
								id="login-contractor"
								className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500"
							>
								No contractors exist yet. Ask an admin to add you first.
							</p>
						) : (
							<select
								id="login-contractor"
								value={contractorId}
								onChange={(e) => setContractorId(e.target.value)}
								required
								className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
							>
								<option value="">Select…</option>
								{contractors.map((c) => (
									<option key={c.id} value={c.id}>
										{c.fullName}
									</option>
								))}
							</select>
						)}
					</div>
				)}

				<button
					type="submit"
					disabled={submitDisabled}
					className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-amber-500 text-sm font-semibold text-slate-900 shadow-sm hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
				>
					<LogIn className="h-5 w-5" />
					Sign in
				</button>
			</form>
		</div>
	);
}

function RoleButton({
	active,
	onClick,
	icon,
	label,
}: {
	active: boolean;
	onClick: () => void;
	icon: React.ReactNode;
	label: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={`flex h-16 flex-col items-center justify-center gap-1 rounded-lg border text-sm font-semibold transition ${
				active
					? "border-amber-500 bg-amber-500/10 text-amber-700"
					: "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
			}`}
		>
			{icon}
			{label}
		</button>
	);
}
