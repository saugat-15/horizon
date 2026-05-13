import { Role } from "@prisma/client";
import prisma from "./prisma";
import type { ProjectStatus } from "@prisma/client";

const projects: Array<{
    clientId: number;
    name: string;
    description: string;
    status: ProjectStatus;
    memberEmails: string[];
}> = [
        {
            clientId: 1,
            name: "Pacific Row — marketing stills & dusk variants",
            description:
                "Hero exterior and interior CGI for sales gallery and MLS; coordinated RCX lighting passes with dusk look-development variants and broker-ready crops.",
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
            description:
                "Study-model views and diagram overlays for trustee review; RCX packaging annotations and revision lane for campus planning feedback.",
            status: "IN_REVIEW",
            memberEmails: [
                "darren.mitchell@acmecreative.io",
                "saugat.giri@acmecreative.io",
            ],
        },
        {
            clientId: 3,
            name: "Harborline Tower — competition imagery",
            description:
                "Finalist visualization set: aerial context, podium lobby sequence, amenity deck; approved by Frame for submission close-out.",
            status: "APPROVED",
            memberEmails: [
                "jon.rivers@acmecreative.io",
                "brendan.okonkwo@acmecreative.io",
                "saugat.giri@acmecreative.io",
            ],
        },
        {
            clientId: 4,
            name: "Central Corridor LRT — phase 1 visualization archive",
            description:
                "Early fly-through and station hero stills for public consultation; phase concluded — RCX deliverables archived for agency records.",
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
        email: "saugat.giri@acmecreative.io",
        role: "MEMBER",
    },
];

const clients = [
    { id: "1", name: "Northshore Capital Partners", logoUrl: null as string | null },
    { id: "2", name: "Bennett University — Campus Planning", logoUrl: null },
    { id: "3", name: "Frame Architecture LLP", logoUrl: null },
    { id: "4", name: "CivicWorks Transit Authority", logoUrl: null },
];

export const seedClients = async () => {
    for (const client of clients) {
        const existingClient = await prisma.client.findUnique({
            where: {
                id: client.id,
            },
        });
        if (existingClient) {
            continue;
        }
        await prisma.client.create({
            data: {
                id: client.id,
                name: client.name,
                logoUrl: client.logoUrl ?? undefined,
            },
        });
    }
    console.log("Clients seeded successfully");
}

export const seedUsers = async () => {
    for (const user of users) {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: user.email,
            },
        });
        if (existingUser) {
            continue;
        }
        await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                role: user.role as Role,
            },
        });
    }
    console.log("Users seeded successfully");
}

export const seedProjects = async () => {
    for (const project of projects) {
        const createdProject = await prisma.project.create({
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
            const existingUser = await prisma.user.findUnique({
                where: {
                    email: memberEmail,
                },
            });
            if (!existingUser) {
                console.log(`User ${memberEmail} not found`);
                continue;
            }
            await prisma.projectUser.create({
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
}



export const seedDb = async () => {
    try {
        console.log("Seeding clients...");
        await seedClients();
        console.log("Seeding users...");
        await seedUsers();
        console.log("Seeding projects...");
        await seedProjects();
        console.log("Seeding complete");
    } catch (error) {
        console.error(error);
        console.log("Error seeding users");
    }
};

seedDb()
    .catch((e) => {
        console.error(e)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })