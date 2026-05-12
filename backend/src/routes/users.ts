import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

router.get("/", async (_, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

export default router;
