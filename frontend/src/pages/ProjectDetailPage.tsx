import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/hooks/useProject";
import { useUsers } from "@/hooks/useUsers";
import {
  addProjectMember,
  extractErrorMessage,
  updateProjectStatus,
} from "@/lib/api";
import { formatActivityTime } from "@/lib/format-date";
import { MetaSeparator } from "@/lib/meta-separator";
import {
  formatProjectStatus,
  PROJECT_STATUS_OPTIONS,
  projectStatusBadgeClass,
  STATUS_SELECT_ITEMS,
} from "@/lib/project-status";
import { projectStatusSchema } from "@/lib/schemas/create-project";
import type {
  ActivityLog,
  Asset,
  AssetType,
  ProjectDetail,
  ProjectStatus,
  ProjectUserRow,
  User,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowLeft, ExternalLink, MoreHorizontal } from "lucide-react";

function parseProjectStatus(value: unknown): ProjectStatus | null {
  const parsed = projectStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function assetTypeLabel(t: AssetType): string {
  switch (t) {
    case "IMAGE":
      return "Image";
    case "RENDER_360":
      return "360°";
    case "DOCUMENT":
      return "Document";
    case "VIDEO":
      return "Video";
    default:
      return t;
  }
}

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function MissingProjectParamsCard() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Missing project</CardTitle>
          <CardDescription>No project id in the URL.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function ProjectLoadErrorCard({ message }: { message: string }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-destructive">Could not load project</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function ProjectDetailHero({
  loading,
  data,
}: {
  loading: boolean;
  data: ProjectDetail | null;
}) {
  return (
    <div className="space-y-3">
      <Link
        to="/"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "w-fit gap-1 px-0 text-muted-foreground hover:text-foreground",
        )}
      >
        <ArrowLeft className="size-3.5" />
        Dashboard
      </Link>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-9 w-[min(100%,420px)]" />
          <Skeleton className="h-4 w-64" />
        </div>
      ) : data ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading max-w-3xl text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              {data.name}
            </h1>
            <Badge
              variant="outline"
              className={cn("shrink-0", projectStatusBadgeClass(data.status))}
            >
              {formatProjectStatus(data.status)}
            </Badge>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {data.description ?? "No description provided for this engagement."}
          </p>
          <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>Client</span>
            <MetaSeparator />
            <span className="font-medium text-foreground">{data.client.name}</span>
          </p>
        </>
      ) : null}
    </div>
  );
}

function ProjectStatusPanel({
  status,
  disabled,
  onPickStatus,
  statusError,
  showTeamHint,
}: {
  status: ProjectStatus;
  disabled: boolean;
  onPickStatus: (next: ProjectStatus) => void;
  statusError: string | null;
  showTeamHint: boolean;
}) {
  return (
    <div className="flex w-full max-w-xs flex-col gap-2 sm:items-end">
      <label
        htmlFor="project-status"
        className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
      >
        Status
      </label>
      <Select
        items={STATUS_SELECT_ITEMS}
        value={status}
        disabled={disabled}
        onValueChange={(value) => {
          const next = parseProjectStatus(value);
          if (next) onPickStatus(next);
        }}
      >
        <SelectTrigger id="project-status" className="w-full min-w-0 sm:w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PROJECT_STATUS_OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_SELECT_ITEMS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showTeamHint ? (
        <p className="text-xs text-muted-foreground">
          Add someone to the team below—status changes are logged against a team member.
        </p>
      ) : null}
      {statusError ? <p className="text-xs text-destructive">{statusError}</p> : null}
    </div>
  );
}

