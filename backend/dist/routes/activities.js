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
        const activities = await prisma_1.default.activityLog.findMany({
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
        res.status(200).json(activities);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
