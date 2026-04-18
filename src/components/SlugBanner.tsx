import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

type SlugBannerProps = {
	kicker?: string;
	title: string;
	meta?: ReactNode;
	actions?: ReactNode;
	className?: string;
	tone?: "ink" | "amber";
};

export default function SlugBanner({
	kicker,
	title,
	meta,
	actions,
	className,
	tone = "ink",
}: SlugBannerProps) {
	return (
		<section
			className={cn(
				"slug-banner",
				tone === "amber" && "!bg-amber !text-ink !border-b-ink",
				className,
			)}
		>
			<div className="page-wrap flex flex-wrap items-end justify-between gap-4">
				<div className="min-w-0">
					{kicker ? (
						<span className="slug-banner__kicker">{kicker}</span>
					) : null}
					<h1 className="slug-banner__title">{title}</h1>
					{meta ? <div className="slug-banner__meta">{meta}</div> : null}
				</div>
				{actions ? (
					<div className="flex shrink-0 flex-wrap items-center gap-2">
						{actions}
					</div>
				) : null}
			</div>
		</section>
	);
}
