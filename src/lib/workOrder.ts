export const statusLabels: Record<string, string> = {
	unassigned: "Unassigned",
	assigned: "Assigned",
	in_progress: "In progress",
	awaiting_review: "Awaiting review",
	complete: "Complete",
};

export const statusBadgeVariant: Record<
	string,
	"default" | "secondary" | "outline"
> = {
	unassigned: "outline",
	assigned: "secondary",
	in_progress: "secondary",
	awaiting_review: "default",
	complete: "default",
};

export type StampTone = "amber" | "torch" | "timber" | "flare" | "stone";

export const statusStampTone: Record<string, StampTone> = {
	unassigned: "stone",
	assigned: "amber",
	in_progress: "torch",
	awaiting_review: "flare",
	complete: "timber",
};

export const statusOrder = [
	"unassigned",
	"assigned",
	"in_progress",
	"awaiting_review",
	"complete",
] as const;

export type WorkOrderStatus = (typeof statusOrder)[number];
