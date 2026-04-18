import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import SlugBanner from "#/components/SlugBanner";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/_authed/customer/orders/new")({
	component: NewOrderPage,
});

const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/;

const detailsSchema = z.object({
	vin: z
		.string()
		.trim()
		.toUpperCase()
		.regex(vinPattern, "VIN must be 17 chars, no I/O/Q, no spaces"),
	truckDescription: z.string().max(200).optional(),
	title: z.string().max(120).optional(),
	notes: z.string().max(2000).optional(),
	sourceTemplateId: z.string().optional(),
});
type DetailsValues = z.infer<typeof detailsSchema>;

type DraftItem = { id: string; title: string; description?: string };

function NewOrderPage() {
	const templates = useQuery(api.checklistTemplates.listActive, {});
	const create = useMutation(api.workOrders.createWorkOrder);
	const navigate = useNavigate();

	const form = useForm<DetailsValues>({
		resolver: zodResolver(detailsSchema),
		defaultValues: {
			vin: "",
			truckDescription: "",
			title: "",
			notes: "",
			sourceTemplateId: "",
		},
	});
	const selectedTemplateId = form.watch("sourceTemplateId");
	const templateQuery = useQuery(
		api.checklistTemplates.get,
		selectedTemplateId
			? { templateId: selectedTemplateId as Id<"checklistTemplates"> }
			: "skip",
	);
	const [items, setItems] = useState<DraftItem[]>([]);
	const [newItemTitle, setNewItemTitle] = useState("");

	useEffect(() => {
		if (templateQuery?.items) {
			setItems(
				templateQuery.items.map((i) => ({
					id: i._id,
					title: i.title,
					description: i.description,
				})),
			);
		}
	}, [templateQuery]);

	function addItem() {
		const trimmed = newItemTitle.trim();
		if (!trimmed) return;
		setItems((prev) => [
			...prev,
			{ id: `draft-${Date.now()}-${prev.length}`, title: trimmed },
		]);
		setNewItemTitle("");
	}

	function removeItem(id: string) {
		setItems((prev) => prev.filter((i) => i.id !== id));
	}

	function updateItem(id: string, patch: Partial<DraftItem>) {
		setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
	}

	async function onSubmit(values: DetailsValues) {
		if (items.length === 0) {
			toast.error("Add at least one checklist item.");
			return;
		}
		try {
			const id = await create({
				vin: values.vin,
				truckDescription: values.truckDescription,
				title: values.title,
				notes: values.notes,
				sourceTemplateId: values.sourceTemplateId
					? (values.sourceTemplateId as Id<"checklistTemplates">)
					: undefined,
				items: items.map((i) => ({
					title: i.title,
					description: i.description,
				})),
			});
			toast.success("Work order submitted");
			navigate({ to: "/customer/orders/$orderId", params: { orderId: id } });
		} catch (err) {
			toast.error((err as Error).message);
		}
	}

	return (
		<>
			<SlugBanner
				kicker="Customer"
				title="New work order"
				meta="Details · Checklist · Submit"
			/>
			<main className="page-wrap space-y-6 px-6 py-8 pb-32">
				<Link
					to="/customer"
					className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.16em] text-amber-deep hover:text-ink"
				>
					<ArrowLeft className="size-3" />
					All work orders
				</Link>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-6 lg:grid-cols-2"
					>
						<Card accent="amber">
							<CardContent className="flex flex-col gap-5 p-6">
								<div>
									<p className="kicker text-amber-deep">Step 01</p>
									<h2 className="font-display text-lg uppercase tracking-[0.1em] text-ink">
										Details
									</h2>
								</div>
								<FormField
									control={form.control}
									name="vin"
									render={({ field }) => (
										<FormItem>
											<FormLabel>VIN</FormLabel>
											<FormControl>
												<Input
													className="h-14 font-mono text-lg uppercase tracking-[0.18em]"
													maxLength={17}
													placeholder="1FTFW1RG6MFA00000"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Title (optional)</FormLabel>
											<FormControl>
												<Input
													placeholder="Summit F-250 — fleet unit 12"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="truckDescription"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Truck description (optional)</FormLabel>
											<FormControl>
												<Input
													placeholder="2023 Ford F-250 crew cab, long bed"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="sourceTemplateId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Template</FormLabel>
											<Select
												value={field.value}
												onValueChange={(val) =>
													field.onChange(val === "__none__" ? "" : val)
												}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="(Optional) pick a template" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="__none__">No template</SelectItem>
													{templates?.map((t) => (
														<SelectItem key={t._id} value={t._id}>
															{t.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="notes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Notes (optional)</FormLabel>
											<FormControl>
												<Textarea rows={3} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>

						<Card accent="torch">
							<CardContent className="flex flex-col gap-5 p-6">
								<div>
									<p className="kicker text-amber-deep">Step 02</p>
									<h2 className="font-display text-lg uppercase tracking-[0.1em] text-ink">
										Checklist
									</h2>
								</div>
								{items.length === 0 ? (
									<div className="flex h-20 items-center justify-center border-2 border-dashed border-stone-300">
										<p className="font-mono text-xs uppercase tracking-[0.2em] text-stone-600">
											Pick a template or add items below
										</p>
									</div>
								) : (
									<ol className="space-y-2">
										{items.map((item, index) => (
											<li
												key={item.id}
												className="flex items-start gap-3 border-2 border-ink bg-paper-raised p-3"
											>
												<div className="flex size-8 flex-shrink-0 items-center justify-center border-2 border-ink bg-paper font-display text-xs text-ink">
													{String(index + 1).padStart(2, "0")}
												</div>
												<div className="flex-1 space-y-2">
													<Input
														value={item.title}
														onChange={(e) =>
															updateItem(item.id, { title: e.target.value })
														}
													/>
													<Textarea
														rows={2}
														placeholder="Notes for contractor (optional)"
														value={item.description ?? ""}
														onChange={(e) =>
															updateItem(item.id, {
																description: e.target.value,
															})
														}
													/>
												</div>
												<Button
													variant="ghost"
													size="icon"
													aria-label="Remove"
													onClick={() => removeItem(item.id)}
													type="button"
												>
													<Trash2 className="size-4" />
												</Button>
											</li>
										))}
									</ol>
								)}
								<div className="flex gap-2">
									<Input
										placeholder="Add a checklist item"
										value={newItemTitle}
										onChange={(e) => setNewItemTitle(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												addItem();
											}
										}}
									/>
									<Button type="button" variant="outline" onClick={addItem}>
										Add
									</Button>
								</div>
							</CardContent>
						</Card>

						<div className="lg:col-span-2">
							<div className="sticky bottom-4 z-10 flex justify-end border-2 border-ink bg-ink px-4 py-3 md:relative md:border-0 md:bg-transparent md:px-0 md:py-0">
								<Button
									type="submit"
									size="hero"
									disabled={form.formState.isSubmitting}
									className="w-full md:w-auto"
								>
									{form.formState.isSubmitting
										? "Submitting…"
										: "Submit work order"}
									<ArrowRight className="size-4" />
								</Button>
							</div>
						</div>
					</form>
				</Form>
			</main>
		</>
	);
}
