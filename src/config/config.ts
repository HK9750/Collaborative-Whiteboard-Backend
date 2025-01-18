import dotenv from "dotenv";
dotenv.config();

export const port = process.env.PORT || 3000;
export const nodeEnv = process.env.NODE_ENV || "development";
export const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
