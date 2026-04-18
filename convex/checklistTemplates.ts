import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireRole, requireUser } from "./lib/auth";

export const listActive = query({
	args: {},
	handler: async (ctx) => {
		const me = await requireUser(ctx);
		const active = await ctx.db
			.query("checklistTemplates")
			.withIndex("by_active", (q) => q.eq("isActive", true))
			.collect();
		if (me.role === "admin") return active;
		if (me.role === "customer") {
			if (!me.organizationId) return [];
			return active.filter(
				(t) =>
					t.organizationId === me.organizationId ||
					t.organizationId === undefined,
			);
		}
		return [];
	},
});

export const listAll = query({
	args: {},
	handler: async (ctx) => {
		await requireRole(ctx, "admin");
		return await ctx.db.query("checklistTemplates").collect();
	},
});

export const get = query({
	args: { templateId: v.id("checklistTemplates") },
	handler: async (ctx, { templateId }) => {
		const me = await requireUser(ctx);
		const template = await ctx.db.get(templateId);
		if (!template) return null;
		if (me.role === "customer") {
			if (
				template.organizationId !== undefined &&
				template.organizationId !== me.organizationId
			) {
				throw new ConvexError({
					code: "FORBIDDEN",
					message: "You do not have access to this template.",
				});
			}
		} else if (me.role === "contractor") {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Contractors cannot view templates.",
			});
		}
		const items = await ctx.db
			.query("checklistTemplateItems")
			.withIndex("by_template", (q) => q.eq("templateId", templateId))
			.collect();
		return {
			...template,
			items: items.sort((a, b) => a.order - b.order),
		};
	},
});

export const adminCreate = mutation({
	args: {
		organizationId: v.id("organizations"),
		name: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, { organizationId, name, description }) => {
		const me = await requireRole(ctx, "admin");
		const org = await ctx.db.get(organizationId);
		if (!org) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Organization not found.",
			});
		}
		return await ctx.db.insert("checklistTemplates", {
			organizationId,
			name: name.trim(),
			description: description?.trim() || undefined,
			isActive: true,
			createdByUserId: me._id,
		});
	},
});

export const adminUpdate = mutation({
	args: {
		templateId: v.id("checklistTemplates"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		isActive: v.optional(v.boolean()),
	},
	handler: async (ctx, { templateId, name, description, isActive }) => {
		await requireRole(ctx, "admin");
		const patch: Record<string, unknown> = {};
		if (name !== undefined) patch.name = name.trim();
		if (description !== undefined) {
			patch.description = description.trim() || undefined;
		}
		if (isActive !== undefined) patch.isActive = isActive;
		await ctx.db.patch(templateId, patch);
	},
});

export const adminAddItem = mutation({
	args: {
		templateId: v.id("checklistTemplates"),
		title: v.string(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, { templateId, title, description }) => {
		await requireRole(ctx, "admin");
		const template = await ctx.db.get(templateId);
		if (!template) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Template not found.",
			});
		}
		const existing = await ctx.db
			.query("checklistTemplateItems")
			.withIndex("by_template", (q) => q.eq("templateId", templateId))
			.collect();
		const nextOrder =
			existing.length === 0
				? 0
				: Math.max(...existing.map((i) => i.order)) + 1;
		return await ctx.db.insert("checklistTemplateItems", {
			templateId,
			title: title.trim(),
			description: description?.trim() || undefined,
			order: nextOrder,
		});
	},
});

export const adminUpdateItem = mutation({
	args: {
		itemId: v.id("checklistTemplateItems"),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		order: v.optional(v.number()),
	},
	handler: async (ctx, { itemId, title, description, order }) => {
		await requireRole(ctx, "admin");
		const patch: Record<string, unknown> = {};
		if (title !== undefined) patch.title = title.trim();
		if (description !== undefined) {
			patch.description = description.trim() || undefined;
		}
		if (order !== undefined) patch.order = order;
		await ctx.db.patch(itemId, patch);
	},
});

export const adminRemoveItem = mutation({
	args: { itemId: v.id("checklistTemplateItems") },
	handler: async (ctx, { itemId }) => {
		await requireRole(ctx, "admin");
		await ctx.db.delete(itemId);
	},
});

export const adminReorderItems = mutation({
	args: {
		templateId: v.id("checklistTemplates"),
		orderedItemIds: v.array(v.id("checklistTemplateItems")),
	},
	handler: async (ctx, { templateId, orderedItemIds }) => {
		await requireRole(ctx, "admin");
		for (let i = 0; i < orderedItemIds.length; i++) {
			const item = await ctx.db.get(orderedItemIds[i]);
			if (!item || item.templateId !== templateId) {
				throw new ConvexError({
					code: "BAD_REQUEST",
					message: "Item does not belong to this template.",
				});
			}
			await ctx.db.patch(orderedItemIds[i], { order: i });
		}
	},
});

// One-time migration: backfill organizationId on templates created before the
// field existed. Run once via: npx convex run checklistTemplates:backfillTemplateOrg '{"organizationId": "<orgId>"}'
// Remove after the schema is narrowed to require organizationId.
export const backfillTemplateOrg = internalMutation({
	args: { organizationId: v.id("organizations") },
	handler: async (ctx, { organizationId }) => {
		const org = await ctx.db.get(organizationId);
		if (!org) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Organization not found.",
			});
		}
		const all = await ctx.db.query("checklistTemplates").collect();
		let patched = 0;
		for (const t of all) {
			if (t.organizationId === undefined) {
				await ctx.db.patch(t._id, { organizationId });
				patched += 1;
			}
		}
		return { scanned: all.length, patched };
	},
});
