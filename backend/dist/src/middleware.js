import jwt, {} from "jsonwebtoken";
import { USER_JWT_SECRET, WORKER_JWT_SECRET } from "./config.js";
export function userMiddleware(req, res, next) {
    const authToken = req.headers.authorization;
    if (!authToken || !authToken.startsWith('Bearer ')) {
        return res.json({
            message: "token is not provided"
        });
    }
    const token = authToken.split(' ')[1];
    if (!token) {
        return res.json({
            message: "token is empty"
        });
    }
    try {
        const decoded = jwt.verify(token, USER_JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        console.log(error);
        return res.json({
            message: "authorization denied"
        });
    }
}
export function workerMiddleware(req, res, next) {
    const authToken = req.headers.authorization;
    if (!authToken || !authToken.startsWith('Bearer ')) {
        return res.json({
            message: "token is not provided"
        });
    }
    const token = authToken.split(' ')[1];
    if (!token) {
        return res.json({
            message: "token is empty"
        });
    }
    try {
        const decoded = jwt.verify(token, WORKER_JWT_SECRET);
        req.workerId = decoded.workerId;
        next();
    }
    catch (error) {
        console.log(error);
        return res.json({
            message: "authorization denied"
        });
    }
}
//# sourceMappingURL=middleware.js.map