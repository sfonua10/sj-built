import type * as React from "react";

import { cn } from "#/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"flex field-sizing-content min-h-20 w-full rounded-[2px] border-2 border-ink bg-paper-raised px-3 py-2 text-base text-ink transition-colors outline-none placeholder:text-stone-400 focus-visible:border-amber focus-visible:ring-2 focus-visible:ring-amber/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-flare aria-invalid:ring-2 aria-invalid:ring-flare/40 md:text-sm",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
