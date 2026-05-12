import { Link, useNavigate } from "react-router-dom";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PROJECT_STATUS_OPTIONS,
  STATUS_SELECT_ITEMS,
} from "@/lib/project-status";
import { projectStatusSchema } from "@/lib/schemas/create-project";
import type { ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useNewProjectForm } from "@/hooks/useNewProjectForm";

function parseProjectStatus(value: unknown): ProjectStatus | null {
  const parsed = projectStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

type NewProjectForm = ReturnType<typeof useNewProjectForm>;

function NewProjectHeader() {
  return (
    <div className="mb-8 space-y-3">
      <Link
        to="/"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "w-fit gap-1 px-0 text-muted-foreground hover:text-foreground",
        )}
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Dashboard
      </Link>
      <div>
        <h1 className="font-heading text-3xl font-medium tracking-tight text-foreground">
          New project
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Register a new engagement for the studio. You can refine the brief later from
          the project workspace.
        </p>
      </div>
    </div>
  );
}

function NewProjectFormFields({ form }: { form: NewProjectForm }) {
  const { clients, fieldErrors, clearFieldError } = form;

  if (clients.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="project-name">
          Project name{" "}
          <span className="text-destructive" aria-hidden>
            *
          </span>
        </Label>
        <Input
          id="project-name"
          name="name"
          value={form.name}
          onChange={(e) => {
            form.setName(e.target.value);
            if (fieldErrors.name) clearFieldError("name");
          }}
          placeholder="e.g. Pacific Row — marketing stills"
          autoComplete="off"
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "project-name-error" : undefined}
        />
        {fieldErrors.name ? (
          <p id="project-name-error" className="text-xs text-destructive" role="alert">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="client">
          Client{" "}
          <span className="text-destructive" aria-hidden>
            *
          </span>
        </Label>
        <Select
          items={form.clientSelectItems}
          value={form.clientId || undefined}
          onValueChange={(v) => {
            form.setClientId(typeof v === "string" ? v : "");
            if (fieldErrors.clientId) clearFieldError("clientId");
          }}
          disabled={!clients.data?.length}
        >
          <SelectTrigger
            id="client"
            className="w-full"
            aria-invalid={Boolean(fieldErrors.clientId)}
            aria-describedby={fieldErrors.clientId ? "client-error" : undefined}
          >
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.data?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.clientId ? (
          <p id="client-error" className="text-xs text-destructive" role="alert">
            {fieldErrors.clientId}
          </p>
        ) : null}
        {clients.error ? <p className="text-xs text-destructive">{clients.error}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Brief / description</Label>
        <Textarea
          id="description"
          name="description"
          value={form.description}
          onChange={(e) => {
            form.setDescription(e.target.value);
            if (fieldErrors.description) clearFieldError("description");
          }}
          placeholder="Scope, milestones, or creative direction…"
          rows={4}
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby={fieldErrors.description ? "description-error" : undefined}
        />
        {fieldErrors.description ? (
          <p id="description-error" className="text-xs text-destructive" role="alert">
            {fieldErrors.description}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="initial-status">Initial status</Label>
        <Select
          items={STATUS_SELECT_ITEMS}
          value={form.status}
          onValueChange={(v) => {
            const next = parseProjectStatus(v);
            if (next) {
              form.setStatus(next);
              if (fieldErrors.status) clearFieldError("status");
            }
          }}
        >
          <SelectTrigger
            id="initial-status"
            className="w-full"
            aria-invalid={Boolean(fieldErrors.status)}
            aria-describedby={fieldErrors.status ? "status-error" : undefined}
          >
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
        {fieldErrors.status ? (
          <p id="status-error" className="text-xs text-destructive" role="alert">
            {fieldErrors.status}
          </p>
        ) : null}
      </div>
    </>
  );
}

function NewProjectFormCard({ form }: { form: NewProjectForm }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project details</CardTitle>
        <CardDescription>
          Enter the basics — you can refine the brief and assign the team
          from the project workspace.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit} noValidate>
        <CardContent className="space-y-6">
          <NewProjectFormFields form={form} />
          {form.error ? <p className="text-sm text-destructive">{form.error}</p> : null}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t">
          <Link
            to="/"
            className={cn(buttonVariants({ variant: "outline", size: "default" }))}
          >
            Cancel
          </Link>
          <Button type="submit" disabled={form.submitting || form.clients.loading}>
            {form.submitting ? "Creating…" : "Create project"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function NewProjectPage() {
  const navigate = useNavigate();
  const form = useNewProjectForm(navigate);

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-10">
      <NewProjectHeader />
      <NewProjectFormCard form={form} />
    </div>
  );
}
