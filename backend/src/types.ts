import type {Request} from "express"
import z from "zod"

export interface userRequest extends Request {
    userId? : String
}

export interface workerRequest extends Request {
    workerId? : String
}

export const taskBody = z.object({
    title : z.string(),
    description : z.string().default(''),
    options : z.object({
        optionId : z.number(),
        imageUrl : z.string()
    }).array()
}) 