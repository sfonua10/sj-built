import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "#/lib/utils";

const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2 rounded-[2px] text-sm font-display uppercase tracking-[0.14em] whitespace-nowrap transition-all outline-none active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default:
					"bg-amber text-ink hover:bg-amber-deep hover:text-paper-raised",
				destructive: "bg-flare text-paper-raised hover:bg-flare-soft",
				outline:
					"border-2 border-ink bg-paper-raised text-ink hover:bg-ink hover:text-paper-raised",
				secondary: "border-2 border-ink bg-paper text-ink hover:bg-stone-100",
				ghost: "text-ink hover:bg-stone-100",
				link: "text-ink underline-offset-4 hover:underline hover:text-amber-deep normal-case tracking-normal font-sans",
			},
			size: {
				default: "h-10 px-4 py-2 has-[>svg]:px-3",
				xs: "h-7 gap-1 px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-9 gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-11 px-6 text-sm has-[>svg]:px-5",
				hero: "h-14 px-8 text-base tracking-[0.18em] has-[>svg]:px-6 [&_svg:not([class*='size-'])]:size-5",
				icon: "size-10",
				"icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
				"icon-sm": "size-9",
				"icon-lg": "size-11",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
