import express from "express";
import { generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } from '@azure/storage-blob'
import prisma from "../lib/prisma";

const router = express.Router();

router.get("/:projectId", async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const projectAssets = await prisma.asset.findMany({
            where: {
                projectId,
            },
            include: { uploadedBy: true },
            orderBy: { createdAt: "desc" }
        })
        res.status(200).json(projectAssets);
    } catch (error) {
        next(error);
    }
})

router.post("/sas-token", async (req, res, next) => {
    try {
        const { projectId, fileName, fileType } = req.body;


        if (!projectId || !fileName || !fileType) throw new Error("Required parameters are missing");
        const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!
        const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!
        const containerName = process.env.AZURE_STORAGE_CONTAINER!
        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey)

        const blobName = `${projectId}/${Date.now()}-${fileName}`;
        const sasToken = generateBlobSASQueryParameters({
            containerName,
            blobName,
            permissions: BlobSASPermissions.parse("w"), // write only
            expiresOn: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        }, sharedKeyCredential).toString();
        const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`
        res.status(200).json({ sasUrl, blobName })
    } catch (error) {
        next(error);
    }
})

router.post("/", async (req, res, next) => {
    try {
        const { projectId, uploadedBy, name, fileUrl, fileType } = req.body;
        if (!projectId || !uploadedBy || !name || !fileUrl) throw new Error("Required fields missing.");

        const [asset] = await prisma.$transaction([
            prisma.asset.create({
                data: {
                    name,
                    uploadedById: uploadedBy,
                    fileUrl,
                    projectId,
                    fileType
                }
            }),
            prisma.activityLog.create({
                data: {
                    action: `Asset ${name} uploaded`,
                    projectId,
                    userId: uploadedBy,
                }
            })
        ]);
        res.status(201).json(asset);

    } catch (error) {
        next(error);
    }
})

export default router;