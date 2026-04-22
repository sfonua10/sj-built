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

export type Contractor = {
	id: string;
	createdAt: number;
	fullName: string;
};

export type WorkOrder = {
	id: string;
	createdAt: number;
	vin: string;
	customerName: string;
	vehicle: string;
	mileage: string;
	assignedContractorId: string | null;
	jobs: JobLineItem[];
};

export const STORAGE_KEYS = {
	contractors: "sjbuilt.contractors.v1",
	workOrders: "sjbuilt.workOrders.v1",
} as const;
