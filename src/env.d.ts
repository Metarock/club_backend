declare namespace NodeJS {
  interface ProcessEnv {
    CORS_ORIGIN: string;
    PORT: string;
    SESSION_SECRET: string;
    NODE_ENV: string;
  }
}