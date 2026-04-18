import { cn } from "#/lib/utils";

type VinPlateProps = {
	vin: string;
	size?: "sm" | "md" | "lg";
	block?: boolean;
	className?: string;
};

function formatVin(vin: string) {
	const clean = vin.toUpperCase();
	if (clean.length !== 17) return clean;
	return `${clean.slice(0, 3)} ${clean.slice(3, 9)} ${clean.slice(9)}`;
}

export default function VinPlate({
	vin,
	size = "md",
	block = false,
	className,
}: VinPlateProps) {
	return (
		<div
			className={cn(
				"vin-plate",
				size === "lg" && "vin-plate--lg",
				block && "vin-plate--block",
				className,
			)}
		>
			<span className="vin-plate__kicker">VIN</span>
			<span className="vin-plate__value">{formatVin(vin)}</span>
			<span className="vin-plate__tick vin-plate__tick--tl" />
			<span className="vin-plate__tick vin-plate__tick--tr" />
			<span className="vin-plate__tick vin-plate__tick--bl" />
			<span className="vin-plate__tick vin-plate__tick--br" />
		</div>
	);
}
