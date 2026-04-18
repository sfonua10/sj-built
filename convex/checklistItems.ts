import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";
import { requireRole, requireUser } from "./lib/auth";

async function loadItemForWrite(
	ctx: MutationCtx,
	itemId: Id<"checklistItems">,
): Promise<{ item: Doc<"checklistItems">; order: Doc<"workOrders"> }> {
	const item = await ctx.db.get(itemId);
	if (!item) {
		throw new ConvexError({
			code: "NOT_FOUND",
			message: "Checklist item not found.",
		});
	}
	const order = await ctx.db.get(item.workOrderId);
	if (!order) {
		throw new ConvexError({
			code: "NOT_FOUND",
			message: "Work order not found.",
		});
	}
	return { item, order };
}

export const markItemDone = mutation({
	args: { itemId: v.id("checklistItems") },
	handler: async (ctx, { itemId }) => {
		const me = await requireRole(ctx, "contractor");
		const { item, order } = await loadItemForWrite(ctx, itemId);
		if (order.assignedContractorId !== me._id) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "This job is not assigned to you.",
			});
		}
		if (order.status === "complete") {
			throw new ConvexError({
				code: "INVALID_STATE",
				message: "Order already complete.",
			});
		}
		const photos = await ctx.db
			.query("checklistPhotos")
			.withIndex("by_checklistItem", (q) => q.eq("checklistItemId", itemId))
			.collect();
		if (photos.length === 0) {
			throw new ConvexError({
				code: "BAD_REQUEST",
				message: "Attach at least one photo before marking this item done.",
			});
		}
		await ctx.db.patch(itemId, {
			state: "done",
			completedAt: Date.now(),
			completedByUserId: me._id,
			rejectionReason: undefined,
		});
		if (order.status === "assigned") {
			await ctx.db.patch(order._id, {
				status: "in_progress",
				startedAt: order.startedAt ?? Date.now(),
			});
			await ctx.db.insert("workOrderEvents", {
				workOrderId: order._id,
				actorUserId: me._id,
				type: "started",
				payload: {},
			});
		}
		await ctx.db.insert("workOrderEvents", {
			workOrderId: order._id,
			actorUserId: me._id,
			type: "item_completed",
			payload: { itemId, itemTitle: item.title },
		});
	},
});

export const rejectItem = mutation({
	args: {
		itemId: v.id("checklistItems"),
		reason: v.string(),
	},
	handler: async (ctx, { itemId, reason }) => {
		const me = await requireRole(ctx, "admin");
		const { item, order } = await loadItemForWrite(ctx, itemId);
		const trimmed = reason.trim();
		if (!trimmed) {
			throw new ConvexError({
				code: "BAD_REQUEST",
				message: "Provide a rejection reason.",
			});
		}
		await ctx.db.patch(itemId, {
			state: "rejected",
			rejectionReason: trimmed,
			completedAt: undefined,
			completedByUserId: undefined,
		});
		if (order.status === "awaiting_review") {
			await ctx.db.patch(order._id, { status: "in_progress" });
		}
		await ctx.db.insert("workOrderEvents", {
			workOrderId: order._id,
			actorUserId: me._id,
			type: "item_rejected",
			payload: { itemId, itemTitle: item.title, reason: trimmed },
		});
	},
});

export const listPhotosForItem = query({
	args: { itemId: v.id("checklistItems") },
	handler: async (ctx, { itemId }) => {
		const me = await requireUser(ctx);
		const item = await ctx.db.get(itemId);
		if (!item) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Checklist item not found.",
			});
		}
		const order = await ctx.db.get(item.workOrderId);
		if (!order) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Work order not found.",
			});
		}
		if (me.role === "customer") {
			if (!me.organizationId || order.organizationId !== me.organizationId) {
				throw new ConvexError({
					code: "FORBIDDEN",
					message: "You do not have access to this item's photos.",
				});
			}
		} else if (me.role === "contractor") {
			if (order.assignedContractorId !== me._id) {
				throw new ConvexError({
					code: "FORBIDDEN",
					message: "This job is not assigned to you.",
				});
			}
		}
		const photos = await ctx.db
			.query("checklistPhotos")
			.withIndex("by_checklistItem", (q) => q.eq("checklistItemId", itemId))
			.collect();
		return await Promise.all(
			photos.map(async (p) => ({
				_id: p._id,
				storageId: p.storageId,
				url: await ctx.storage.getUrl(p.storageId),
			})),
		);
	},
});
