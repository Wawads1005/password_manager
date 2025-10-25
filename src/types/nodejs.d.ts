declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    HOST?: string;
    NODE_ENV: "production" | "development";
  }
}
