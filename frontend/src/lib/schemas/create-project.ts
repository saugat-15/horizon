import { z } from "zod";

/**
 * Mirrors `enum ProjectStatus` in `backend/prisma/schema.prisma`.
 */
export const projectStatusSchema = z.enum([
  "IN_PROGRESS",
  "IN_REVIEW",
  "APPROVED",
  "ARCHIVED",
]);

/**
 * `POST /api/projects` body — aligned with Prisma `Project` in
 * `backend/prisma/schema.prisma` (required: `name`, `clientId`; optional `description`;
 * `status` with DB default `IN_PROGRESS`) and with `backend/src/routes/project.ts`
 * (`name` and `clientId` required at runtime).
 */
export const createProjectBodySchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  clientId: z.string().min(1, "Client is required"),
  description: z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? undefined : value)),
  status: projectStatusSchema,
});

export type CreateProjectBodyInput = z.input<typeof createProjectBodySchema>;
export type CreateProjectBodyOutput = z.output<typeof createProjectBodySchema>;
