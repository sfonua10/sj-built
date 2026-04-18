import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		clerkId: v.union(v.string(), v.null()),
		email: v.string(),
		name: v.string(),
		role: v.union(
			v.literal("admin"),
			v.literal("customer"),
			v.literal("contractor"),
		),
		organizationId: v.optional(v.id("organizations")),
		phone: v.optional(v.string()),
		active: v.boolean(),
		createdByUserId: v.optional(v.id("users")),
	})
		.index("by_clerkId", ["clerkId"])
		.index("by_email", ["email"])
		.index("by_role", ["role"])
		.index("by_organization", ["organizationId"]),

	organizations: defineTable({
		name: v.string(),
		primaryContactUserId: v.optional(v.id("users")),
		notes: v.optional(v.string()),
	}).index("by_name", ["name"]),

	checklistTemplates: defineTable({
		organizationId: v.optional(v.id("organizations")),
		name: v.string(),
		description: v.optional(v.string()),
		isActive: v.boolean(),
		createdByUserId: v.id("users"),
	})
		.index("by_active", ["isActive"])
		.index("by_organization", ["organizationId"]),

	checklistTemplateItems: defineTable({
		templateId: v.id("checklistTemplates"),
		title: v.string(),
		description: v.optional(v.string()),
		order: v.number(),
	}).index("by_template", ["templateId"]),

	workOrders: defineTable({
		organizationId: v.id("organizations"),
		createdByUserId: v.id("users"),
		vin: v.string(),
		truckDescription: v.optional(v.string()),
		title: v.optional(v.string()),
		notes: v.optional(v.string()),
		status: v.union(
			v.literal("unassigned"),
			v.literal("assigned"),
			v.literal("in_progress"),
			v.literal("awaiting_review"),
			v.literal("complete"),
		),
		assignedContractorId: v.optional(v.id("users")),
		sourceTemplateId: v.optional(v.id("checklistTemplates")),
		assignedAt: v.optional(v.number()),
		startedAt: v.optional(v.number()),
		submittedAt: v.optional(v.number()),
		completedAt: v.optional(v.number()),
	})
		.index("by_status", ["status"])
		.index("by_organization_status", ["organizationId", "status"])
		.index("by_contractor_status", ["assignedContractorId", "status"]),

	checklistItems: defineTable({
		workOrderId: v.id("workOrders"),
		title: v.string(),
		description: v.optional(v.string()),
		order: v.number(),
		state: v.union(
			v.literal("pending"),
			v.literal("done"),
			v.literal("rejected"),
		),
		completedAt: v.optional(v.number()),
		completedByUserId: v.optional(v.id("users")),
		rejectionReason: v.optional(v.string()),
	}).index("by_workOrder", ["workOrderId"]),

	checklistPhotos: defineTable({
		checklistItemId: v.id("checklistItems"),
		storageId: v.id("_storage"),
		uploadedByUserId: v.id("users"),
	}).index("by_checklistItem", ["checklistItemId"]),

	workOrderEvents: defineTable({
		workOrderId: v.id("workOrders"),
		actorUserId: v.id("users"),
		type: v.union(
			v.literal("created"),
			v.literal("assigned"),
			v.literal("started"),
			v.literal("item_completed"),
			v.literal("submitted"),
			v.literal("item_rejected"),
			v.literal("approved"),
			v.literal("comment"),
		),
		payload: v.any(),
	}).index("by_workOrder", ["workOrderId"]),
});
