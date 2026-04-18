import { cn } from "#/lib/utils";

type LogoMarkProps = {
	variant?: "mark" | "full" | "wordmark";
	className?: string;
	title?: string;
};

export default function LogoMark({
	variant = "mark",
	className,
	title = "S&J Built",
}: LogoMarkProps) {
	if (variant === "mark") {
		return (
			<svg
				className={cn("logo-mark", className)}
				viewBox="0 0 80 60"
				role="img"
				aria-label={title}
				xmlns="http://www.w3.org/2000/svg"
			>
				<rect
					x="3"
					y="3"
					width="74"
					height="54"
					fill="none"
					stroke="currentColor"
					strokeWidth="5"
				/>
				<text
					x="40"
					y="30"
					textAnchor="middle"
					dominantBaseline="central"
					fontFamily="Anton, Impact, sans-serif"
					fontSize="32"
					fill="currentColor"
					letterSpacing="0.5"
				>
					S&amp;J
				</text>
			</svg>
		);
	}

	if (variant === "wordmark") {
		return (
			<span
				className={cn("font-display text-[1.05rem] leading-none", className)}
				title={title}
			>
				S&amp;J BUILT
			</span>
		);
	}

	return (
		<img
			src="/sj-built-logo.png"
			alt={title}
			className={cn("select-none", className)}
			draggable={false}
		/>
	);
}
