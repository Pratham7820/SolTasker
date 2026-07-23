import "dotenv/config";
export const PORT = process.env.PORT || "3000";
export const DECIMAL_POINT = process.env.DECIMAL_POINT || '100';
export const DATABASE_URL = process.env.DATABASE_URL || "";
export const USER_JWT_SECRET = process.env.USER_JWT_SECRET || "";
export const WORKER_JWT_SECRET = process.env.WORKER_JWT_SECRET || "";
export const S3_ACCESS_ID = process.env.S3_ACCESS_ID || '';
export const S3_SECRET_KEY = process.env.S3_SECRET_KEY || '';
export const S3_BUCKET = process.env.S3_BUCKET || '';
export const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "";
export const PARENT_WALLET_ADDRESS = process.env.PARENT_WALLET_ADDRESS || '';
export const PARENT_SECRET_ADDRESS = process.env.PARENT_SECRET_ADDRESS || "";
export const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL || "";
//# sourceMappingURL=config.js.map