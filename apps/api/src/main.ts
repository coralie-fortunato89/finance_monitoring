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

/** On by default outside production; force with SWAGGER_ENABLED=true|false. */
function isSwaggerEnabled(): boolean {
  if (process.env.SWAGGER_ENABLED === 'true') {
    return true;
  }
  if (process.env.SWAGGER_ENABLED === 'false') {
    return false;
  }
  return process.env.NODE_ENV !== 'production';
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

  if (isSwaggerEnabled()) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Finance Monitoring API')
      .setDescription(
        [
          'HTTP API for Finance Monitoring.',
          '',
          '### Auth cookies',
          '- `fm_access_token` (httpOnly) — short-lived access JWT; also accepted as Bearer.',
          '- `fm_refresh_token` (httpOnly, path `/api/auth`) — used by refresh/logout.',
          '',
          '### Swagger Try it out',
          'HttpOnly cookies cannot be pasted into Authorize. Call **register** or **login** from this UI first so the browser stores the cookies, then call **refresh** / **me** / **logout** in the same browser session.',
        ].join('\n'),
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
        description:
          'HttpOnly access cookie (set by login/register/refresh; not pasteable in Authorize)',
      })
      .addCookieAuth('fm_refresh_token', {
        type: 'apiKey',
        in: 'cookie',
        name: 'fm_refresh_token',
        description:
          'HttpOnly refresh cookie, path=/api/auth (set by login/register/refresh; use same-browser Try it out after login)',
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
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  if (isSwaggerEnabled()) {
    Logger.log(`Swagger UI: http://localhost:${port}/${globalPrefix}/docs`);
  } else {
    Logger.log('Swagger UI disabled (production or SWAGGER_ENABLED=false)');
  }
}

bootstrap();
