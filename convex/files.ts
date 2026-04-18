import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireRole, requireUser } from "./lib/auth";

export const generateUploadUrl = mutation({
	args: { checklistItemId: v.id("checklistItems") },
	handler: async (ctx, { checklistItemId }) => {
		const me = await requireRole(ctx, "contractor");
		const item = await ctx.db.get(checklistItemId);
		if (!item) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Checklist item not found.",
			});
		}
		const order = await ctx.db.get(item.workOrderId);
		if (!order || order.assignedContractorId !== me._id) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "This item is not on a job assigned to you.",
			});
		}
		if (order.status === "complete") {
			throw new ConvexError({
				code: "INVALID_STATE",
				message: "Order already complete.",
			});
		}
		return await ctx.storage.generateUploadUrl();
	},
});

export const attachPhoto = mutation({
	args: {
		checklistItemId: v.id("checklistItems"),
		storageId: v.id("_storage"),
	},
	handler: async (ctx, { checklistItemId, storageId }) => {
		const me = await requireRole(ctx, "contractor");
		const item = await ctx.db.get(checklistItemId);
		if (!item) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Checklist item not found.",
			});
		}
		const order = await ctx.db.get(item.workOrderId);
		if (!order || order.assignedContractorId !== me._id) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "This item is not on a job assigned to you.",
			});
		}
		await ctx.db.insert("checklistPhotos", {
			checklistItemId,
			storageId,
			uploadedByUserId: me._id,
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
	},
});

export const removePhoto = mutation({
	args: { photoId: v.id("checklistPhotos") },
	handler: async (ctx, { photoId }) => {
		const me = await requireUser(ctx);
		const photo = await ctx.db.get(photoId);
		if (!photo) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Photo not found.",
			});
		}
		if (me.role !== "admin" && photo.uploadedByUserId !== me._id) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "You can only remove your own photos.",
			});
		}
		await ctx.storage.delete(photo.storageId);
		await ctx.db.delete(photoId);
	},
});
