"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDb = exports.seedProjects = exports.seedUsers = exports.seedClients = void 0;
const prisma_1 = __importDefault(require("./prisma"));
const projects = [
    {
        clientId: 1,
        name: "Pacific Row — marketing stills & dusk variants",
        description: "Hero exterior and interior CGI for sales gallery and MLS; coordinated RCX lighting passes with dusk look-development variants and broker-ready crops.",
        status: "IN_PROGRESS",
        memberEmails: [
            "darren.mitchell@acmecreative.io",
            "jon.rivers@acmecreative.io",
            "brendan.okonkwo@acmecreative.io",
        ],
    },
    {
        clientId: 2,
        name: "South Quad STEM Hub — board review package",
        description: "Study-model views and diagram overlays for trustee review; RCX packaging annotations and revision lane for campus planning feedback.",
        status: "IN_REVIEW",
        memberEmails: [
            "darren.mitchell@acmecreative.io",
            "saugat.thapa@acmecreative.io",
        ],
    },
    {
        clientId: 3,
        name: "Harborline Tower — competition imagery",
        description: "Finalist visualization set: aerial context, podium lobby sequence, amenity deck; approved by Frame for submission close-out.",
        status: "APPROVED",
        memberEmails: [
            "jon.rivers@acmecreative.io",
            "brendan.okonkwo@acmecreative.io",
            "saugat.thapa@acmecreative.io",
        ],
    },
    {
        clientId: 4,
        name: "Central Corridor LRT — phase 1 visualization archive",
        description: "Early fly-through and station hero stills for public consultation; phase concluded — RCX deliverables archived for agency records.",
        status: "ARCHIVED",
        memberEmails: ["darren.mitchell@acmecreative.io", "jon.rivers@acmecreative.io"],
    },
];
const users = [
    {
        name: "Darren",
        email: "darren.mitchell@acmecreative.io",
        role: "ADMIN",
    },
    {
        name: "Jon",
        email: "jon.rivers@acmecreative.io",
        role: "MEMBER",
    },
    {
        name: "Brendan",
        email: "brendan.okonkwo@acmecreative.io",
        role: "MEMBER",
    },
    {
        name: "Saugat",
        email: "saugat.thapa@acmecreative.io",
        role: "MEMBER",
    },
];
const clients = [
    { id: "1", name: "Northshore Capital Partners", logoUrl: null },
    { id: "2", name: "Bennett University — Campus Planning", logoUrl: null },
    { id: "3", name: "Frame Architecture LLP", logoUrl: null },
    { id: "4", name: "CivicWorks Transit Authority", logoUrl: null },
];
const seedClients = async () => {
    for (const client of clients) {
        const existingClient = await prisma_1.default.client.findUnique({
            where: {
                id: client.id,
            },
        });
        if (existingClient) {
            continue;
        }
        await prisma_1.default.client.create({
            data: {
                id: client.id,
                name: client.name,
                logoUrl: client.logoUrl ?? undefined,
            },
        });
    }
    console.log("Clients seeded successfully");
};
exports.seedClients = seedClients;
const seedUsers = async () => {
    for (const user of users) {
        const existingUser = await prisma_1.default.user.findUnique({
            where: {
                email: user.email,
            },
        });
        if (existingUser) {
            continue;
        }
        await prisma_1.default.user.create({
            data: {
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    console.log("Users seeded successfully");
};
exports.seedUsers = seedUsers;
const seedProjects = async () => {
    for (const project of projects) {
        const createdProject = await prisma_1.default.project.create({
            data: {
                name: project.name,
                description: project.description,
                status: project.status,
                client: {
                    connect: {
                        id: project.clientId.toString(),
                    },
                },
            },
        });
        //seed project users
        for (const memberEmail of project.memberEmails) {
            const existingUser = await prisma_1.default.user.findUnique({
                where: {
                    email: memberEmail,
                },
            });
            if (!existingUser) {
                console.log(`User ${memberEmail} not found`);
                continue;
            }
            await prisma_1.default.projectUser.create({
                data: {
                    project: {
                        connect: {
                            id: createdProject.id,
                        },
                    },
                    user: {
                        connect: {
                            email: memberEmail,
                        },
                    },
                },
            });
        }
    }
    console.log("Projects seeded successfully");
};
exports.seedProjects = seedProjects;
const seedDb = async () => {
    try {
        console.log("Seeding clients...");
        await (0, exports.seedClients)();
        console.log("Seeding users...");
        await (0, exports.seedUsers)();
        console.log("Seeding projects...");
        await (0, exports.seedProjects)();
        console.log("Seeding complete");
    }
    catch (error) {
        console.error(error);
        console.log("Error seeding users");
    }
};
exports.seedDb = seedDb;
(0, exports.seedDb)()
    .catch((e) => {
    console.error(e);
})
    .finally(async () => {
    await prisma_1.default.$disconnect();
});
