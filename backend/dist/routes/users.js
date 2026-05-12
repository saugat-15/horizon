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
        const users = await prisma_1.default.user.findMany({
            orderBy: { name: "asc" },
        });
        res.json(users);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
exports.default = router;
