import express from "express";
import prisma from "../lib/prisma";
import { Prisma, ProjectStatus } from "@prisma/client";


const router = express.Router();

const STATUS_LABEL: Record<ProjectStatus, string> = {
    IN_PROGRESS: "In progress",
    IN_REVIEW: "In review",
    APPROVED: "Approved",
    ARCHIVED: "Archived",
};

export function formatProjectStatus(status: ProjectStatus): string {
    return STATUS_LABEL[status];
}

router.get("/", async (_, res, next) => {
    try {
        const projects = await prisma.project.findMany(
            {
                include: {
                    client: true,
                    _count: {
                        select: { assets: true, projectUsers: true }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            }
        );
        res.json(projects)
    } catch (error) {
        console.error(error);
        next(error)
    }
});

router.get("/:id", async (req, res, next) => {
    const { id } = req.params
    if (!id) {
        return res.status(400).json({ error: "id is required" })
    }
    try {
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                client: true,
                assets: {
                    include: {
                        uploadedBy: true,
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                projectUsers: {
                    include: {
                        user: true,
                    }
                },
                activityLogs: {
                    include: {
                        user: true,
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 20,
                    //can add skip if pagination is required to view all activity logs
                }
            }
        })
        if (!project) {
            return res.status(404).json({ error: "Project not found" })
        }
        res.status(200).json(project)
    } catch (error) {
        console.error(error);
        next(error)
    }
})

router.post("/", async (req, res, next) => {
    const { name, clientId, description, status } = req.body
    if (!name || !clientId) {
        return res.status(400).json({ error: "name and clientId are required" })
    }
    try {
        const createProjectResponse = await prisma.project.create({
            data: {
                name,
                description,
                status,
                client: {
                    connect: {
                        id: clientId,
                    },
                },
            }
        })
        res.status(201).json(createProjectResponse)
    } catch (error) {
        console.error(error);
        next(error)
    }
})

router.post("/:id/members", async (req, res, next) => {
    const { id: projectId } = req.params;
    const { userId } = req.body as { userId?: string };
    if (!userId) {
        return res.status(400).json({ error: "userId is required" });
    }
    try {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        await prisma.projectUser.create({
            data: {
                projectId,
                userId,
            },
        });
        res.status(201).json({ projectId, userId });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return res.status(409).json({ error: "User is already assigned to this project" });
        }
        console.error(error);
        next(error);
    }
});

//patch

router.patch("/:id", async (req, res, next) => {
    const { status, userId } = req.body;
    const { id } = req.params;
    const validStatuses = ['IN_PROGRESS', 'IN_REVIEW', 'APPROVED', 'ARCHIVED']
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" })
    }
    try {
        const [updatedProject] = await prisma.$transaction([

            prisma.project.update({
                where: { id },
                data: { status },
            }),
            prisma.activityLog.create({
                data: {
                    action: `Status changed to ${formatProjectStatus(status)}`,
                    projectId: id,
                    userId,
                }
            })
        ]);
        res.status(200).json(updatedProject);
    } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: "Project not found" })
        }
        next(error);
    }
});

export default router;