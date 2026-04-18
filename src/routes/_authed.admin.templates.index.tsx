import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import AdminNav from "#/components/AdminNav";
import SlugBanner from "#/components/SlugBanner";
import StatusStamp from "#/components/StatusStamp";
import { Button } from "#/components/ui/button";
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
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "#/components/ui/sheet";
import { Skeleton } from "#/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { Textarea } from "#/components/ui/textarea";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/_authed/admin/templates/")({
	component: TemplatesPage,
});

const formSchema = z.object({
	organizationId: z.string().min(1, "Pick an organization"),
	name: z.string().trim().min(1, "Name is required").max(120),
	description: z.string().max(500).optional(),
});
type FormValues = z.infer<typeof formSchema>;

function TemplatesPage() {
	const templates = useQuery(api.checklistTemplates.listAll, {});
	const organizations = useQuery(api.organizations.list, {});
	const orgNameById = new Map(
		(organizations ?? []).map((o) => [o._id, o.name]),
	);
	const [open, setOpen] = useState(false);

	return (
		<>
			<SlugBanner
				kicker="Command"
				title="Checklist templates"
				meta={templates ? `${templates.length} on file` : undefined}
				actions={
					<Button onClick={() => setOpen(true)} size="default">
						New template
					</Button>
				}
			/>
			<AdminNav />
			<main className="page-wrap space-y-6 px-6 py-8">
				<div className="border-2 border-ink bg-paper-raised">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Organization</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Status</TableHead>
								<TableHead aria-label="actions" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{templates === undefined ? (
								<TableRow>
									<TableCell colSpan={5}>
										<Skeleton className="h-6 w-40" />
									</TableCell>
								</TableRow>
							) : templates.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center font-mono text-xs uppercase tracking-[0.2em] text-stone-600"
									>
										No templates yet. Create one to make it available to
										customers.
									</TableCell>
								</TableRow>
							) : (
								templates.map((t) => (
									<TableRow key={t._id}>
										<TableCell className="font-display uppercase tracking-[0.06em] text-ink">
											{t.name}
										</TableCell>
										<TableCell className="text-sm text-stone-600">
											{t.organizationId
												? (orgNameById.get(t.organizationId) ?? "—")
												: "—"}
										</TableCell>
										<TableCell className="text-sm text-stone-600">
											{t.description ?? "—"}
										</TableCell>
										<TableCell>
											{t.isActive ? (
												<StatusStamp tone="timber" label="Active" size="sm" />
											) : (
												<StatusStamp tone="stone" label="Archived" size="sm" />
											)}
										</TableCell>
										<TableCell className="text-right">
											<Link
												to="/admin/templates/$templateId"
												params={{ templateId: t._id }}
												className="font-display text-xs uppercase tracking-[0.14em] text-amber-deep hover:text-ink"
											>
												Edit →
											</Link>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</main>

			<CreateTemplateSheet
				open={open}
				onOpenChange={setOpen}
				organizations={organizations ?? []}
			/>
		</>
	);
}

function CreateTemplateSheet({
	open,
	onOpenChange,
	organizations,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizations: { _id: Id<"organizations">; name: string }[];
}) {
	const create = useMutation(api.checklistTemplates.adminCreate);
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { organizationId: "", name: "", description: "" },
	});

	async function onSubmit(values: FormValues) {
		try {
			await create({
				organizationId: values.organizationId as Id<"organizations">,
				name: values.name,
				description: values.description,
			});
			toast.success(`Created ${values.name}`);
			form.reset();
			onOpenChange(false);
		} catch (err) {
			toast.error((err as Error).message);
		}
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>New template</SheetTitle>
					<SheetDescription>
						Templates seed a customer's checklist when they submit a work order.
						They can still add/remove items on the order.
					</SheetDescription>
				</SheetHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-1 flex-col gap-4 px-4"
					>
						<FormField
							control={form.control}
							name="organizationId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Organization</FormLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Pick an organization" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{organizations.length === 0 ? (
												<SelectItem disabled value="__none__">
													Create an organization first
												</SelectItem>
											) : (
												organizations.map((org) => (
													<SelectItem key={org._id} value={org._id}>
														{org.name}
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Tow Package A" {...field} />
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
						<SheetFooter>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? "Creating…" : "Create"}
							</Button>
						</SheetFooter>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	);
}
