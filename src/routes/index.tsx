import { SignInButton } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import LogoMark from "#/components/LogoMark";
import { Button } from "#/components/ui/button";
import { SignedIn, SignedOut } from "#/integrations/clerk/control";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
	return (
		<div className="flex flex-col">
			<section className="relative flex min-h-[60vh] items-center justify-center bg-ink px-6 py-16 text-paper overflow-hidden">
				<div className="hazard-stripes absolute inset-x-0 bottom-0 h-2 opacity-90" />
				<div className="page-wrap relative rise-in">
					<div className="flex flex-col items-center gap-8 text-center">
						<LogoMark variant="full" className="w-[min(22rem,80vw)] h-auto" />
						<p className="font-display text-xl tracking-[0.24em] text-amber uppercase sm:text-2xl">
							Outfit · Build · Ship it
						</p>
					</div>
				</div>
			</section>
			<section className="bg-paper px-6 py-16 sm:py-20">
				<div className="page-wrap">
					<div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
						<div>
							<p className="kicker mb-4 text-amber-deep">Internal ops</p>
							<h1 className="font-display text-4xl uppercase leading-[0.95] tracking-[0.02em] text-ink sm:text-6xl">
								Coordinate every truck,
								<br />
								every install.
							</h1>
							<p className="mt-5 max-w-xl text-base text-stone-600 sm:text-lg">
								Submit work orders with a VIN. Track installs through the shop.
								Sign off with photo proof. Built for the S&amp;J crew on the
								lot, in the bay, and in the field.
							</p>
							<div className="mt-8 flex flex-wrap gap-3">
								<SignedIn>
									<Button asChild size="hero">
										<Link to="/dashboard">
											Open dashboard
											<ArrowRight className="size-4" />
										</Link>
									</Button>
								</SignedIn>
								<SignedOut>
									<SignInButton mode="modal">
										<Button size="hero">
											Sign in
											<ArrowRight className="size-4" />
										</Button>
									</SignInButton>
								</SignedOut>
							</div>
							<p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-stone-600">
								Invite-only · Ask an admin
							</p>
						</div>
						<ul className="grid gap-4 font-mono text-sm text-ink">
							<LandingTile
								code="01"
								label="Customer"
								copy="Drop a VIN, pick a template, submit. Watch the shop do its thing."
							/>
							<LandingTile
								code="02"
								label="Admin"
								copy="Queue, assign, review. Kick items back when the photo doesn't tell the story."
							/>
							<LandingTile
								code="03"
								label="Contractor"
								copy="Today's jobs, one tap per item. Shoot the photo, move on."
							/>
						</ul>
					</div>
				</div>
			</section>
		</div>
	);
}

function LandingTile({
	code,
	label,
	copy,
}: {
	code: string;
	label: string;
	copy: string;
}) {
	return (
		<li className="shop-card flex items-start gap-4 px-5 py-4">
			<span className="font-display text-3xl leading-none text-amber whitespace-nowrap shrink-0">
				{code}
			</span>
			<div className="space-y-1">
				<p className="font-display text-sm uppercase tracking-[0.12em] text-ink">
					{label}
				</p>
				<p className="text-xs normal-case tracking-normal text-stone-600">
					{copy}
				</p>
			</div>
		</li>
	);
}
