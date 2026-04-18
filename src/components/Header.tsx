import { Link } from "@tanstack/react-router";
import { SignedIn } from "../integrations/clerk/control";
import ClerkHeader from "../integrations/clerk/header-user.tsx";
import LogoMark from "./LogoMark";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 border-b-2 border-amber bg-ink text-stone-100">
			<div className="page-wrap flex items-center justify-between gap-3 py-3">
				<Link
					to="/"
					className="flex items-center gap-3 text-stone-100 hover:text-amber"
				>
					<LogoMark variant="mark" className="size-9 text-stone-100" />
					<LogoMark
						variant="wordmark"
						className="hidden tracking-[0.12em] sm:inline-block"
					/>
				</Link>

				<div className="flex items-center gap-1">
					<SignedIn>
						<Link
							to="/dashboard"
							className="hidden px-3 py-2 font-display text-sm tracking-[0.18em] text-stone-200 uppercase transition-colors hover:text-amber [&.active]:text-amber [&.active]:border-b-2 [&.active]:border-amber sm:inline-block"
							activeProps={{ className: "active" }}
						>
							Dashboard
						</Link>
					</SignedIn>
					<ThemeToggle />
					<ClerkHeader />
				</div>
			</div>
		</header>
	);
}
