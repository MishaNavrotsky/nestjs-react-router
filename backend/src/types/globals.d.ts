declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';

    PORT: string;

    DB_HOST: string;
    DB_PORT: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;

    REDIS_HOST: string;
    REDIS_PORT: string;
    REDIS_PASSWORD: string;
    REDIS_DB_NUMBER: string;
    REDIS_CACHE_TTL: string;

    LOCAL_CACHE_TTL: string;
    LOCAL_CACHE_LRU_SIZE: string;

    CORS_FE_ORIGIN: string;

    JWT_SECRET: string;
    JWT_TOKEN_EXPIRES_IN: string;
    REFRESH_TOKEN_EXPIRES_IN: string;
  }
}
