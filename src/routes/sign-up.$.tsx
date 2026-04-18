import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import LogoMark from "#/components/LogoMark";

export const Route = createFileRoute("/sign-up/$")({
	component: SignUpPage,
});

function SignUpPage() {
	return (
		<div className="grid min-h-[calc(100vh-7rem)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
			<aside className="relative flex flex-col justify-between bg-ink px-6 py-10 text-paper md:px-12 md:py-16">
				<div className="hazard-stripes absolute inset-x-0 bottom-0 h-2 opacity-90" />
				<div className="flex items-center gap-3">
					<LogoMark variant="mark" className="size-10" />
					<span className="font-display text-sm uppercase tracking-[0.2em] text-paper">
						S&amp;J Built
					</span>
				</div>
				<div className="space-y-4">
					<p className="kicker text-amber">Invite-only</p>
					<h1 className="font-display text-4xl uppercase leading-[0.95] tracking-[0.02em] md:text-6xl">
						Finish your
						<br />
						onboarding
					</h1>
					<p className="max-w-sm text-sm text-paper/70">
						If an admin invited you, complete your account setup here. Otherwise
						ask the team to send an invite.
					</p>
				</div>
				<p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/60">
					Self sign-up is disabled
				</p>
			</aside>
			<section className="flex items-center justify-center bg-paper px-6 py-12 md:px-12 md:py-16">
				<div className="w-full max-w-md">
					<p className="kicker mb-3 text-amber-deep">Set up</p>
					<h2 className="mb-8 font-display text-3xl uppercase tracking-[0.02em] text-ink">
						Accept invite
					</h2>
					<SignUp
						routing="path"
						path="/sign-up"
						signInUrl="/sign-in"
						fallbackRedirectUrl="/dashboard"
					/>
				</div>
			</section>
		</div>
	);
}
