import type { Response , NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
import type { userRequest, workerRequest } from "./types.js";

export function userMiddleware(req:userRequest,res:Response,next : NextFunction){
    const authToken = req.headers.authorization
    if(!authToken || !authToken.startsWith('Bearer ')){
        return res.json({
            message : "token is not provided"
        })
    }
    const token = authToken.split(' ')[1]
    if(!token){
        return res.json({
            message : "token is empty"
        })
    }
    try {
        const decoded = jwt.verify(token,process.env.USER_JWT_SECRET || '')
        req.userId = (decoded as JwtPayload).userId
        next()
    } catch (error) {
        console.log(error)
        return res.json({
            message : "authorization denied"
        })
    }
}

export function workerMiddleware(req:workerRequest,res:Response,next:NextFunction){
    const authToken = req.headers.authorization
    if(!authToken || !authToken.startsWith('Bearer ')){
        return res.json({
            message : "token is not provided"
        })
    }
    const token = authToken.split(' ')[1]
    if(!token){
        return res.json({
            message : "token is empty"
        })
    }
    try {
        const decoded = jwt.verify(token,process.env.WORKER_JWT_SECRET || '')
        req.workerId = (decoded as JwtPayload).workerId
        next()
    } catch (error) {
        console.log(error)
        return res.json({
            message : "authorization denied"
        })
    }
}