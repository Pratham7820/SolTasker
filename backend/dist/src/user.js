import express from "express";
import { prisma } from "./db.js";
import jwt from "jsonwebtoken";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { userMiddleware } from "./middleware.js";
import { taskBody } from "./types.js";
import { error } from "node:console";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { connection } from "./index.js";
const userRouter = express.Router();
const client = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_ID || '',
        secretAccessKey: process.env.S3_SECRET_KEY || ''
    },
    region: "ap-south-1"
});
const message = "this is sign in message for user";
const msg = new TextEncoder().encode(message);
userRouter.post('/login', async (req, res) => {
    const { address, signature } = req.body;
    if (!address) {
        return res.json({
            message: 'please provide the address to login'
        });
    }
    if (!signature) {
        return res.json({
            message: 'please authenticate your account'
        });
    }
    const sign = bs58.decode(signature);
    const verify = nacl.sign.detached.verify(msg, sign, new PublicKey(address).toBytes());
    if (!verify) {
        return res.json({
            message: 'authentication failed'
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
    const { title, description, options, signature } = parseBody.data;
    let txn = null;
    for (let i = 0; i < 8; i++) {
        txn = await connection.getParsedTransaction(signature, {
            maxSupportedTransactionVersion: 1,
            commitment: "confirmed",
        });
        if (txn)
            break;
        await new Promise(res => setTimeout(res, 1000));
    }
    if (!txn) {
        return res.status(400).json({
            message: "Transaction not found after retries"
        });
    }
    const response = await prisma.$transaction(async (tx) => {
        const task = await tx.task.create({
            data: {
                title,
                description,
                userId: Number(userId)
            }
        });
        for (const option of options) {
            await tx.option.create({
                data: {
                    optionId: option.optionId,
                    imageUrl: option.imageUrl,
                    taskId: task.id
                }
            });
        }
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
userRouter.get('/allTask', userMiddleware, async (req, res) => {
    const userId = req.userId;
    const tasks = await prisma.task.findMany({
        where: {
            userId: Number(userId)
        }
    });
    return res.json({ tasks });
});
export default userRouter;
//# sourceMappingURL=user.js.map