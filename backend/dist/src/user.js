import express from "express";
import { prisma } from "./db.js";
import jwt from "jsonwebtoken";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { userMiddleware } from "./middleware.js";
import { taskBody } from "./types.js";
import { error } from "node:console";
const userRouter = express.Router();
const client = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_ID || '',
        secretAccessKey: process.env.S3_SECRET_KEY || ''
    },
    region: "ap-south-1"
});
userRouter.post('/login', async (req, res) => {
    const { address } = req.body;
    if (!address) {
        return res.json({
            message: 'please provide the address to login'
        });
    }
    let user = await prisma.user.findFirst({
        where: { address }
    });
    if (!user) {
        user = await prisma.user.create({
            data: {
                address
            }
        });
    }
    const token = jwt.sign({ userId: user.id }, process.env.USER_JWT_SECRET || '');
    return res.json({ token });
});
userRouter.get('/getSignedUrl', userMiddleware, async (req, res) => {
    const userId = req.userId;
    const key = `user/${userId}/${Date.now()}`;
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET || '',
        Key: key,
        ContentType: 'image/png'
    });
    const url = await getSignedUrl(client, command, { expiresIn: 5 * 3600 });
    res.json({
        url,
        key
    });
});
userRouter.post('/task', userMiddleware, async (req, res) => {
    const userId = req.userId;
    const parseBody = taskBody.safeParse(req.body);
    if (parseBody.error) {
        console.log(error);
        return res.json({
            message: 'input field not valid'
        });
    }
    console.log(parseBody.data);
    const { title, description, options } = parseBody.data;
    const response = await prisma.$transaction(async (tx) => {
        const task = await tx.task.create({
            data: {
                title,
                description,
                userId: Number(userId)
            }
        });
        await Promise.all(options.map(async (option) => await tx.option.create({
            data: {
                optionId: option.optionId,
                imageUrl: option.imageUrl,
                taskId: task.id
            }
        })));
        return task;
    });
    res.json({
        response
    });
});
userRouter.get('/allSubmissions', userMiddleware, async (req, res) => {
    const userId = req.userId;
    const { taskId } = req.body;
    if (!taskId) {
        return res.json({
            message: 'taskId not provided'
        });
    }
    const submissions = await prisma.submission.findMany({
        where: {
            taskId: Number(taskId)
        }
    });
    res.json({ submissions });
});
export default userRouter;
//# sourceMappingURL=user.js.map