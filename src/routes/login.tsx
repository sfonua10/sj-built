import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogIn, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ROLE_LABEL, STORAGE_KEYS, type TeamMember } from "#/lib/types";
import { type CurrentUser, useCurrentUser } from "#/lib/useCurrentUser";
import { randomId, useLocalStorageState } from "#/lib/useLocalStorageState";

export const Route = createFileRoute("/login")({ component: Login });

function isEmail(value: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function initials(name: string) {
	const parts = name.trim().split(/\s+/);
	if (parts.length === 0) return "?";
	const first = parts[0]?.[0] ?? "";
	const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
	return (first + last).toUpperCase() || "?";
}

function Login() {
	const navigate = useNavigate();
	const { user, hydrated, signIn } = useCurrentUser();
	const [members, setMembers, membersHydrated] = useLocalStorageState<
		TeamMember[]
	>(STORAGE_KEYS.teamMembers, []);
	const [showEmailForm, setShowEmailForm] = useState(false);
	const [googleOpen, setGoogleOpen] = useState(false);

	useEffect(() => {
		if (hydrated && user) {
			navigate({
				to: user.role === "contractor" ? "/my-jobs" : "/",
				replace: true,
			});
		}
	}, [hydrated, user, navigate]);

	if (!hydrated || !membersHydrated) {
		return <div aria-busy="true" />;
	}

	const noTeamYet = members.length === 0;

	const completeSignIn = (member: TeamMember): string | null => {
		if (!member.acceptedAt) {
			return "That invite hasn't been accepted yet. Use the invite link from your email first.";
		}
		const next: CurrentUser = {
			memberId: member.id,
			role: member.role,
			fullName: member.fullName,
		};
		signIn(next);
		navigate({
			to: member.role === "contractor" ? "/my-jobs" : "/",
			replace: true,
		});
		return null;
	};

	return (
		<div className="mx-auto flex min-h-[80vh] w-full max-w-sm flex-col justify-center">
			<div className="mb-8 text-center">
				<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500 text-2xl font-bold text-slate-900">
					S
				</div>
				<h1 className="text-2xl font-semibold text-slate-900">
					{noTeamYet ? "Set up owner" : "Sign in"}
				</h1>
				<p className="mt-1 text-sm text-slate-500">S&amp;J Built</p>
			</div>

			{noTeamYet ? (
				<OwnerBootstrap
					onCreate={(draft) => {
						const owner: TeamMember = {
							id: randomId("m"),
							createdAt: Date.now(),
							fullName: draft.fullName,
							email: draft.email,
							role: "owner",
							inviteToken: randomId("tok"),
							acceptedAt: Date.now(),
						};
						setMembers([owner]);
						signIn({
							memberId: owner.id,
							role: "owner",
							fullName: owner.fullName,
						});
						navigate({ to: "/", replace: true });
					}}
				/>
			) : (
				<div className="space-y-4">
					<button
						type="button"
						onClick={() => setGoogleOpen(true)}
						className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
					>
						<GoogleG className="h-5 w-5" />
						Continue with Google
					</button>

					<div className="flex items-center gap-3 text-xs text-slate-400">
						<span className="h-px flex-1 bg-slate-200" />
						<span>or</span>
						<span className="h-px flex-1 bg-slate-200" />
					</div>

					{showEmailForm ? (
						<EmailSignIn
							onSubmit={(emailInput) => {
								const normalized = emailInput.trim().toLowerCase();
								const match = members.find((m) => m.email === normalized);
								if (!match) {
									return "We don't have that email on file. Ask an admin to send you a new invite.";
								}
								return completeSignIn(match);
							}}
						/>
					) : (
						<button
							type="button"
							onClick={() => setShowEmailForm(true)}
							className="flex h-11 w-full items-center justify-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
						>
							Use email instead
						</button>
					)}

					<p className="text-center text-xs text-slate-400">
						Demo: Google sign-in is faked. A real app would open Google's
						account picker here.
					</p>
				</div>
			)}

			{googleOpen && (
				<GoogleChooser
					members={members}
					onClose={() => setGoogleOpen(false)}
					onPick={(member) => {
						const err = completeSignIn(member);
						if (err) {
							window.alert(err);
						} else {
							setGoogleOpen(false);
						}
					}}
				/>
			)}
		</div>
	);
}

function OwnerBootstrap({
	onCreate,
}: {
	onCreate: (draft: { fullName: string; email: string }) => void;
}) {
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
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
		setError(null);
		onCreate({ fullName: trimmedName, email: trimmedEmail });
	};

	return (
		<>
			<p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
				First-run setup. Create the owner account to start inviting your team.
			</p>
			<form onSubmit={handleSubmit} className="space-y-4">
				<label className="block text-sm">
					<span className="mb-1 block font-medium text-slate-700">
						Full name
					</span>
					<input
						type="text"
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
						autoComplete="name"
						className="h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
					/>
				</label>
				<label className="block text-sm">
					<span className="mb-1 block font-medium text-slate-700">Email</span>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						autoComplete="email"
						inputMode="email"
						className="h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
					/>
				</label>
				{error && <p className="text-sm text-red-600">{error}</p>}
				<button
					type="submit"
					className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-amber-500 text-sm font-semibold text-slate-900 shadow-sm hover:bg-amber-400"
				>
					<Star className="h-5 w-5" />
					Create owner
				</button>
			</form>
		</>
	);
}

