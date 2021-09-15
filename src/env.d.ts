declare namespace NodeJS {
  interface ProcessEnv {
    CORS_ORIGIN: string;
    PORT: string;
    SESSION_SECRET: string;
    NODE_ENV: string;
    COOKIE_NAME: string;
    REDIS_HOSTNAME: string;
    REDIS_PORT: string;
    REDIS_PASSWORD: string;
    FORGOT_PASSWORD_PREFIX: string;
    DATABASE_URL: string;
    DATABASE_URL_BACKUP: string;
  }
}