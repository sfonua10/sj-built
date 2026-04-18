import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import AdminNav from "#/components/AdminNav";
import SlugBanner from "#/components/SlugBanner";
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

export const Route = createFileRoute("/_authed/admin/organizations/")({
	component: OrganizationsPage,
});

const formSchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(120),
	notes: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function OrganizationsPage() {
	const orgs = useQuery(api.organizations.list, {});
	const [open, setOpen] = useState(false);

	return (
		<>
			<SlugBanner
				kicker="Command"
				title="Organizations"
				meta={orgs ? `${orgs.length} on file` : undefined}
				actions={
					<Button onClick={() => setOpen(true)} size="default">
						New organization
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
								<TableHead>Notes</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{orgs === undefined ? (
								<TableRow>
									<TableCell colSpan={2}>
										<Skeleton className="h-6 w-40" />
									</TableCell>
								</TableRow>
							) : orgs.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={2}
										className="text-center font-mono text-xs uppercase tracking-[0.2em] text-stone-600"
									>
										No organizations yet. Create one to start onboarding
										customers.
									</TableCell>
								</TableRow>
							) : (
								orgs.map((org) => (
									<TableRow key={org._id}>
										<TableCell className="font-display uppercase tracking-[0.06em] text-ink">
											{org.name}
										</TableCell>
										<TableCell className="text-sm text-stone-600">
											{org.notes ?? "—"}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</main>

			<CreateOrganizationSheet open={open} onOpenChange={setOpen} />
		</>
	);
}

function CreateOrganizationSheet({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const createOrg = useMutation(api.organizations.adminCreate);
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { name: "", notes: "" },
	});

	async function onSubmit(values: FormValues) {
		try {
			await createOrg({ name: values.name, notes: values.notes });
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
					<SheetTitle>New organization</SheetTitle>
					<SheetDescription>
						Add a customer company. You can then create customer users attached
						to it.
					</SheetDescription>
				</SheetHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-1 flex-col gap-4 px-4"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Summit Trucking" {...field} />
									</FormControl>
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
										<Textarea
											placeholder="Any internal notes about this customer"
											rows={4}
											{...field}
										/>
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
