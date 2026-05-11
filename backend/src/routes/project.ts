import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Project route");
});

export default router;