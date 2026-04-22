import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { STORAGE_KEYS, type TeamMember } from "#/lib/types";
import { useCurrentUser } from "#/lib/useCurrentUser";
import { useLocalStorageState } from "#/lib/useLocalStorageState";

export const Route = createFileRoute("/invite/$token")({ component: Invite });

function Invite() {
	const { token } = Route.useParams();
	const navigate = useNavigate();
	const { hydrated, signIn } = useCurrentUser();
	const [members, setMembers, membersHydrated] = useLocalStorageState<
		TeamMember[]
	>(STORAGE_KEYS.teamMembers, []);
	const [status, setStatus] = useState<"loading" | "accepting" | "invalid">(
		"loading",
	);

	useEffect(() => {
		if (!hydrated || !membersHydrated) return;
		const match = members.find((m) => m.inviteToken === token);
		if (!match) {
			setStatus("invalid");
			return;
		}
		setStatus("accepting");
		if (!match.acceptedAt) {
			setMembers((prev) =>
				prev.map((m) =>
					m.id === match.id ? { ...m, acceptedAt: Date.now() } : m,
				),
			);
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
	}, [hydrated, membersHydrated, members, token, setMembers, signIn, navigate]);

	return (
		<div className="mx-auto flex min-h-[80vh] w-full max-w-sm flex-col items-center justify-center text-center">
			{status === "invalid" ? (
				<>
					<h1 className="text-xl font-semibold text-slate-900">
						Invite not found
					</h1>
					<p className="mt-2 text-sm text-slate-500">
						This link may have been removed or is from a different browser. Ask
						an admin to send you a fresh invite.
					</p>
				</>
			) : (
				<>
					<div className="h-10 w-10 animate-pulse rounded-full bg-amber-500" />
					<p className="mt-4 text-sm text-slate-500">Signing you in…</p>
				</>
			)}
		</div>
	);
}
