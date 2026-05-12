import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

router.get("/", async (_, res, next) => {
    try {
        const activities = await prisma.activityLog.findMany({
            include: {
                user: true,
                project: {
                    include: {
                        client: true,
                    },
                },
            },
            take: 30,
            orderBy: { createdAt: "desc" }
        });
        res.status(200).json(activities)
    } catch (error) {
        next(error);
    }
})

export default router;