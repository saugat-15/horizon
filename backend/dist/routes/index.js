"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRoutes = exports.clientsRoutes = exports.assetsRoutes = exports.analyticsRoutes = exports.activityRoutes = exports.projectRoutes = void 0;
var project_1 = require("./project");
Object.defineProperty(exports, "projectRoutes", { enumerable: true, get: function () { return __importDefault(project_1).default; } });
var activities_1 = require("./activities");
Object.defineProperty(exports, "activityRoutes", { enumerable: true, get: function () { return __importDefault(activities_1).default; } });
var analytics_1 = require("./analytics");
Object.defineProperty(exports, "analyticsRoutes", { enumerable: true, get: function () { return __importDefault(analytics_1).default; } });
var assets_1 = require("./assets");
Object.defineProperty(exports, "assetsRoutes", { enumerable: true, get: function () { return __importDefault(assets_1).default; } });
var clients_1 = require("./clients");
Object.defineProperty(exports, "clientsRoutes", { enumerable: true, get: function () { return __importDefault(clients_1).default; } });
var users_1 = require("./users");
Object.defineProperty(exports, "usersRoutes", { enumerable: true, get: function () { return __importDefault(users_1).default; } });
