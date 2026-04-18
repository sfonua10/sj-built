import LogoMark from "./LogoMark";

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="mt-20 border-t-2 border-ink bg-paper-raised text-stone-600">
			<div className="page-wrap flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center">
				<div className="flex items-center gap-3">
					<LogoMark variant="mark" className="size-8 text-ink" />
					<div className="font-mono text-xs tracking-[0.16em] uppercase">
						<div className="font-semibold text-ink">S&amp;J Built</div>
						<div>Pickup outfitting ops · © {year}</div>
					</div>
				</div>
				<div className="font-mono text-[0.68rem] tracking-[0.2em] uppercase text-stone-600">
					Invite-only · Internal tooling
				</div>
			</div>
		</footer>
	);
}
