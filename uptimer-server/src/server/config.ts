import dotenv from "dotenv";

dotenv.config({});

const env = process.env;
export const POSTGRES_DB: string = env.POSTGRES_DB as string;
export const NODE_ENV: string = env.NODE_ENV as string;
export const SECRET_KEY_ONE: string = env.SECRET_KEY_ONE as string;
export const SECRET_KEY_TWO: string = env.SECRET_KEY_TWO as string;
export const JWT_TOKEN: string = env.JWT_TOKEN as string;
export const SENDER_EMAIL: string = env.SENDER_EMAIL as string;
export const SENDER_EMAIL_PASSWORD: string =
  env.SENDER_EMAIL_PASSWORD as string;
export const CLIENT_URL: string = env.CLIENT_URL as string;
export const PORT: string = env.PORT as string;
