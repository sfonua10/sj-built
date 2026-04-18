import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
	action,
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "./_generated/server";
import { getAdminBootstrapEmails, requireRole } from "./lib/auth";

const roleValidator = v.union(
	v.literal("admin"),
	v.literal("customer"),
	v.literal("contractor"),
);

export const me = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;
		return await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.unique();
	},
});

export const ensureUser = mutation({
	args: {},
	returns: v.object({
		status: v.union(
			v.literal("provisioned"),
			v.literal("no_access"),
			v.literal("not_authenticated"),
		),
		role: v.optional(roleValidator),
		userId: v.optional(v.id("users")),
	}),
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return { status: "not_authenticated" as const };

		const email = identity.email?.toLowerCase();

		const byClerkId = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
			.unique();
		if (byClerkId) {
			return {
				status: "provisioned" as const,
				role: byClerkId.role,
				userId: byClerkId._id,
			};
		}

		if (email) {
			const byEmail = await ctx.db
				.query("users")
				.withIndex("by_email", (q) => q.eq("email", email))
				.unique();
			if (byEmail && byEmail.clerkId === null) {
				await ctx.db.patch(byEmail._id, {
					clerkId: identity.subject,
					name: byEmail.name || identity.name || email,
				});
				return {
					status: "provisioned" as const,
					role: byEmail.role,
					userId: byEmail._id,
				};
			}
			if (byEmail) {
				return { status: "no_access" as const };
			}
		}

		const adminEmails = getAdminBootstrapEmails();
		if (email && adminEmails.includes(email)) {
			const newId = await ctx.db.insert("users", {
				clerkId: identity.subject,
				email,
				name: identity.name ?? email,
				role: "admin",
				active: true,
			});
			return {
				status: "provisioned" as const,
				role: "admin" as const,
				userId: newId,
			};
		}

		return { status: "no_access" as const };
	},
});

export const listUsers = query({
	args: {
		role: v.optional(roleValidator),
	},
	handler: async (ctx, { role }) => {
		await requireRole(ctx, "admin");
		const rows = role
			? await ctx.db
					.query("users")
					.withIndex("by_role", (q) => q.eq("role", role))
					.collect()
			: await ctx.db.query("users").collect();
		return rows.sort((a, b) => a.name.localeCompare(b.name));
	},
});

export const adminUpdateUser = mutation({
	args: {
		userId: v.id("users"),
		name: v.optional(v.string()),
		phone: v.optional(v.string()),
		organizationId: v.optional(v.union(v.id("organizations"), v.null())),
	},
	handler: async (ctx, { userId, name, phone, organizationId }) => {
		await requireRole(ctx, "admin");
		const patch: Partial<Doc<"users">> = {};
		if (name !== undefined) patch.name = name;
		if (phone !== undefined) patch.phone = phone;
		if (organizationId !== undefined) {
			patch.organizationId = organizationId ?? undefined;
		}
		await ctx.db.patch(userId, patch);
	},
});

export const adminSetUserActive = mutation({
	args: { userId: v.id("users"), active: v.boolean() },
	handler: async (ctx, { userId, active }) => {
		const caller = await requireRole(ctx, "admin");
		if (caller._id === userId && !active) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "You cannot deactivate your own admin account.",
			});
		}
		await ctx.db.patch(userId, { active });
	},
});

export const currentAdmin = internalQuery({
	args: {},
	handler: async (ctx): Promise<Doc<"users">> => {
		return await requireRole(ctx, "admin");
	},
});

export const insertInvitedUser = internalMutation({
	args: {
		email: v.string(),
		name: v.string(),
		role: roleValidator,
		organizationId: v.optional(v.id("organizations")),
		phone: v.optional(v.string()),
		createdByUserId: v.id("users"),
	},
	handler: async (
		ctx,
		{ email, name, role, organizationId, phone, createdByUserId },
	): Promise<Id<"users">> => {
		const existing = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", email))
			.unique();
		if (existing) {
			throw new ConvexError({
				code: "ALREADY_EXISTS",
				message: `A user with email ${email} already exists.`,
			});
		}
		return await ctx.db.insert("users", {
			clerkId: null,
			email,
			name,
			role,
			organizationId,
			phone,
			active: true,
			createdByUserId,
		});
	},
});

export const deleteUserById = internalMutation({
	args: { userId: v.id("users") },
	handler: async (ctx, { userId }) => {
		await ctx.db.delete(userId);
	},
});

export const adminCreateUser = action({
	args: {
		email: v.string(),
		name: v.string(),
		role: roleValidator,
		organizationId: v.optional(v.id("organizations")),
		phone: v.optional(v.string()),
		redirectUrl: v.optional(v.string()),
	},
	handler: async (
		ctx,
		{ email, name, role, organizationId, phone, redirectUrl },
	): Promise<{ userId: Id<"users">; invitationId: string }> => {
		const caller = await ctx.runQuery(internal.users.currentAdmin);
		const normalizedEmail = email.trim().toLowerCase();

		const secret = process.env.CLERK_SECRET_KEY;
		if (!secret) {
			throw new ConvexError({
				code: "CONFIG",
				message:
					"CLERK_SECRET_KEY is not set in Convex env. Run: npx convex env set CLERK_SECRET_KEY <key>",
			});
		}

		const userId = await ctx.runMutation(internal.users.insertInvitedUser, {
			email: normalizedEmail,
			name,
			role,
			organizationId,
			phone,
			createdByUserId: caller._id,
		});

		const body = {
			email_address: normalizedEmail,
			public_metadata: { role },
			...(redirectUrl ? { redirect_url: redirectUrl } : {}),
			notify: true,
		};

		let res: Response;
		try {
			res = await fetch("https://api.clerk.com/v1/invitations", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${secret}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			});
		} catch (err) {
			await ctx.runMutation(internal.users.deleteUserById, { userId });
			throw new ConvexError({
				code: "CLERK_NETWORK",
				message: `Failed to reach Clerk: ${(err as Error).message}`,
			});
		}

		if (!res.ok) {
			await ctx.runMutation(internal.users.deleteUserById, { userId });
			const text = await res.text();
			throw new ConvexError({
				code: "CLERK_ERROR",
				message: `Clerk rejected the invitation (${res.status}): ${text}`,
			});
		}

		const payload = (await res.json()) as { id?: string };
		return { userId, invitationId: payload.id ?? "" };
	},
});

