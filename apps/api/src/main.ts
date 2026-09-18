import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';

function parseCorsOrigins(): string[] {
  const raw =
    process.env.CORS_ORIGINS ??
    'http://localhost:3001,http://127.0.0.1:3001';
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: parseCorsOrigins(),
    credentials: true,
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Finance Monitoring API')
    .setDescription(
      'HTTP API for Finance Monitoring. Auth uses httpOnly cookies (`fm_access_token`, `fm_refresh_token`) and also accepts Bearer JWT on protected routes.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token (optional alternative to the access cookie)',
      },
      'access-token',
    )
    .addCookieAuth('fm_access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'fm_access_token',
      description: 'HttpOnly access cookie set by login/register/refresh',
    })
    .addTag('health', 'Liveness / readiness')
    .addTag('auth', 'Registration, login, session')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
    jsonDocumentUrl: 'docs/json',
    yamlDocumentUrl: 'docs/yaml',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(
    `Swagger UI: http://localhost:${port}/${globalPrefix}/docs`,
  );
}

bootstrap();
