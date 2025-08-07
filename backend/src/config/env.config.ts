export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';

import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';
import { plainToInstance, Type } from 'class-transformer';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvConfig {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv;

  @Type(() => Number)
  @IsNumber()
  PORT: number;

  @IsString()
  DB_HOST: string;

  @Type(() => Number)
  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_USER: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  @IsString()
  REDIS_HOST: string;

  @Type(() => Number)
  @IsNumber()
  REDIS_PORT: number;

  @IsString()
  REDIS_PASSWORD: string;

  @Type(() => Number)
  @IsNumber()
  REDIS_DB_NUMBER: number;

  @Type(() => Number)
  @IsNumber()
  REDIS_CACHE_TTL: number;

  @Type(() => Number)
  @IsNumber()
  LOCAL_CACHE_TTL: number;

  @Type(() => Number)
  @IsNumber()
  LOCAL_CACHE_LRU_SIZE: number;

  @IsString()
  CORS_FE_ORIGIN: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_TOKEN_EXPIRES_IN: string;

  @IsString()
  REFRESH_TOKEN_EXPIRES_IN: string;
}

export const config = plainToInstance(EnvConfig, process.env, {
  enableImplicitConversion: true,
});

export const validateEnv = (config: EnvConfig) => {
  const errors = validateSync(config, {
    skipMissingProperties: false,
  });

  if (errors.length) {
    console.error(errors);
    throw new Error('Invalid env variables');
  }
};
