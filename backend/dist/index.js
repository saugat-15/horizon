"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
//all route files
const routes_1 = require("./routes");
dotenv_1.default.config();
const PORT = process.env.PORT || 5001;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Hello World");
});
//health check
app.get("/health", (req, res) => {
    res.send({
        "status": "ok"
    });
});
//app routes
app.use("/api/projects", routes_1.projectRoutes);
app.use("/api/activities", routes_1.activityRoutes);
app.use("/api/analytics", routes_1.analyticsRoutes);
app.use("/api/assets", routes_1.assetsRoutes);
app.use("/api/clients", routes_1.clientsRoutes);
app.use("/api/users", routes_1.usersRoutes);
//global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong', message: err.message });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
