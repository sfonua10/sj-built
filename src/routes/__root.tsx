import { auth } from "@clerk/tanstack-react-start/server";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Toaster } from "../components/ui/sonner";
import ClerkProvider from "../integrations/clerk/provider";
import ConvexProvider from "../integrations/convex/provider";
import PostHogProvider from "../integrations/posthog/provider";
import appCss from "../styles.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export type RouterContext = {
	userId: string | null;
};

const fetchClerkAuth = createServerFn({ method: "GET" }).handler(async () => {
	const { userId } = await auth();
	return { userId: userId ?? null };
});

export const Route = createRootRouteWithContext<RouterContext>()({
	beforeLoad: async () => {
		const { userId } = await fetchClerkAuth();
		return { userId };
	},
	head: () => {
		const title = "S&J Built Ops";
		const description =
			"Ops for pickup outfitting — organize work orders, checklists, and photo sign-offs between admins, customers, and contractors.";
		const ogImage = "/og.png";
		return {
			meta: [
				{ charSet: "utf-8" },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ title },
				{ name: "description", content: description },
				{ name: "theme-color", content: "#f59e0b" },
				{ property: "og:type", content: "website" },
				{ property: "og:site_name", content: "S&J Built" },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:image", content: ogImage },
				{ property: "og:image:width", content: "1200" },
				{ property: "og:image:height", content: "630" },
				{
					property: "og:image:alt",
					content: "S&J Built — Ops for pickup outfitting",
				},
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
				{ name: "twitter:image", content: ogImage },
			],
			links: [
				{ rel: "stylesheet", href: appCss },
				{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
				{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
				{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
				{ rel: "manifest", href: "/manifest.json" },
			],
		};
	},
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: inline theme init script must run before hydration
					dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
				/>
				<HeadContent />
			</head>
			<body className="min-h-screen flex flex-col font-sans antialiased [overflow-wrap:anywhere] selection:bg-amber/40 pb-[env(safe-area-inset-bottom)]">
				<ClerkProvider>
					<ConvexProvider>
						<PostHogProvider>
							<Header />
							<main className="flex-1">{children}</main>
							<Footer />
							<Toaster position="top-right" richColors />
							<TanStackDevtools
								config={{ position: "bottom-right" }}
								plugins={[
									{
										name: "Tanstack Router",
										render: <TanStackRouterDevtoolsPanel />,
									},
								]}
							/>
						</PostHogProvider>
					</ConvexProvider>
				</ClerkProvider>
				<Scripts />
			</body>
		</html>
	);
}
