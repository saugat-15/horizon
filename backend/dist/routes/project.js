"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.get("/", async (_, res, next) => {
    try {
        const projects = await prisma_1.default.project.findMany({
            include: {
                client: true,
                _count: {
                    select: { assets: true, projectUsers: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(projects);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
router.get("/:id", async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "id is required" });
    }
    try {
        const project = await prisma_1.default.project.findUnique({
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
        });
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        res.status(200).json(project);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
router.post("/", async (req, res, next) => {
    const { name, clientId, description, status } = req.body;
    if (!name || !clientId) {
        return res.status(400).json({ error: "name and clientId are required" });
    }
    try {
        const createProjectResponse = await prisma_1.default.project.create({
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
        });
        res.status(201).json(createProjectResponse);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
router.post("/:id/members", async (req, res, next) => {
    const { id: projectId } = req.params;
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: "userId is required" });
    }
    try {
        const project = await prisma_1.default.project.findUnique({ where: { id: projectId } });
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        await prisma_1.default.projectUser.create({
            data: {
                projectId,
                userId,
            },
        });
        res.status(201).json({ projectId, userId });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
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
    const validStatuses = ['IN_PROGRESS', 'IN_REVIEW', 'APPROVED', 'ARCHIVED'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
    }
    try {
        const [updatedProject] = await prisma_1.default.$transaction([
            prisma_1.default.project.update({
                where: { id },
                data: { status },
            }),
            prisma_1.default.activityLog.create({
                data: {
                    action: `Status changed to ${status}`,
                    projectId: id,
                    userId,
                }
            })
        ]);
        res.status(200).json(updatedProject);
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: "Project not found" });
        }
        next(error);
    }
});
exports.default = router;
