import { SignInButton, UserButton } from "@clerk/tanstack-react-start";
import { SignedIn, SignedOut } from "./control";

export default function HeaderUser() {
	return (
		<>
			<SignedIn>
				<UserButton />
			</SignedIn>
			<SignedOut>
				<SignInButton mode="modal">
					<button
						type="button"
						className="inline-flex h-8 items-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 text-sm font-medium text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)]"
					>
						Sign in
					</button>
				</SignInButton>
			</SignedOut>
		</>
	);
}
