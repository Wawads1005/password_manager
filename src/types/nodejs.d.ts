declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    HOST?: string;
    NODE_ENV: "production" | "development";
    AUTH_SECRET: string;
  }
}
