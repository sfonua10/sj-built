import type * as React from "react";

import { cn } from "#/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"h-11 w-full min-w-0 rounded-[2px] border-2 border-ink bg-paper-raised px-3 py-2 text-base text-ink transition-colors outline-none selection:bg-amber selection:text-ink file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink placeholder:text-stone-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				"focus-visible:border-amber focus-visible:ring-2 focus-visible:ring-amber/40",
				"aria-invalid:border-flare aria-invalid:ring-2 aria-invalid:ring-flare/40",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
