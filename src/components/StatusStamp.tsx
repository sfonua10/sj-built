import { cn } from "#/lib/utils";
import {
	statusLabels,
	statusStampTone,
	type WorkOrderStatus,
} from "#/lib/workOrder";

type StampTone = "amber" | "torch" | "timber" | "flare" | "stone" | "outline";

type StatusStampProps = {
	status?: WorkOrderStatus;
	tone?: StampTone;
	label?: string;
	size?: "sm" | "md" | "lg" | "xl";
	className?: string;
};

export default function StatusStamp({
	status,
	tone,
	label,
	size = "md",
	className,
}: StatusStampProps) {
	const resolvedTone: StampTone =
		tone ?? (status ? statusStampTone[status] : "stone");
	const resolvedLabel = label ?? (status ? statusLabels[status] : "");

	return (
		<span
			className={cn(
				"status-stamp",
				size === "sm" && "status-stamp--sm",
				size === "lg" && "status-stamp--lg",
				size === "xl" && "status-stamp--xl",
				`status-stamp--${resolvedTone}`,
				className,
			)}
			data-status={status}
		>
			{resolvedLabel}
		</span>
	);
}
