export type JobStatus = "pending" | "in_progress" | "done";

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
	pending: "Pending",
	in_progress: "In progress",
	done: "Done",
};

export type JobLineItem = {
	id: string;
	description: string;
	notes: string;
	status: JobStatus;
};

export type Role = "owner" | "member" | "contractor";

export const ROLE_LABEL: Record<Role, string> = {
	owner: "Owner",
	member: "Member",
	contractor: "Contractor",
};

export type TeamMember = {
	id: string;
	createdAt: number;
	fullName: string;
	email: string;
	role: Role;
	inviteToken: string;
	acceptedAt: number | null;
};

export type WorkOrder = {
	id: string;
	createdAt: number;
	vin: string;
	customerName: string;
	vehicle: string;
	mileage: string;
	assignedMemberId: string | null;
	jobs: JobLineItem[];
};

export const STORAGE_KEYS = {
	teamMembers: "sjbuilt.teamMembers.v1",
	workOrders: "sjbuilt.workOrders.v2",
} as const;
