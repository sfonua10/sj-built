import { ConvexError } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export type Role = Doc<"users">["role"];

type AuthCtx = QueryCtx | MutationCtx;

export async function getCurrentUser(
	ctx: AuthCtx,
): Promise<Doc<"users"> | null> {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) return null;
	return await ctx.db
		.query("users")
		.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
		.unique();
}

export async function requireUser(ctx: AuthCtx): Promise<Doc<"users">> {
	const user = await getCurrentUser(ctx);
	if (!user) {
		throw new ConvexError({
			code: "NOT_AUTHENTICATED",
			message: "Sign in required.",
		});
	}
	if (!user.active) {
		throw new ConvexError({
			code: "INACTIVE",
			message: "This account has been deactivated.",
		});
	}
	return user;
}

export async function requireRole(
	ctx: AuthCtx,
	...roles: Role[]
): Promise<Doc<"users">> {
	const user = await requireUser(ctx);
	if (!roles.includes(user.role)) {
		throw new ConvexError({
			code: "FORBIDDEN",
			message: `Requires role: ${roles.join(" or ")}.`,
		});
	}
	return user;
}

export function getAdminBootstrapEmails(): string[] {
	return (process.env.ADMIN_EMAILS ?? "")
		.split(",")
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
}
