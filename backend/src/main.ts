import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { isDev } from './consts';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [process.env.CORS_FE_ORIGIN],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    disableErrorMessages: !isDev,
    whitelist: true,
  }));

  SwaggerModule.setup('api', app,
    () => SwaggerModule.createDocument(
      app,
      new DocumentBuilder().build()
    )
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
