import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import {
	type MutationCtx,
	type QueryCtx,
	mutation,
	query,
} from "./_generated/server";
import { requireRole, requireUser } from "./lib/auth";

const statusValidator = v.union(
	v.literal("unassigned"),
	v.literal("assigned"),
	v.literal("in_progress"),
	v.literal("awaiting_review"),
	v.literal("complete"),
);

const itemInputValidator = v.object({
	title: v.string(),
	description: v.optional(v.string()),
});

function normalizeVin(vin: string): string {
	return vin.trim().toUpperCase();
}

function validateVin(vin: string): void {
	const forbidden = /[IOQ]/;
	if (vin.length !== 17 || forbidden.test(vin) || /\s/.test(vin)) {
		throw new ConvexError({
			code: "BAD_REQUEST",
			message:
				"VIN must be exactly 17 characters and must not contain I, O, Q, or spaces.",
		});
	}
}

async function logEvent(
	ctx: MutationCtx,
	{
		workOrderId,
		actorUserId,
		type,
		payload,
	}: {
		workOrderId: Id<"workOrders">;
		actorUserId: Id<"users">;
		type: Doc<"workOrderEvents">["type"];
		payload?: unknown;
	},
): Promise<void> {
	await ctx.db.insert("workOrderEvents", {
		workOrderId,
		actorUserId,
		type,
		payload: payload ?? {},
	});
}

async function loadOrderForCaller(
	ctx: QueryCtx,
	workOrderId: Id<"workOrders">,
): Promise<{ order: Doc<"workOrders">; me: Doc<"users"> }> {
	const me = await requireUser(ctx);
	const order = await ctx.db.get(workOrderId);
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
				message: "You do not have access to this work order.",
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
	return { order, me };
}

export const listForMe = query({
	args: { status: v.optional(statusValidator) },
	handler: async (ctx, { status }) => {
		const me = await requireUser(ctx);
		if (me.role === "admin") {
			const rows = status
				? await ctx.db
						.query("workOrders")
						.withIndex("by_status", (q) => q.eq("status", status))
						.collect()
				: await ctx.db.query("workOrders").collect();
			return rows.sort((a, b) => b._creationTime - a._creationTime);
		}
		if (me.role === "customer") {
			if (!me.organizationId) return [];
			const rows = status
				? await ctx.db
						.query("workOrders")
						.withIndex("by_organization_status", (q) =>
							q
								.eq("organizationId", me.organizationId as Id<"organizations">)
								.eq("status", status),
						)
						.collect()
				: await ctx.db
						.query("workOrders")
						.withIndex("by_organization_status", (q) =>
							q.eq(
								"organizationId",
								me.organizationId as Id<"organizations">,
							),
						)
						.collect();
			return rows.sort((a, b) => b._creationTime - a._creationTime);
		}
		// contractor
		const rows = status
			? await ctx.db
					.query("workOrders")
					.withIndex("by_contractor_status", (q) =>
						q.eq("assignedContractorId", me._id).eq("status", status),
					)
					.collect()
			: await ctx.db
					.query("workOrders")
					.withIndex("by_contractor_status", (q) =>
						q.eq("assignedContractorId", me._id),
					)
					.collect();
		return rows.sort((a, b) => b._creationTime - a._creationTime);
	},
});

export const get = query({
	args: { workOrderId: v.id("workOrders") },
	handler: async (ctx, { workOrderId }) => {
		const { order } = await loadOrderForCaller(ctx, workOrderId);
		const items = await ctx.db
			.query("checklistItems")
			.withIndex("by_workOrder", (q) => q.eq("workOrderId", workOrderId))
			.collect();
		const org = await ctx.db.get(order.organizationId);
		const contractor = order.assignedContractorId
			? await ctx.db.get(order.assignedContractorId)
			: null;
		const itemsWithPhotos = await Promise.all(
			items.map(async (item) => {
				const photos = await ctx.db
					.query("checklistPhotos")
					.withIndex("by_checklistItem", (q) =>
						q.eq("checklistItemId", item._id),
					)
					.collect();
				const hydrated = await Promise.all(
					photos.map(async (p) => ({
						_id: p._id,
						storageId: p.storageId,
						url: await ctx.storage.getUrl(p.storageId),
					})),
				);
				return { ...item, photos: hydrated };
			}),
		);
		return {
			...order,
			organizationName: org?.name ?? "—",
			contractorName: contractor?.name ?? null,
			items: itemsWithPhotos.sort((a, b) => a.order - b.order),
		};
	},
});

export const assignWorkOrder = mutation({
	args: {
		workOrderId: v.id("workOrders"),
		contractorUserId: v.id("users"),
	},
	handler: async (ctx, { workOrderId, contractorUserId }) => {
		const me = await requireRole(ctx, "admin");
		const order = await ctx.db.get(workOrderId);
		if (!order) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Work order not found.",
			});
		}
		if (
			order.status !== "unassigned" &&
			order.status !== "assigned"
		) {
			throw new ConvexError({
				code: "INVALID_STATE",
				message: `Cannot reassign from status ${order.status}.`,
			});
		}
		const contractor = await ctx.db.get(contractorUserId);
		if (!contractor || contractor.role !== "contractor" || !contractor.active) {
			throw new ConvexError({
				code: "BAD_REQUEST",
				message: "Contractor must be an active contractor user.",
			});
		}
		await ctx.db.patch(workOrderId, {
			status: "assigned",
			assignedContractorId: contractorUserId,
			assignedAt: Date.now(),
		});
		await logEvent(ctx, {
			workOrderId,
			actorUserId: me._id,
			type: "assigned",
			payload: { contractorUserId },
		});
	},
});

