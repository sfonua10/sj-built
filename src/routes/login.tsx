import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogIn, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { STORAGE_KEYS, type TeamMember } from "#/lib/types";
import { useCurrentUser } from "#/lib/useCurrentUser";
import { randomId, useLocalStorageState } from "#/lib/useLocalStorageState";

export const Route = createFileRoute("/login")({ component: Login });

function isEmail(value: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function Login() {
	const navigate = useNavigate();
	const { user, hydrated, signIn } = useCurrentUser();
	const [members, setMembers, membersHydrated] = useLocalStorageState<
		TeamMember[]
	>(STORAGE_KEYS.teamMembers, []);

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
				<EmailSignIn
					onSubmit={(emailInput) => {
						const normalized = emailInput.trim().toLowerCase();
						const match = members.find((m) => m.email === normalized);
						if (!match) {
							return "We don't have that email on file. Ask an admin to send you a new invite.";
						}
						if (!match.acceptedAt) {
							return "That invite hasn't been accepted yet. Use the invite link from your email first.";
						}
						signIn({
							memberId: match.id,
							role: match.role,
							fullName: match.fullName,
						});
						navigate({
							to: match.role === "contractor" ? "/my-jobs" : "/",
							replace: true,
						});
						return null;
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
		<>
			<p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
				Demo sign-in: enter the email an admin added you under. In production
				this would send a magic-link email.
			</p>
			<form onSubmit={handleSubmit} className="space-y-4">
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
					<LogIn className="h-5 w-5" />
					Sign in
				</button>
			</form>
		</>
	);
}
