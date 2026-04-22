import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, HardHat, Plus, ShieldCheck, Star } from "lucide-react";
import { useState } from "react";
import {
	type TeamMemberDraft,
	TeamMemberForm,
} from "#/components/TeamMemberForm";
import {
	ROLE_LABEL,
	type Role,
	STORAGE_KEYS,
	type TeamMember,
} from "#/lib/types";
import { randomId, useLocalStorageState } from "#/lib/useLocalStorageState";

export const Route = createFileRoute("/team")({ component: Team });

function inviteUrl(token: string) {
	if (typeof window === "undefined") return `/invite/${token}`;
	return `${window.location.origin}/invite/${token}`;
}

function Team() {
	const [members, setMembers] = useLocalStorageState<TeamMember[]>(
		STORAGE_KEYS.teamMembers,
		[],
	);
	const [formOpen, setFormOpen] = useState(false);
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const handleCreate = (draft: TeamMemberDraft) => {
		const member: TeamMember = {
			...draft,
			id: randomId("m"),
			createdAt: Date.now(),
			inviteToken: randomId("tok"),
			acceptedAt: null,
		};
		setMembers((prev) => [member, ...prev]);
		setFormOpen(false);
	};

	const handleCopy = async (memberId: string, token: string) => {
		const url = inviteUrl(token);
		try {
			await navigator.clipboard.writeText(url);
			setCopiedId(memberId);
			window.setTimeout(() => {
				setCopiedId((curr) => (curr === memberId ? null : curr));
			}, 1500);
		} catch {
			window.prompt("Copy the invite link:", url);
		}
	};

	const existingEmails = members.map((m) => m.email);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-2xl font-semibold sm:text-3xl">Team Members</h1>
				<button
					type="button"
					onClick={() => setFormOpen(true)}
					className="inline-flex h-11 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-amber-400"
				>
					<Plus className="h-5 w-5" />
					Invite
				</button>
			</div>

			<p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
				Demo: invites live in this browser's localStorage — no email is actually
				sent. Copy the link and share it however (text, Telegram, etc.).
			</p>

			{members.length === 0 ? (
				<div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
					<p className="text-slate-500">No team members yet.</p>
					<p className="mt-2 text-sm text-slate-400">
						Tap "+ Invite" to add someone.
					</p>
				</div>
			) : (
				<ul className="space-y-3">
					{members.map((member) => (
						<li
							key={member.id}
							className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
						>
							<div className="flex flex-wrap items-start justify-between gap-2">
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										<RoleBadgeIcon role={member.role} />
										<p className="truncate font-semibold text-slate-900">
											{member.fullName}
										</p>
									</div>
									<p className="mt-0.5 truncate text-sm text-slate-600">
										{member.email}
									</p>
									<div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
										<span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
											{ROLE_LABEL[member.role]}
										</span>
										<span
											className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
												member.acceptedAt
													? "bg-emerald-100 text-emerald-800"
													: "bg-slate-200 text-slate-700"
											}`}
										>
											{member.acceptedAt ? "Active" : "Pending"}
										</span>
									</div>
								</div>
							</div>

							{member.role !== "owner" && (
								<div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
									<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
										Invite link
									</p>
									<p className="mt-1 break-all font-mono text-xs text-slate-700">
										{inviteUrl(member.inviteToken)}
									</p>
									<button
										type="button"
										onClick={() => handleCopy(member.id, member.inviteToken)}
										className="mt-2 inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
									>
										{copiedId === member.id ? (
											<>
												<Check className="h-4 w-4 text-emerald-600" />
												Copied
											</>
										) : (
											<>
												<Copy className="h-4 w-4" />
												Copy link
											</>
										)}
									</button>
								</div>
							)}
						</li>
					))}
				</ul>
			)}

			{formOpen && (
				<TeamMemberForm
					existingEmails={existingEmails}
					onClose={() => setFormOpen(false)}
					onSubmit={handleCreate}
				/>
			)}
		</div>
	);
}

function RoleBadgeIcon({ role }: { role: Role }) {
	switch (role) {
		case "owner":
			return <Star className="h-5 w-5 shrink-0 text-amber-500" />;
		case "member":
			return <ShieldCheck className="h-5 w-5 shrink-0 text-amber-500" />;
		case "contractor":
			return <HardHat className="h-5 w-5 shrink-0 text-amber-500" />;
	}
}
