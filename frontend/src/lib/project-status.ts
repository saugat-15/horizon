import type { ProjectStatus } from "@/lib/types";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  APPROVED: "Approved",
  ARCHIVED: "Archived",
};

/** Stable ordering for selects and filters. */
export const PROJECT_STATUS_OPTIONS: readonly ProjectStatus[] = [
  "IN_PROGRESS",
  "IN_REVIEW",
  "APPROVED",
  "ARCHIVED",
] as const;

/** Base UI Select `items`: value (enum) → visible label. */
export const STATUS_SELECT_ITEMS: Record<ProjectStatus, string> = {
  IN_PROGRESS: STATUS_LABEL.IN_PROGRESS,
  IN_REVIEW: STATUS_LABEL.IN_REVIEW,
  APPROVED: STATUS_LABEL.APPROVED,
  ARCHIVED: STATUS_LABEL.ARCHIVED,
};

export function formatProjectStatus(status: ProjectStatus): string {
  return STATUS_LABEL[status];
}

/** Tailwind classes for status chips (used with `Badge` + `variant="outline"`). */
export function projectStatusBadgeClass(status: ProjectStatus): string {
  const map: Record<ProjectStatus, string> = {
    IN_PROGRESS:
      "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/50 dark:text-sky-50",
    IN_REVIEW:
      "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-50",
    APPROVED:
      "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-50",
    ARCHIVED: "border-border bg-muted text-muted-foreground",
  };
  return map[status];
}