function ProjectAssetCard({ asset }: { asset: Asset }) {
  const menuLabel = `Open menu for ${asset.name}`;

  return (
    <Card className="overflow-hidden pt-0">
      <div className="relative aspect-4/3 bg-muted">
        {asset.fileType === "IMAGE" ? (
          <img
            src={asset.fileUrl}
            alt={`Preview: ${asset.name}`}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            {assetTypeLabel(asset.fileType)}
          </div>
        )}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="icon-xs"
                  variant="secondary"
                  className="bg-background/90 shadow-sm backdrop-blur"
                  aria-label={menuLabel}
                />
              }
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                render={
                  <a
                    href={asset.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex cursor-default items-center gap-2"
                  />
                }
              >
                Open file
                <ExternalLink className="size-3.5 opacity-60" aria-hidden />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-sm leading-snug">{asset.name}</CardTitle>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {assetTypeLabel(asset.fileType)}
          </Badge>
        </div>
        <CardDescription className="flex flex-wrap items-center gap-1.5 text-xs">
          <span>{asset.uploadedBy.name}</span>
          <MetaSeparator />
          <span>{formatActivityTime(asset.createdAt)}</span>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function ProjectAssetsSection({ assets }: { assets: Asset[] }) {
  return (
    <section aria-label="Assets" className="space-y-4">
      <div className="flex items-end justify-between gap-2">
        <h2 className="font-heading text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Assets
        </h2>
        <span className="text-xs text-muted-foreground tabular-nums">{assets.length} total</span>
      </div>
      {assets.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No assets yet</CardTitle>
            <CardDescription>
              Uploads will appear here once they are linked to this project.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <ProjectAssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProjectTeamMemberRow({ row }: { row: ProjectUserRow }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Avatar className="size-9">
        <AvatarImage src={row.user.avatarUrl ?? undefined} alt="" />
        <AvatarFallback className="text-xs">{initialsFromName(row.user.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{row.user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{row.user.email}</p>
      </div>
      <Badge variant="secondary" className="shrink-0 text-[10px]">
        {row.user.role}
      </Badge>
    </div>
  );
}

type UsersQuerySnapshot = {
  data: User[] | null;
  loading: boolean;
  error: string | null;
};

function useProjectTeamMembers(
  projectId: string,
  projectUsers: ProjectUserRow[],
  users: UsersQuerySnapshot,
  refetch: () => void,
) {
  const [userToAdd, setUserToAdd] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const memberIds = useMemo(
    () => new Set(projectUsers.map((row) => row.userId)),
    [projectUsers],
  );

  const availableUsers = useMemo(
    () => (users.data ?? []).filter((u) => !memberIds.has(u.id)),
    [users.data, memberIds],
  );

  const userAddSelectItems = useMemo(
    () => Object.fromEntries(availableUsers.map((u) => [u.id, u.name])),
    [availableUsers],
  );

  const addMember = () => {
    if (!userToAdd) return;
    setAddLoading(true);
    setAddError(null);
    void addProjectMember(projectId, userToAdd)
      .then(() => {
        setUserToAdd("");
        refetch();
      })
      .catch((err: unknown) => {
        setAddError(extractErrorMessage(err));
      })
      .finally(() => {
        setAddLoading(false);
      });
  };

  return {
    users,
    availableUsers,
    userAddSelectItems,
    userToAdd,
    setUserToAdd,
    addLoading,
    addError,
    addMember,
  };
}

function ProjectTeamSection({
  projectId,
  projectUsers,
  users,
  refetch,
}: {
  projectId: string;
  projectUsers: ProjectUserRow[];
  users: UsersQuerySnapshot;
  refetch: () => void;
}) {
  const team = useProjectTeamMembers(projectId, projectUsers, users, refetch);

  return (
    <section aria-label="Team" className="space-y-4">
      <h2 className="font-heading text-sm font-medium tracking-wide text-muted-foreground uppercase">
        Team
      </h2>
      <Card>
        <CardContent className="divide-y p-0">
          {projectUsers.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No team members assigned yet.</p>
          ) : (
            projectUsers.map((row) => <ProjectTeamMemberRow key={`${row.projectId}-${row.userId}`} row={row} />)
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3 border-t bg-muted/30">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Add team member
          </p>
          {team.users.error ? (
            <p className="text-xs text-destructive">{team.users.error}</p>
          ) : null}
          {team.users.loading ? (
            <Skeleton className="h-9 w-full" />
          ) : team.users.data && team.users.data.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No users in the workspace. Seed or create users in the database first.
            </p>
          ) : team.availableUsers.length === 0 ? (
            <p className="text-xs text-muted-foreground">Everyone is already on this project.</p>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor="add-member" className="sr-only">
                  User to add
                </Label>
                <Select
                  items={team.userAddSelectItems}
                  value={team.userToAdd || undefined}
                  onValueChange={(v) =>
                    team.setUserToAdd(typeof v === "string" ? v : "")
                  }
                >
                  <SelectTrigger id="add-member" className="w-full">
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {team.availableUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                disabled={!team.userToAdd || team.addLoading}
                onClick={team.addMember}
              >
                {team.addLoading ? "Adding…" : "Add"}
              </Button>
            </div>
          )}
          {team.addError ? (
            <p className="text-xs text-destructive" role="alert">
              {team.addError}
            </p>
          ) : null}
        </CardFooter>
      </Card>
    </section>
  );
}

function ProjectActivitySection({ logs }: { logs: ActivityLog[] }) {
  return (
    <section aria-label="Activity" className="space-y-4">
      <h2 className="font-heading text-sm font-medium tracking-wide text-muted-foreground uppercase">
        Activity
      </h2>
      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <ul className="divide-y">
              {logs.map((log) => (
                <li key={log.id} className="flex gap-3 px-4 py-3">
                  <MetaSeparator className="mt-0.5 size-1.5 shrink-0 fill-foreground/30 text-foreground/30" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm text-foreground">{log.action}</p>
                    <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{log.user.name}</span>
                      <MetaSeparator />
                      <span>{formatActivityTime(log.createdAt)}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refetch } = useProject(id);
  const users = useUsers(Boolean(data));
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const actorUserId = useMemo(() => {
    if (!data) return undefined;
    const admin = data.projectUsers.find((row) => row.user.role === "ADMIN");
    return admin?.userId ?? data.projectUsers[0]?.userId;
  }, [data]);

  const handleStatusChange = async (next: ProjectStatus) => {
    if (!id || !data || next === data.status) return;
    if (!actorUserId) {
      setStatusError("No team member on file to attribute this change to.");
      return;
    }
    setStatusSaving(true);
    setStatusError(null);
    try {
      await updateProjectStatus(id, next, actorUserId);
      refetch();
    } catch (err: unknown) {
      setStatusError(extractErrorMessage(err));
    } finally {
      setStatusSaving(false);
    }
  };

  if (!id) {
    return <MissingProjectParamsCard />;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <ProjectDetailHero loading={loading} data={data} />
        {data ? (
          <ProjectStatusPanel
            status={data.status}
            disabled={statusSaving || !actorUserId}
            onPickStatus={(next) => {
              void handleStatusChange(next);
            }}
            statusError={statusError}
            showTeamHint={!actorUserId}
          />
        ) : null}
      </div>

      {error ? <ProjectLoadErrorCard message={error} /> : null}

      {data ? (
        <>
          <ProjectAssetsSection assets={data.assets} />
          <div className="grid gap-8 lg:grid-cols-2">
            <ProjectTeamSection
              projectId={id}
              projectUsers={data.projectUsers}
              users={users}
              refetch={refetch}
            />
            <ProjectActivitySection logs={data.activityLogs} />
          </div>
          <Separator className="opacity-60" />
        </>
      ) : null}
    </div>
  );
}
