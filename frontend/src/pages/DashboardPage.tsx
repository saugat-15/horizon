import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivities } from "@/hooks/useActivities";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useProjects } from "@/hooks/useProjects";
import { formatActivityTime } from "@/lib/format-date";
import { MetaSeparator } from "@/lib/meta-separator";
import {
  formatProjectStatus,
  projectStatusBadgeClass,
} from "@/lib/project-status";
import type { ActivityLog, AnalyticsResponse, ProjectListItem, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowUpRight, FolderKanban, Layers, Sparkles } from "lucide-react";

function countForStatus(
  rows: { status: ProjectStatus; _count: { status: number } }[],
  status: ProjectStatus,
): number {
  const row = rows.find((r) => r.status === status);
  return row?._count.status ?? 0;
}

function useDashboardData() {
  const analytics = useAnalytics();
  const projects = useProjects();
  const activities = useActivities();
  const summaryLoading =
    analytics.loading || projects.loading || activities.loading;
  const summaryError = analytics.error ?? projects.error ?? activities.error;
  return { analytics, projects, activities, summaryLoading, summaryError };
}

type DashboardData = ReturnType<typeof useDashboardData>;

function DashboardPageHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <p className="font-heading text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Horizon
        </p>
        <h1 className="font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Studio overview
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Live view of active engagements, deliverable volume, and the latest studio
          touchpoints across clients.
        </p>
      </div>
      <Link
        to="/projects/new"
        className={cn(buttonVariants({ size: "default" }), "shrink-0")}
      >
        New project
      </Link>
    </div>
  );
}

function DashboardLoadErrorCard({ message }: { message: string }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-destructive">Could not load data</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function DashboardPulseSkeletons() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} size="sm">
          <CardHeader className="pb-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
          </CardHeader>
        </Card>
      ))}
    </>
  );
}

function DashboardPulseMetrics({ data }: { data: AnalyticsResponse }) {
  return (
    <>
      <Card size="sm">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2 font-medium">
            <FolderKanban className="size-3.5 text-muted-foreground" aria-hidden />
            Active projects
          </CardDescription>
          <CardTitle className="text-2xl tabular-nums">{data.totalProjects}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-xs text-muted-foreground">
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <span>
              {countForStatus(data.projectsByStatus, "IN_PROGRESS")} in progress
            </span>
            <MetaSeparator />
            <span>{countForStatus(data.projectsByStatus, "IN_REVIEW")} in review</span>
          </span>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2 font-medium">
            <Layers className="size-3.5 text-muted-foreground" aria-hidden />
            Assets in library
          </CardDescription>
          <CardTitle className="text-2xl tabular-nums">{data.totalAssets}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-xs text-muted-foreground">
          {data.assetsUploadedThisWeek} new this week
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2 font-medium">
            <Sparkles className="size-3.5 text-muted-foreground" aria-hidden />
            Approved
          </CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {countForStatus(data.projectsByStatus, "APPROVED")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-xs text-muted-foreground">
          Client sign-off complete
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader className="pb-2">
          <CardDescription>Archived</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {countForStatus(data.projectsByStatus, "ARCHIVED")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-xs text-muted-foreground">
          Reference & records
        </CardContent>
      </Card>
    </>
  );
}

function DashboardPulseSection({ data }: { data: DashboardData }) {
  const { analytics, summaryLoading } = data;

  return (
    <section aria-label="Analytics summary" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Pulse
        </h2>
        {summaryLoading ? (
          <span className="text-xs text-muted-foreground">Syncing…</span>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryLoading ? (
          <DashboardPulseSkeletons />
        ) : analytics.data ? (
          <DashboardPulseMetrics data={analytics.data} />
        ) : null}
      </div>
    </section>
  );
}

function DashboardProjectCard({ project: p }: { project: ProjectListItem }) {
  const openLabel = `Open project: ${p.name}`;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="border-b">
        <div className="flex flex-col items-start justify-between gap-2">
          <Badge
            variant="outline"
            className={cn("shrink-0", projectStatusBadgeClass(p.status))}
          >
            {formatProjectStatus(p.status)}
          </Badge>
          <div className="min-w-0 space-y-1">
            <CardTitle className="truncate">{p.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {p.description ?? "No brief summary yet."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">{p.client.name}</p>
        <p className="inline-flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span>{p._count.assets} assets</span>
          <MetaSeparator />
          <span>{p._count.projectUsers} people</span>
        </p>
      </CardContent>
      <CardFooter className="justify-end border-t bg-transparent">
        <Link
          to={`/projects/${p.id}`}
          aria-label={openLabel}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1.5 has-data-[icon=inline-end]:pr-2",
          )}
        >
          Open
          <ArrowUpRight className="size-3.5" data-icon="inline-end" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}

function DashboardProjectsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-[75%]" />
            <Skeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DashboardProjectsSection({ data }: { data: DashboardData }) {
  const { projects } = data;

  return (
    <section aria-label="Projects" className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Projects
        </h2>
      </div>
      {projects.loading ? (
        <DashboardProjectsSkeleton />
      ) : projects.data && projects.data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.data.map((p) => (
            <DashboardProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No projects yet</CardTitle>
            <CardDescription>Create a project to see it appear in this grid.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              to="/projects/new"
              className={cn(buttonVariants({ size: "default" }))}
            >
              Create project
            </Link>
          </CardFooter>
        </Card>
      )}
    </section>
  );
}

function DashboardActivityRow({ activity: a }: { activity: ActivityLog }) {
  return (
    <li key={a.id} className="px-4 py-3">
      <p className="text-sm text-foreground">{a.action}</p>
      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <span>{a.user.name}</span>
        {a.project?.name ? (
          <>
            <MetaSeparator />
            <Link
              to={`/projects/${a.projectId}`}
              className="underline-offset-2 hover:underline"
            >
              {a.project.name}
            </Link>
          </>
        ) : null}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
        {formatActivityTime(a.createdAt)}
      </p>
    </li>
  );
}

function DashboardActivityFeed({ data }: { data: DashboardData }) {
  const { activities } = data;

  return (
    <aside aria-label="Recent activity" className="lg:sticky lg:top-24">
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Recent activity</CardTitle>
          <CardDescription>Latest studio actions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {activities.loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : activities.data && activities.data.length > 0 ? (
            <ScrollArea className="h-[min(70vh,520px)]">
              <ul className="divide-y">
                {activities.data.map((a) => (
                  <DashboardActivityRow key={a.id} activity={a} />
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="p-4 text-sm text-muted-foreground">No activity to show.</p>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}

export function DashboardPage() {
  const dashboard = useDashboardData();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10">
      <DashboardPageHeader />
      {dashboard.summaryError ? (
        <DashboardLoadErrorCard message={dashboard.summaryError} />
      ) : null}
      <DashboardPulseSection data={dashboard} />
      <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
        <DashboardProjectsSection data={dashboard} />
        <DashboardActivityFeed data={dashboard} />
      </div>
      <Separator className="opacity-60" />
    </div>
  );
}
