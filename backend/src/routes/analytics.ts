import express from "express";

const router = express.Router();

router.get("/", (req, res, next) => {
    res.send("analytics route");
    next();
})

export default router;