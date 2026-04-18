import { Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";

export default function ContractorBottomNav() {
	return (
		<nav
			className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-amber bg-ink text-stone-100 md:hidden"
			style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
			aria-label="Contractor navigation"
		>
			<Link
				to="/contractor"
				activeOptions={{ exact: true }}
				className="flex w-full items-center justify-center gap-3 py-4 font-display text-sm tracking-[0.2em] uppercase text-stone-100 transition-colors hover:text-amber [&.active]:text-amber"
				activeProps={{ className: "active" }}
			>
				<ClipboardList className="size-5" aria-hidden />
				<span>Today · All Jobs</span>
			</Link>
		</nav>
	);
}
