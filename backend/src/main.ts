// noinspection JSIgnoredPromiseFromCall

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { config, isDev, validateEnv } from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  validateEnv(config);

  app.use(cookieParser());

  app.enableCors({
    origin: [config.CORS_FE_ORIGIN],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: !isDev,
      whitelist: true,
    }),
  );

  SwaggerModule.setup('api', app, () =>
    SwaggerModule.createDocument(app, new DocumentBuilder().build()),
  );

  await app.listen(config.PORT);
}
bootstrap().catch((err) => {
  console.error(err);
});
