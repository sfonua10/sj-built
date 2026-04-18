import { cn } from "#/lib/utils";

type ProgressCellsProps = {
	done: number;
	total: number;
	tone?: "amber" | "timber";
	showCaption?: boolean;
	className?: string;
};

export default function ProgressCells({
	done,
	total,
	tone = "amber",
	showCaption = true,
	className,
}: ProgressCellsProps) {
	const clampedTotal = Math.max(total, 1);
	const clampedDone = Math.min(Math.max(done, 0), clampedTotal);

	return (
		<div className={cn("flex items-center gap-3", className)}>
			<div
				className="progress-cells flex-1"
				role="progressbar"
				aria-valuemin={0}
				aria-valuemax={clampedTotal}
				aria-valuenow={clampedDone}
			>
				{Array.from({ length: clampedTotal }, (_, i) => (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: positional cells; order never changes
						key={i}
						className={cn(
							"progress-cell",
							i < clampedDone && `progress-cell--filled-${tone}`,
						)}
					/>
				))}
			</div>
			{showCaption ? (
				<span className="font-mono text-xs font-semibold tabular-nums tracking-wider text-ink">
					{clampedDone}/{clampedTotal}
				</span>
			) : null}
		</div>
	);
}
