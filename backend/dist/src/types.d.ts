import type { Request } from "express";
import z from "zod";
export interface userRequest extends Request {
    userId?: String;
}
export interface workerRequest extends Request {
    workerId?: String;
}
export declare const taskBody: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    options: z.ZodArray<z.ZodObject<{
        optionId: z.ZodNumber;
        imageUrl: z.ZodString;
    }, z.z.core.$strip>>;
}, z.z.core.$strip>;
//# sourceMappingURL=types.d.ts.map