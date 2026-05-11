import express from "express";

const router = express.Router();

router.get("/", (req, res, next) => {
    res.send("activity route");
    next();
})

export default router;