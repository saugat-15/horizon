import axios, { type AxiosError } from "axios";

import type {
  ActivityLog,
  AnalyticsResponse,
  Asset,
  AssetType,
  Client,
  CreateProjectPayload,
  ProjectDetail,
  ProjectListItem,
  ProjectRecord,
  ProjectStatus,
  User,
} from "@/lib/types";

const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ error?: string; message?: string }>;
    const fromBody =
      ax.response?.data?.message ?? ax.response?.data?.error ?? ax.message;
    if (fromBody) return fromBody;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

export { extractErrorMessage };

export async function fetchAnalytics(): Promise<AnalyticsResponse> {
  const { data } = await api.get<AnalyticsResponse>("/api/analytics");
  return data;
}

export async function fetchProjects(): Promise<ProjectListItem[]> {
  const { data } = await api.get<ProjectListItem[]>("/api/projects");
  return data;
}

export async function fetchProject(id: string): Promise<ProjectDetail> {
  const { data } = await api.get<ProjectDetail>(`/api/projects/${id}`);
  return data;
}

export async function fetchActivities(): Promise<ActivityLog[]> {
  const { data } = await api.get<ActivityLog[]>("/api/activities");
  return data;
}

export async function fetchClients(): Promise<Client[]> {
  const { data } = await api.get<Client[]>("/api/clients");
  return data;
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/api/users");
  return data;
}

export async function addProjectMember(
  projectId: string,
  userId: string,
): Promise<void> {
  await api.post(`/api/projects/${projectId}/members`, { userId });
}

export async function createProject(
  payload: CreateProjectPayload,
): Promise<ProjectRecord> {
  const { data } = await api.post<ProjectRecord>("/api/projects", payload);
  return data;
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus,
  userId: string,
): Promise<ProjectRecord> {
  const { data } = await api.patch<ProjectRecord>(`/api/projects/${projectId}`, {
    status,
    userId,
  });
  return data;
}

export async function requestAssetSasToken(payload: {
  projectId: string;
  fileName: string;
  fileType: AssetType;
}): Promise<{ sasUrl: string; blobName: string }> {
  const { data } = await api.post<{ sasUrl: string; blobName: string }>(
    "/api/assets/sas-token",
    payload,
  );
  return data;
}

export async function createAssetRecord(payload: {
  projectId: string;
  uploadedBy: string;
  name: string;
  fileType: AssetType;
  blobName: string;
}): Promise<Asset> {
  const { data } = await api.post<Asset>("/api/assets", payload);
  return data;
}
