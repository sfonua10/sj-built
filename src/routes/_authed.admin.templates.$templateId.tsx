import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowDown, ArrowLeft, ArrowUp, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import AdminNav from "#/components/AdminNav";
import SlugBanner from "#/components/SlugBanner";
import StatusStamp from "#/components/StatusStamp";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "#/components/ui/form";
import { Input } from "#/components/ui/input";
import { Skeleton } from "#/components/ui/skeleton";
import { Textarea } from "#/components/ui/textarea";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/_authed/admin/templates/$templateId")({
	component: TemplateDetailPage,
});

const itemSchema = z.object({
	title: z.string().trim().min(1, "Title is required").max(200),
	description: z.string().max(500).optional(),
});
type ItemValues = z.infer<typeof itemSchema>;

function TemplateDetailPage() {
	const { templateId } = Route.useParams();
	const tplId = templateId as Id<"checklistTemplates">;
	const template = useQuery(api.checklistTemplates.get, { templateId: tplId });
	const addItem = useMutation(api.checklistTemplates.adminAddItem);
	const removeItem = useMutation(api.checklistTemplates.adminRemoveItem);
	const reorder = useMutation(api.checklistTemplates.adminReorderItems);
	const updateTemplate = useMutation(api.checklistTemplates.adminUpdate);

	const form = useForm<ItemValues>({
		resolver: zodResolver(itemSchema),
		defaultValues: { title: "", description: "" },
	});

	if (template === undefined) {
		return (
			<main className="page-wrap px-6 py-10">
				<Skeleton className="h-8 w-48" />
			</main>
		);
	}
	if (template === null) {
		return (
			<main className="page-wrap px-6 py-10">
				<p className="font-mono text-sm uppercase tracking-[0.2em] text-stone-600">
					Template not found.
				</p>
				<Button asChild variant="link">
					<Link to="/admin/templates">← Back to templates</Link>
				</Button>
			</main>
		);
	}

	async function onAddItem(values: ItemValues) {
		try {
			await addItem({
				templateId: tplId,
				title: values.title,
				description: values.description,
			});
			form.reset();
		} catch (err) {
			toast.error((err as Error).message);
		}
	}

	async function move(index: number, direction: -1 | 1) {
		if (!template) return;
		const items = template.items;
		const target = index + direction;
		if (target < 0 || target >= items.length) return;
		const orderedItemIds = items.map((i) => i._id);
		[orderedItemIds[index], orderedItemIds[target]] = [
			orderedItemIds[target],
			orderedItemIds[index],
		];
		try {
			await reorder({ templateId: tplId, orderedItemIds });
		} catch (err) {
			toast.error((err as Error).message);
		}
	}

	async function toggleActive() {
		if (!template) return;
		try {
			await updateTemplate({
				templateId: tplId,
				isActive: !template.isActive,
			});
			toast.success(template.isActive ? "Archived" : "Reactivated");
		} catch (err) {
			toast.error((err as Error).message);
		}
	}

	return (
		<>
			<SlugBanner
				kicker="Template"
				title={template.name}
				meta={template.description}
				actions={
					<div className="flex items-center gap-2">
						{template.isActive ? (
							<StatusStamp tone="timber" label="Active" size="sm" />
						) : (
							<StatusStamp tone="stone" label="Archived" size="sm" />
						)}
						<Button variant="outline" size="sm" onClick={toggleActive}>
							{template.isActive ? "Archive" : "Reactivate"}
						</Button>
					</div>
				}
			/>
			<AdminNav />
			<main className="page-wrap space-y-6 px-6 py-8">
				<Link
					to="/admin/templates"
					className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.16em] text-amber-deep hover:text-ink"
				>
					<ArrowLeft className="size-3" />
					All templates
				</Link>

				<section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
					<Card>
						<CardContent className="space-y-4 p-6">
							<h2 className="font-display text-lg uppercase tracking-[0.1em] text-ink">
								Items
							</h2>
							{template.items.length === 0 ? (
								<div className="flex h-20 items-center justify-center border-2 border-dashed border-stone-300">
									<p className="font-mono text-xs uppercase tracking-[0.2em] text-stone-600">
										No items yet
									</p>
								</div>
							) : (
								<ol className="space-y-3">
									{template.items.map((item, index) => (
										<li
											key={item._id}
											className="flex items-start gap-3 border-2 border-ink bg-paper-raised p-3"
										>
											<div className="flex size-10 flex-shrink-0 items-center justify-center border-2 border-ink bg-paper font-display text-sm text-ink">
												{String(index + 1).padStart(2, "0")}
											</div>
											<div className="min-w-0 flex-1">
												<p className="font-display text-sm uppercase tracking-[0.08em] text-ink">
													{item.title}
												</p>
												{item.description ? (
													<p className="mt-1 text-sm text-stone-600">
														{item.description}
													</p>
												) : null}
											</div>
											<div className="flex flex-shrink-0 items-center gap-1">
												<Button
													variant="ghost"
													size="icon"
													aria-label="Move up"
													onClick={() => move(index, -1)}
													disabled={index === 0}
												>
													<ArrowUp className="size-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													aria-label="Move down"
													onClick={() => move(index, 1)}
													disabled={index === template.items.length - 1}
												>
													<ArrowDown className="size-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													aria-label="Delete"
													onClick={async () => {
														try {
															await removeItem({ itemId: item._id });
														} catch (err) {
															toast.error((err as Error).message);
														}
													}}
												>
													<Trash2 className="size-4" />
												</Button>
											</div>
										</li>
									))}
								</ol>
							)}
						</CardContent>
					</Card>

					<Card accent="amber">
						<CardContent className="space-y-4 p-6">
							<h2 className="font-display text-lg uppercase tracking-[0.1em] text-ink">
								Add item
							</h2>
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onAddItem)}
									className="flex flex-col gap-4"
								>
									<FormField
										control={form.control}
										name="title"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Title</FormLabel>
												<FormControl>
													<Input placeholder="Install bed liner" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="description"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Description (optional)</FormLabel>
												<FormControl>
													<Textarea rows={3} {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button type="submit" disabled={form.formState.isSubmitting}>
										Add item
									</Button>
								</form>
							</Form>
						</CardContent>
					</Card>
				</section>
			</main>
		</>
	);
}
