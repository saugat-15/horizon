import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

router.get("/", async (req, res, next) => {
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

export default router;