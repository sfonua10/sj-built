import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useAction, useMutation, useQuery } from "convex/react";
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
import type { StampTone } from "#/lib/workOrder";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/_authed/admin/users/")({
	component: UsersPage,
});

const roleValues = ["admin", "customer", "contractor"] as const;
type Role = (typeof roleValues)[number];

const roleTone: Record<Role, StampTone> = {
	admin: "amber",
	customer: "torch",
	contractor: "timber",
};

const formSchema = z
	.object({
		name: z.string().trim().min(1, "Name is required").max(120),
		email: z.string().trim().toLowerCase().email(),
		role: z.enum(roleValues),
		organizationId: z.string().optional(),
		phone: z.string().optional(),
	})
	.refine(
		(v) =>
			v.role !== "customer" || (v.organizationId && v.organizationId !== ""),
		{
			message: "Customers must belong to an organization",
			path: ["organizationId"],
		},
	);

type FormValues = z.infer<typeof formSchema>;

function UsersPage() {
	const users = useQuery(api.users.listUsers, {});
	const orgs = useQuery(api.organizations.list, {});
	const setActive = useMutation(api.users.adminSetUserActive);
	const [open, setOpen] = useState(false);
	const orgMap = new Map<Id<"organizations">, string>(
		orgs?.map((o) => [o._id, o.name] as const) ?? [],
	);

	return (
		<>
			<SlugBanner
				kicker="Command"
				title="Users"
				meta={users ? `${users.length} on file` : undefined}
				actions={
					<Button onClick={() => setOpen(true)} size="default">
						Invite user
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
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Organization</TableHead>
								<TableHead>Status</TableHead>
								<TableHead aria-label="actions" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{users === undefined ? (
								<TableRow>
									<TableCell colSpan={6}>
										<Skeleton className="h-6 w-40" />
									</TableCell>
								</TableRow>
							) : users.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="text-center font-mono text-xs uppercase tracking-[0.2em] text-stone-600"
									>
										No users yet. Invite your first admin, customer, or
										contractor.
									</TableCell>
								</TableRow>
							) : (
								users.map((user) => (
									<UserRow
										key={user._id}
										user={user}
										orgName={
											user.organizationId
												? orgMap.get(user.organizationId)
												: undefined
										}
										onToggleActive={(active) =>
											setActive({ userId: user._id, active })
										}
									/>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</main>

			<InviteUserSheet
				open={open}
				onOpenChange={setOpen}
				organizations={orgs ?? []}
			/>
		</>
	);
}

function UserRow({
	user,
	orgName,
	onToggleActive,
}: {
	user: Doc<"users">;
	orgName?: string;
	onToggleActive: (active: boolean) => Promise<unknown>;
}) {
	const pending = user.clerkId === null;
	return (
		<TableRow>
			<TableCell className="font-display uppercase tracking-[0.06em] text-ink">
				{user.name}
			</TableCell>
			<TableCell className="font-mono text-xs text-stone-600">
				{user.email}
			</TableCell>
			<TableCell>
				<StatusStamp
					tone={roleTone[user.role as Role] ?? "stone"}
					label={user.role}
					size="sm"
				/>
			</TableCell>
			<TableCell className="text-sm text-stone-600">{orgName ?? "—"}</TableCell>
			<TableCell>
				{!user.active ? (
					<StatusStamp tone="stone" label="Disabled" size="sm" />
				) : pending ? (
					<StatusStamp tone="flare" label="Invited" size="sm" />
				) : (
					<StatusStamp tone="timber" label="Active" size="sm" />
				)}
			</TableCell>
			<TableCell className="text-right">
				<Button
					variant="ghost"
					size="sm"
					onClick={async () => {
						try {
							await onToggleActive(!user.active);
							toast.success(user.active ? "Deactivated" : "Reactivated");
						} catch (err) {
							toast.error((err as Error).message);
						}
					}}
				>
					{user.active ? "Deactivate" : "Reactivate"}
				</Button>
			</TableCell>
		</TableRow>
	);
}

function InviteUserSheet({
	open,
	onOpenChange,
	organizations,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizations: Doc<"organizations">[];
}) {
	const createUser = useAction(api.users.adminCreateUser);
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			role: "contractor",
			organizationId: "",
			phone: "",
		},
	});
	const role = form.watch("role") as Role;

	async function onSubmit(values: FormValues) {
		try {
			await createUser({
				name: values.name,
				email: values.email,
				role: values.role,
				organizationId:
					values.role === "customer" && values.organizationId
						? (values.organizationId as Id<"organizations">)
						: undefined,
				phone: values.phone || undefined,
				redirectUrl:
					typeof window !== "undefined"
						? `${window.location.origin}/sign-up`
						: undefined,
			});
			toast.success(`Invitation sent to ${values.email}`);
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
					<SheetTitle>Invite user</SheetTitle>
					<SheetDescription>
						We'll email them a Clerk invitation and pre-provision their role
						here. Their account activates on first sign-in.
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
										<Input placeholder="Jane Doe" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="jane@example.com"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="admin">Admin</SelectItem>
											<SelectItem value="customer">Customer</SelectItem>
											<SelectItem value="contractor">Contractor</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						{role === "customer" && (
							<FormField
								control={form.control}
								name="organizationId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Organization</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Select organization" />
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
						)}
						{role === "contractor" && (
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone (optional)</FormLabel>
										<FormControl>
											<Input placeholder="555-0142" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
						<SheetFooter>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? "Sending…" : "Send invitation"}
							</Button>
						</SheetFooter>
					</form>
				</Form>
			</SheetContent>
		</Sheet>
	);
}
