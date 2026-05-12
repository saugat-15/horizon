"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = express_1.default.Router();
router.get("/", async (_, res, next) => {
    try {
        const [totalProjects, totalAssets, projectsByStatus, assetsUploadedThisWeek, recentActivityLogs] = await Promise.all([
            prisma_1.default.project.count(),
            prisma_1.default.asset.count(),
            prisma_1.default.project.groupBy({
                by: ['status'],
                _count: { status: true }
            }),
            prisma_1.default.asset.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            }),
            prisma_1.default.activityLog.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    project: true,
                    user: true,
                }
            })
        ]);
        res.status(200).json({
            totalProjects,
            totalAssets,
            projectsByStatus,
            assetsUploadedThisWeek,
            recentActivityLogs
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
