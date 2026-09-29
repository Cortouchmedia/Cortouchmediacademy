import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ⬅️ CORS — allow your frontend + localhost in dev
  app.enableCors({
    origin: [
      'http://localhost:3000',        // local Next.js
      'http://localhost:5173',        // local Vite (if you use it)
      'https://cortouch.tech', // production frontend
      'https://cortouchmediacademy.vercel.app',
      /\.railway\.app$/,
  /\.vercel\.app$/,            // any Railway preview URL
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // ⬅️ Validation — rejects bad DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // ⬅️ Graceful shutdown — Railway sends SIGTERM on redeploy
  app.enableShutdownHooks();

  // ⬅️ Port + host — must be 0.0.0.0 for Railway
  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');

  Logger.log(
    `🚀 Backend running on http://0.0.0.0:${port}`,
    'Bootstrap',
  );
  Logger.log(
    `   Routes are prefixed with /api (defined per-controller)`,
    'Bootstrap',
  );
}
bootstrap();
