import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle, ClipboardList, Clock, Plus } from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-2xl font-semibold sm:text-3xl">Dashboard</h1>
				<Link
					to="/work-orders"
					search={{ new: 1 }}
					className="inline-flex h-11 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-amber-400"
				>
					<Plus className="h-5 w-5" />
					Work Order
				</Link>
			</div>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Card
					icon={<ClipboardList className="h-5 w-5 text-amber-500" />}
					title="My Work Orders"
					body="No work orders yet. Create one from the Work Orders page."
				/>
				<Card
					icon={<Clock className="h-5 w-5 text-amber-500" />}
					title="Recent Activity"
					body="Nothing recent to show."
				/>
				<Card
					icon={<CheckCircle className="h-5 w-5 text-amber-500" />}
					title="Upcoming"
					body="No upcoming jobs on the schedule."
				/>
			</div>
		</div>
	);
}

function Card({
	icon,
	title,
	body,
}: {
	icon: React.ReactNode;
	title: string;
	body: string;
}) {
	return (
		<div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
			<div className="mb-3 flex items-center gap-2">
				{icon}
				<h2 className="font-semibold text-slate-900">{title}</h2>
			</div>
			<p className="text-sm text-slate-500">{body}</p>
		</div>
	);
}
