import type { Response, NextFunction } from "express";
import type { userRequest, workerRequest } from "./types.js";
export declare function userMiddleware(req: userRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function workerMiddleware(req: workerRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=middleware.d.ts.map