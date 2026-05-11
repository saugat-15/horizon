import express from "express";
import dotenv from "dotenv";
import cors from "cors";

//all route files
import { projectRoutes, activityRoutes, analyticsRoutes, assetsRoutes, clientsRoutes } from "./routes";

dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();
app.use(cors());
app.use(express.json());

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

//global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something went wrong', message: err.message })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});