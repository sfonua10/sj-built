import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, requireUser } from "./lib/auth";

export const list = query({
	args: {},
	handler: async (ctx) => {
		await requireUser(ctx);
		const rows = await ctx.db.query("organizations").collect();
		return rows.sort((a, b) => a.name.localeCompare(b.name));
	},
});

export const adminCreate = mutation({
	args: {
		name: v.string(),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, { name, notes }) => {
		await requireRole(ctx, "admin");
		const trimmed = name.trim();
		return await ctx.db.insert("organizations", {
			name: trimmed,
			notes: notes?.trim() || undefined,
		});
	},
});

export const adminUpdate = mutation({
	args: {
		organizationId: v.id("organizations"),
		name: v.optional(v.string()),
		notes: v.optional(v.string()),
		primaryContactUserId: v.optional(v.union(v.id("users"), v.null())),
	},
	handler: async (
		ctx,
		{ organizationId, name, notes, primaryContactUserId },
	) => {
		await requireRole(ctx, "admin");
		const patch: Record<string, unknown> = {};
		if (name !== undefined) patch.name = name.trim();
		if (notes !== undefined) patch.notes = notes.trim() || undefined;
		if (primaryContactUserId !== undefined) {
			patch.primaryContactUserId = primaryContactUserId ?? undefined;
		}
		await ctx.db.patch(organizationId, patch);
	},
});
