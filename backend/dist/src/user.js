import express from "express";
import { prisma } from "./db.js";
import jwt from "jsonwebtoken";
import { CopyObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { userMiddleware } from "./middleware.js";
import { taskBody } from "./types.js";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { connection } from "./index.js";
import { CLOUDFRONT_URL, S3_ACCESS_ID, S3_BUCKET, S3_SECRET_KEY, USER_JWT_SECRET } from "./config.js";
const userRouter = express.Router();
const client = new S3Client({
    credentials: {
        accessKeyId: S3_ACCESS_ID,
        secretAccessKey: S3_SECRET_KEY
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
    const token = jwt.sign({ userId: user.id }, USER_JWT_SECRET);
    return res.json({ token });
});
userRouter.get('/getSignedUrl', userMiddleware, async (req, res) => {
    const userId = req.userId;
    const key = `temp/${userId}/${Date.now()}`;
    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
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
        console.log(parseBody.error);
        return res.status(400).json({ message: 'input field not valid' });
    }
    const { title, description, options, signature } = parseBody.data;
    try {
        // Solana tx check
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
            return res.status(400).json({ message: "Transaction not found after retries" });
        }
        // Prisma transaction
        const response = await prisma.$transaction(async (tx) => {
            const task = await tx.task.create({
                data: {
                    title,
                    description,
                    userId: Number(userId)
                }
            });
            const permOptions = await Promise.all(options.map(async (e) => {
                const key = `user/${userId}/${task.id}/${e.optionId}`;
                const command = new CopyObjectCommand({
                    Bucket: S3_BUCKET,
                    CopySource: `${S3_BUCKET}/${e.key}`,
                    Key: key
                });
                await client.send(command);
                return { ...e, optionId: `${e.optionId}`, imageUrl: `${CLOUDFRONT_URL}/${key}` };
            }));
            await Promise.all(permOptions.map(async (option) => {
                await tx.option.create({
                    data: {
                        optionId: Number(option.optionId),
                        imageUrl: option.imageUrl,
                        taskId: task.id
                    }
                });
            }));
            return task;
        }, { timeout: 15000, maxWait: 10000 });
        res.json({ response });
    }
    catch (err) {
        console.error('[TASK CREATE ERROR]', err);
        res.status(500).json({ message: 'Something went wrong', error: err });
    }
});
userRouter.get('/task/:taskId', userMiddleware, async (req, res) => {
    const userId = req.userId;
    const taskId = req.params.taskId;
    if (!taskId) {
        return res.json({
            message: 'taskId not provided'
        });
    }
    const task = await prisma.task.findFirst({
        where: {
            id: Number(taskId),
            userId: Number(userId)
        },
        include: {
            options: true
        }
    });
    if (!task) {
        return res.json({
            message: 'no task exist as such'
        });
    }
    const submissions = await prisma.submission.findMany({
        where: {
            taskId: Number(taskId)
        },
        include: { option: true }
    });
    const arr = new Array(task.options.length).fill(0);
    submissions.forEach((sub) => {
        const index = sub.option.optionId - 1;
        if (index >= 0 && index < arr.length) {
            arr[index] += 1;
        }
    });
    const votes = {};
    task.options.forEach((opt, index) => {
        votes[opt.optionId] = arr[index];
    });
    res.json({ task, votes });
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