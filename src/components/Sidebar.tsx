import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
	Bell,
	ClipboardList,
	HardHat,
	LayoutDashboard,
	LogOut,
	Menu,
	ShieldCheck,
	Users,
	X,
} from "lucide-react";
import { useState } from "react";
import { useCurrentUser } from "#/lib/useCurrentUser";

const adminNav = [
	{ to: "/", label: "Dashboard", icon: LayoutDashboard },
	{ to: "/work-orders", label: "Work Orders", icon: ClipboardList },
	{ to: "/contractors", label: "Contractors", icon: Users },
] as const;

const contractorNav = [
	{ to: "/my-jobs", label: "My Jobs", icon: ClipboardList },
] as const;

export function Sidebar() {
	const [open, setOpen] = useState(false);
	const { location } = useRouterState();
	const currentPath = location.pathname;
	const { user, signOut } = useCurrentUser();
	const navigate = useNavigate();

	const navItems = user?.role === "contractor" ? contractorNav : adminNav;

	const handleSignOut = () => {
		signOut();
		setOpen(false);
		navigate({ to: "/login", replace: true });
	};

	return (
		<>
			<header className="flex items-center justify-between bg-slate-900 px-4 py-3 md:hidden">
				<button
					type="button"
					onClick={() => setOpen(true)}
					aria-label="Open navigation"
					className="-m-2 p-2 text-white"
				>
					<Menu className="h-6 w-6" />
				</button>
				<span className="font-bold tracking-wide text-white">
					S&amp;J BUILT
				</span>
				<button
					type="button"
					aria-label="Notifications"
					className="-m-2 p-2 text-white"
				>
					<Bell className="h-6 w-6" />
				</button>
			</header>

			{open && (
				<button
					type="button"
					aria-label="Close navigation"
					onClick={() => setOpen(false)}
					className="fixed inset-0 z-40 bg-black/50 md:hidden"
				/>
			)}

			<aside
				className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform md:translate-x-0 ${
					open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
				}`}
			>
				<div className="flex items-center justify-between px-6 py-5">
					<div className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded bg-amber-500 font-bold text-slate-900">
							S
						</div>
						<span className="font-bold tracking-wide">S&amp;J BUILT</span>
					</div>
					<button
						type="button"
						onClick={() => setOpen(false)}
						aria-label="Close navigation"
						className="-m-2 p-2 md:hidden"
					>
						<X className="h-6 w-6" />
					</button>
				</div>
				<nav className="flex-1 space-y-1 px-3 py-4">
					{navItems.map((item) => {
						const Icon = item.icon;
						const active =
							item.to === "/"
								? currentPath === "/"
								: currentPath.startsWith(item.to);
						return (
							<Link
								key={item.to}
								to={item.to}
								onClick={() => setOpen(false)}
								className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
									active
										? "bg-amber-500/20 text-amber-400"
										: "text-slate-300 hover:bg-slate-800 hover:text-white"
								}`}
							>
								<Icon className="h-5 w-5" />
								{item.label}
							</Link>
						);
					})}
				</nav>

				{user && (
					<div className="border-t border-slate-800 p-3">
						<div className="flex items-center gap-2 px-2 py-2 text-sm">
							{user.role === "admin" ? (
								<ShieldCheck className="h-5 w-5 shrink-0 text-amber-400" />
							) : (
								<HardHat className="h-5 w-5 shrink-0 text-amber-400" />
							)}
							<div className="min-w-0">
								<p className="truncate font-medium">{user.fullName}</p>
								<p className="text-xs capitalize text-slate-400">{user.role}</p>
							</div>
						</div>
						<button
							type="button"
							onClick={handleSignOut}
							className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
						>
							<LogOut className="h-5 w-5" />
							Sign out
						</button>
					</div>
				)}
			</aside>
		</>
	);
}
