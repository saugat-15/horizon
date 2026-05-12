export type ProjectStatus =
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "APPROVED"
  | "ARCHIVED";

export type AssetType = "IMAGE" | "RENDER_360" | "DOCUMENT" | "VIDEO";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  logoUrl: string | null;
  createdAt?: string;
  _count?: { projects: number };
}

/** Core project row returned by create / update endpoints. */
export interface ProjectRecord {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListItem extends ProjectRecord {
  client: Client;
  _count: { assets: number; projectUsers: number };
}

export interface Asset {
  id: string;
  name: string;
  fileUrl: string;
  fileType: AssetType;
  sizeBytes: number | null;
  projectId: string;
  uploadedById: string;
  uploadedBy: User;
  createdAt: string;
}

export interface ProjectUserRow {
  projectId: string;
  userId: string;
  user: User;
}

export interface ActivityLog {
  id: string;
  action: string;
  projectId: string;
  userId: string;
  createdAt: string;
  user: User;
  project?: ProjectListItem & { client?: Client };
}

export interface ProjectDetail extends ProjectRecord {
  client: Client;
  assets: Asset[];
  projectUsers: ProjectUserRow[];
  activityLogs: ActivityLog[];
}

export interface StatusCountRow {
  status: ProjectStatus;
  _count: { status: number };
}

export interface AnalyticsResponse {
  totalProjects: number;
  totalAssets: number;
  projectsByStatus: StatusCountRow[];
  assetsUploadedThisWeek: number;
  recentActivityLogs: ActivityLog[];
}

export interface CreateProjectPayload {
  name: string;
  clientId: string;
  description?: string;
  status?: ProjectStatus;
}
