import { SignOutButton } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import StatusStamp from "#/components/StatusStamp";
import { Button } from "#/components/ui/button";

export const Route = createFileRoute("/no-access")({
	component: NoAccessPage,
});

function NoAccessPage() {
	return (
		<main className="page-wrap flex min-h-[70vh] flex-col items-center justify-center gap-8 py-16 text-center">
			<div className="relative w-full max-w-xl">
				<div className="hazard-stripes absolute inset-x-0 top-0 h-3" />
				<div className="hazard-stripes absolute inset-x-0 bottom-0 h-3" />
				<div className="border-2 border-ink bg-paper-raised px-6 py-10 sm:px-10 sm:py-14">
					<p className="kicker mb-4 text-amber-deep">Halt</p>
					<div className="flex justify-center">
						<StatusStamp
							tone="flare"
							label="Access not provisioned"
							size="xl"
							className="rotate-[-2deg]"
						/>
					</div>
					<h1 className="mt-8 font-display text-3xl uppercase leading-[0.95] tracking-[0.02em] text-ink sm:text-4xl">
						This account isn't on the list
					</h1>
					<p className="mx-auto mt-5 max-w-md text-sm text-stone-600">
						S&amp;J Built is invite-only. Ask an admin to send an invitation
						tied to your role and organization, then sign back in.
					</p>
					<div className="mt-8 flex justify-center">
						<SignOutButton>
							<Button variant="outline">Sign out</Button>
						</SignOutButton>
					</div>
				</div>
			</div>
		</main>
	);
}
