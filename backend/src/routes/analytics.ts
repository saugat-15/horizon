import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

router.get("/", async (_, res, next) => {
    try {
        const [totalProjects, totalAssets, projectsByStatus, assetsUploadedThisWeek, recentActivityLogs] = await Promise.all([
            prisma.project.count(),
            prisma.asset.count(),
            prisma.project.groupBy({
                by: ['status'],
                _count: { status: true }
            }),
            prisma.asset.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            }),
            prisma.activityLog.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    project: true,
                    user: true,
                }
            })
        ])
        res.status(200).json({
            totalProjects,
            totalAssets,
            projectsByStatus,
            assetsUploadedThisWeek,
            recentActivityLogs
        })
    } catch (error) {
        next(error);
    }
})

export default router;