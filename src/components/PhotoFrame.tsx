import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

type PhotoFrameProps = {
	src: string;
	alt?: string;
	className?: string;
	overlay?: ReactNode;
};

export default function PhotoFrame({
	src,
	alt = "",
	className,
	overlay,
}: PhotoFrameProps) {
	return (
		<div className={cn("photo-frame", className)}>
			<img src={src} alt={alt} />
			{overlay ? <div className="absolute inset-0">{overlay}</div> : null}
		</div>
	);
}
