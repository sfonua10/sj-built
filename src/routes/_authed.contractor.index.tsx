import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ArrowRight } from "lucide-react";
import SlugBanner from "#/components/SlugBanner";
import StatusStamp from "#/components/StatusStamp";
import { Skeleton } from "#/components/ui/skeleton";
import VinPlate from "#/components/VinPlate";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/_authed/contractor/")({
	component: ContractorHome,
});

function ContractorHome() {
	const jobs = useQuery(api.workOrders.listForMe, {});
	const today = new Date();
	const kicker = today
		.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
		})
		.toUpperCase();

	const activeJobs = jobs?.filter((j) => j.status !== "complete") ?? [];
	const metaLabel = jobs
		? `${activeJobs.length} ${activeJobs.length === 1 ? "job" : "jobs"} assigned`
		: undefined;

	return (
		<>
			<SlugBanner kicker={kicker} title="Today" meta={metaLabel} />
			<main className="page-wrap space-y-4 px-4 py-6 sm:px-6 sm:py-8">
				{jobs === undefined ? (
					<Skeleton className="h-24 w-full" />
				) : jobs.length === 0 ? (
					<EmptyJobs />
				) : (
					<ul className="space-y-3">
						{jobs.map((job) => (
							<li key={job._id}>
								<Link
									to="/contractor/jobs/$orderId"
									params={{ orderId: job._id }}
									className="group block no-underline"
								>
									<article className="shop-card relative flex min-h-24 items-start gap-4 border-l-[6px] border-l-amber p-4 transition-colors hover:bg-stone-100">
										<div className="flex-1 min-w-0 space-y-2">
											<VinPlate vin={job.vin} size="sm" />
											<p className="font-display text-lg uppercase leading-tight tracking-[0.04em] text-ink">
												{job.title ?? job.truckDescription ?? "Work order"}
											</p>
											{job.truckDescription && job.title ? (
												<p className="text-xs text-stone-600">
													{job.truckDescription}
												</p>
											) : null}
										</div>
										<div className="flex flex-col items-end gap-2">
											<StatusStamp status={job.status} size="sm" />
											<ArrowRight className="size-5 text-ink transition-transform group-hover:translate-x-1 group-active:translate-x-1" />
										</div>
									</article>
								</Link>
							</li>
						))}
					</ul>
				)}
			</main>
		</>
	);
}

function EmptyJobs() {
	return (
		<div className="relative border-2 border-ink bg-paper-raised">
			<div className="hazard-stripes absolute inset-x-0 top-0 h-3" />
			<div className="hazard-stripes absolute inset-x-0 bottom-0 h-3" />
			<div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
				<p className="font-display text-2xl uppercase tracking-[0.06em] text-ink sm:text-3xl">
					No jobs assigned
				</p>
				<p className="font-mono text-xs uppercase tracking-[0.2em] text-stone-600">
					Check back soon
				</p>
			</div>
		</div>
	);
}
