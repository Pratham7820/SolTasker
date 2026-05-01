import express from "express";
import { prisma } from "./db.js";
import jwt from "jsonwebtoken";
import { workerMiddleware } from "./middleware.js";
const workerRouter = express.Router();
workerRouter.post('/login', async (req, res) => {
    const { address } = req.body;
    if (!address) {
        return res.json({
            message: 'address not provided'
        });
    }
    let worker = await prisma.worker.findFirst({
        where: { address }
    });
    if (!worker) {
        worker = await prisma.worker.create({
            data: { address }
        });
    }
    const token = jwt.sign({ workerId: worker.id }, process.env.WORKER_JWT_SECRET || '');
    res.json({ token });
});
workerRouter.get('/nextTask', workerMiddleware, async (req, res) => {
    const workerId = req.workerId;
    const task = await prisma.task.findFirst({
        where: {
            submissions: {
                none: {
                    workerId: Number(workerId)
                }
            }
        }
    });
    res.json({ task });
});
workerRouter.post('/submission', workerMiddleware, async (req, res) => {
    const workerId = req.workerId;
    const { taskId, optionId } = req.body;
    if (!optionId || !taskId) {
        return res.json({
            message: 'option not provided'
        });
    }
    const submission = await prisma.submission.create({
        data: {
            workerId: Number(workerId),
            optionId: Number(optionId),
            taskId: Number(taskId)
        }
    });
    res.json({ submission });
});
export default workerRouter;
//# sourceMappingURL=worker.js.map