export const approveWorkOrder = mutation({
	args: { workOrderId: v.id("workOrders") },
	handler: async (ctx, { workOrderId }) => {
		const me = await requireRole(ctx, "admin");
		const order = await ctx.db.get(workOrderId);
		if (!order) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Work order not found.",
			});
		}
		if (order.status !== "awaiting_review") {
			throw new ConvexError({
				code: "INVALID_STATE",
				message: `Order must be awaiting review; current status ${order.status}.`,
			});
		}
		await ctx.db.patch(workOrderId, {
			status: "complete",
			completedAt: Date.now(),
		});
		await logEvent(ctx, {
			workOrderId,
			actorUserId: me._id,
			type: "approved",
		});
	},
});

export const startWorkOrder = mutation({
	args: { workOrderId: v.id("workOrders") },
	handler: async (ctx, { workOrderId }) => {
		const me = await requireRole(ctx, "contractor");
		const order = await ctx.db.get(workOrderId);
		if (!order) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Work order not found.",
			});
		}
		if (order.assignedContractorId !== me._id) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "This job is not assigned to you.",
			});
		}
		if (order.status !== "assigned") {
			return;
		}
		await ctx.db.patch(workOrderId, {
			status: "in_progress",
			startedAt: Date.now(),
		});
		await logEvent(ctx, {
			workOrderId,
			actorUserId: me._id,
			type: "started",
		});
	},
});

export const submitForReview = mutation({
	args: { workOrderId: v.id("workOrders") },
	handler: async (ctx, { workOrderId }) => {
		const me = await requireRole(ctx, "contractor");
		const order = await ctx.db.get(workOrderId);
		if (!order) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Work order not found.",
			});
		}
		if (order.assignedContractorId !== me._id) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "This job is not assigned to you.",
			});
		}
		if (order.status !== "in_progress" && order.status !== "assigned") {
			throw new ConvexError({
				code: "INVALID_STATE",
				message: `Cannot submit from status ${order.status}.`,
			});
		}
		const items = await ctx.db
			.query("checklistItems")
			.withIndex("by_workOrder", (q) => q.eq("workOrderId", workOrderId))
			.collect();
		if (items.some((i) => i.state !== "done")) {
			throw new ConvexError({
				code: "BAD_REQUEST",
				message: "All checklist items must be done before submitting.",
			});
		}
		await ctx.db.patch(workOrderId, {
			status: "awaiting_review",
			submittedAt: Date.now(),
		});
		await logEvent(ctx, {
			workOrderId,
			actorUserId: me._id,
			type: "submitted",
		});
	},
});

export const createWorkOrder = mutation({
	args: {
		vin: v.string(),
		truckDescription: v.optional(v.string()),
		title: v.optional(v.string()),
		notes: v.optional(v.string()),
		sourceTemplateId: v.optional(v.id("checklistTemplates")),
		items: v.optional(v.array(itemInputValidator)),
	},
	handler: async (
		ctx,
		{ vin, truckDescription, title, notes, sourceTemplateId, items },
	) => {
		const me = await requireRole(ctx, "customer", "admin");
		if (me.role === "customer" && !me.organizationId) {
			throw new ConvexError({
				code: "FORBIDDEN",
				message: "Customer accounts must be linked to an organization.",
			});
		}
		const organizationId = me.organizationId as Id<"organizations">;
		const normalizedVin = normalizeVin(vin);
		validateVin(normalizedVin);

		let resolvedItems: { title: string; description?: string }[];
		if (items && items.length > 0) {
			resolvedItems = items;
		} else if (sourceTemplateId) {
			const template = await ctx.db.get(sourceTemplateId);
			if (!template) {
				throw new ConvexError({
					code: "NOT_FOUND",
					message: "Template not found.",
				});
			}
			const templateItems = await ctx.db
				.query("checklistTemplateItems")
				.withIndex("by_template", (q) =>
					q.eq("templateId", sourceTemplateId),
				)
				.collect();
			if (templateItems.length === 0) {
				throw new ConvexError({
					code: "BAD_REQUEST",
					message: "This template has no checklist items.",
				});
			}
			resolvedItems = templateItems
				.sort((a, b) => a.order - b.order)
				.map((i) => ({ title: i.title, description: i.description }));
		} else {
			throw new ConvexError({
				code: "BAD_REQUEST",
				message: "Provide checklist items or pick a template.",
			});
		}

		const workOrderId = await ctx.db.insert("workOrders", {
			organizationId,
			createdByUserId: me._id,
			vin: normalizedVin,
			truckDescription: truckDescription?.trim() || undefined,
			title: title?.trim() || undefined,
			notes: notes?.trim() || undefined,
			status: "unassigned",
			sourceTemplateId,
		});
		for (let i = 0; i < resolvedItems.length; i++) {
			const raw = resolvedItems[i];
			const itemTitle = raw.title.trim();
			if (!itemTitle) continue;
			await ctx.db.insert("checklistItems", {
				workOrderId,
				title: itemTitle,
				description: raw.description?.trim() || undefined,
				order: i,
				state: "pending",
			});
		}
		await logEvent(ctx, {
			workOrderId,
			actorUserId: me._id,
			type: "created",
			payload: { vin: normalizedVin, itemCount: resolvedItems.length },
		});
		return workOrderId;
	},
});
