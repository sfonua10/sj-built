import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

type StatCardTone = "amber" | "torch" | "timber" | "flare" | "stone";

type StatCardProps = {
	label: string;
	value: ReactNode;
	tone?: StatCardTone;
	href?: string;
	hrefLabel?: string;
	className?: string;
};

export default function StatCard({
	label,
	value,
	tone = "stone",
	href,
	hrefLabel = "Open",
	className,
}: StatCardProps) {
	return (
		<div
			className={cn("shop-card flex flex-col gap-2 p-5", className)}
			data-accent={tone === "stone" ? undefined : tone}
		>
			<p className="kicker">{label}</p>
			<p className="font-mono text-5xl font-semibold tabular-nums leading-none text-ink">
				{value}
			</p>
			{href ? (
				<Link
					to={href}
					className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink hover:text-amber-deep"
				>
					{hrefLabel} →
				</Link>
			) : null}
		</div>
	);
}
