import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "#/lib/utils";

const badgeVariants = cva(
	"inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border-2 border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-amber aria-invalid:border-flare [&>svg]:pointer-events-none [&>svg]:size-3",
	{
		variants: {
			variant: {
				default: "bg-ink text-paper-raised rounded-[2px]",
				secondary: "bg-stone-100 text-ink rounded-[2px]",
				destructive: "bg-flare text-paper-raised rounded-[2px]",
				outline: "border-ink text-ink rounded-[2px]",
				ghost: "text-ink",
				link: "text-ink underline-offset-4 hover:underline",
				"stamp-amber":
					"bg-amber text-ink rounded-[2px] font-display uppercase tracking-[0.08em] border-amber",
				"stamp-torch":
					"bg-torch text-paper-raised rounded-[2px] font-display uppercase tracking-[0.08em] border-torch",
				"stamp-timber":
					"bg-timber text-paper-raised rounded-[2px] font-display uppercase tracking-[0.08em] border-timber",
				"stamp-flare":
					"bg-flare text-paper-raised rounded-[2px] font-display uppercase tracking-[0.08em] border-flare",
				"stamp-stone":
					"bg-stone-600 text-paper-raised rounded-[2px] font-display uppercase tracking-[0.08em] border-stone-600",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant = "default",
	asChild = false,
	...props
}: React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : "span";

	return (
		<Comp
			data-slot="badge"
			data-variant={variant}
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
