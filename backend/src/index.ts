import express from "express";
import dotenv from "dotenv";
import cors from "cors";

//all route files
import { projectRoutes, activityRoutes, analyticsRoutes, assetsRoutes, clientsRoutes } from "./routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello World");
});

//health check
app.get("/health", (req, res) => {
    res.send({
        "status": "ok"
    });
})

//app routes
app.use("/api/projects", projectRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/assets", assetsRoutes);
app.use("/api/clients", clientsRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});