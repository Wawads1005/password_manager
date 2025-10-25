import { DEFAULT_HOST, DEFAULT_PORT } from "@/constants";
import { config } from "dotenv";

config({ quiet: true });

const keys = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT,
  host: process.env.HOST ?? DEFAULT_HOST,
  environment: process.env.NODE_ENV,
};

export { keys };
