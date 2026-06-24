import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Convención del proyecto: prefijo global api/v1
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Archivos estáticos: accesibles en /uploads/<filename> (sin prefijo api/v1)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Unique Gym API -> http://localhost:${port}/api/v1`);
  console.log(`Archivos estáticos -> http://localhost:${port}/uploads/`);
}
bootstrap();
