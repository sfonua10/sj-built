import { Link } from "@tanstack/react-router";

const links = [
	{ to: "/admin", label: "Overview", exact: true },
	{ to: "/admin/orders", label: "Work orders", exact: false },
	{ to: "/admin/users", label: "Users", exact: false },
	{ to: "/admin/organizations", label: "Organizations", exact: false },
	{ to: "/admin/templates", label: "Templates", exact: false },
] as const;

export default function AdminNav() {
	return (
		<nav className="border-b border-stone-300 bg-paper-raised">
			<div className="page-wrap flex gap-1 overflow-x-auto">
				{links.map((link) => (
					<Link
						key={link.to}
						to={link.to}
						activeOptions={{ exact: link.exact }}
						className="whitespace-nowrap border-b-[3px] border-transparent px-4 py-3 font-display text-sm tracking-[0.16em] text-stone-600 uppercase transition-colors hover:text-ink [&.active]:border-amber [&.active]:text-ink"
						activeProps={{ className: "active" }}
					>
						{link.label}
					</Link>
				))}
			</div>
		</nav>
	);
}