function EmailSignIn({
	onSubmit,
}: {
	onSubmit: (email: string) => string | null;
}) {
	const [email, setEmail] = useState("");
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isEmail(email.trim())) {
			setError("Enter a valid email address.");
			return;
		}
		const result = onSubmit(email);
		setError(result);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-3">
			<label className="block text-sm">
				<span className="mb-1 block font-medium text-slate-700">Email</span>
				<input
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					autoComplete="email"
					inputMode="email"
					className="h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
				/>
			</label>
			{error && <p className="text-sm text-red-600">{error}</p>}
			<button
				type="submit"
				className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-amber-500 text-sm font-semibold text-slate-900 shadow-sm hover:bg-amber-400"
			>
				<LogIn className="h-4 w-4" />
				Send sign-in link
			</button>
		</form>
	);
}

function GoogleChooser({
	members,
	onClose,
	onPick,
}: {
	members: TeamMember[];
	onClose: () => void;
	onPick: (member: TeamMember) => void;
}) {
	const eligible = members.filter((m) => m.acceptedAt !== null);
	return (
		<div
			className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
			role="dialog"
			aria-modal="true"
			aria-labelledby="google-chooser-title"
		>
			<button
				type="button"
				aria-label="Close"
				onClick={onClose}
				className="absolute inset-0 -z-10 cursor-default"
			/>
			<div className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-w-md sm:rounded-2xl">
				<div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
					<div>
						<div className="flex items-center gap-2">
							<GoogleG className="h-5 w-5" />
							<h2
								id="google-chooser-title"
								className="text-base font-medium text-slate-900"
							>
								Sign in with Google
							</h2>
						</div>
						<p className="mt-2 text-lg text-slate-800">Choose an account</p>
						<p className="text-sm text-slate-500">
							to continue to S&amp;J Built
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close"
						className="-m-2 flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto">
					{eligible.length === 0 ? (
						<p className="px-5 py-6 text-center text-sm text-slate-500">
							No accounts have accepted an invite on this device yet. Use the
							invite link an admin sent you first.
						</p>
					) : (
						<ul>
							{eligible.map((member) => (
								<li key={member.id}>
									<button
										type="button"
										onClick={() => onPick(member)}
										className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-slate-50"
									>
										<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
											{initials(member.fullName)}
										</span>
										<span className="min-w-0 flex-1">
											<span className="block truncate text-sm font-medium text-slate-900">
												{member.fullName}
											</span>
											<span className="block truncate text-xs text-slate-500">
												{member.email}
											</span>
										</span>
										<span className="shrink-0 text-xs text-slate-400">
											{ROLE_LABEL[member.role]}
										</span>
									</button>
								</li>
							))}
						</ul>
					)}
					<div className="border-t border-slate-200 px-5 py-4">
						<button
							type="button"
							disabled
							className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-400"
						>
							<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
								<span className="h-4 w-4 rounded-full border border-dashed border-slate-400" />
							</span>
							<span className="min-w-0 flex-1">
								<span className="block truncate">Use another account</span>
								<span className="block truncate text-xs text-slate-400">
									Demo: only invited accounts can sign in
								</span>
							</span>
						</button>
					</div>
				</div>

				<div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-center text-xs text-slate-500">
					This is a demo account chooser. A real app would call Google OAuth
					here.
				</div>
			</div>
		</div>
	);
}

function GoogleG({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 48 48"
			aria-hidden="true"
			className={className}
			focusable="false"
		>
			<title>Google</title>
			<path
				fill="#EA4335"
				d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
			/>
			<path
				fill="#4285F4"
				d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
			/>
			<path
				fill="#FBBC05"
				d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
			/>
			<path
				fill="#34A853"
				d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
			/>
		</svg>
	);
}
