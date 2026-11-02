import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',       
      'http://localhost:5173',       
      'https://cortouch.tech', 
      'https://cortouchmediacademy.vercel.app',
      /\.railway\.app$/,
  /\.vercel\.app$/,            
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );


  app.enableShutdownHooks();

 
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
