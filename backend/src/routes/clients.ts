import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const clients = await prisma.client.findMany({
            include: {
                _count: {
                    select: { projects: true }
                }
            }
        })
        res.json(clients);
    } catch (error) {
        console.error(error);
        next(error);
    }
})

export default router;