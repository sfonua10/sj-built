import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Scripts,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect } from "react";
import { Sidebar } from "#/components/Sidebar";
import { useCurrentUser } from "#/lib/useCurrentUser";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "S&J Built" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	shellComponent: RootDocument,
});

function isPublicPath(path: string) {
	return path === "/login" || path.startsWith("/invite/");
}

function isContractorAllowed(path: string) {
	return path === "/my-jobs" || isPublicPath(path);
}

function AuthShell({ children }: { children: React.ReactNode }) {
	const { user, hydrated } = useCurrentUser();
	const { location } = useRouterState();
	const navigate = useNavigate();
	const path = location.pathname;
	const publicPath = isPublicPath(path);

	useEffect(() => {
		if (!hydrated) return;
		if (!user && !publicPath) {
			navigate({ to: "/login", replace: true });
			return;
		}
		if (user?.role === "contractor" && !isContractorAllowed(path)) {
			navigate({ to: "/my-jobs", replace: true });
		}
	}, [hydrated, user, path, publicPath, navigate]);

	if (!hydrated) {
		return <main className="p-4 sm:p-6 md:p-8" aria-busy="true" />;
	}

	if (!user && !publicPath) {
		return <main className="p-4 sm:p-6 md:p-8" aria-busy="true" />;
	}

	if (user?.role === "contractor" && !isContractorAllowed(path)) {
		return <main className="p-4 sm:p-6 md:p-8" aria-busy="true" />;
	}

	if (publicPath) {
		return <main className="p-4 sm:p-6 md:p-8">{children}</main>;
	}

	return (
		<div className="min-h-screen md:pl-64">
			<Sidebar />
			<main className="p-4 sm:p-6 md:p-8">{children}</main>
		</div>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="bg-slate-50 text-slate-900">
				<AuthShell>{children}</AuthShell>
				<TanStackDevtools
					config={{ position: "bottom-right" }}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
