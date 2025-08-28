import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import morgan from 'morgan';
import * as promClient from 'prom-client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:8000'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.use(morgan('combined'));

  promClient.collectDefaultMetrics({ prefix: 'myapp_' });

  const http = app.getHttpAdapter().getInstance();
  http.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  });

  await app.listen(process.env.PORT ?? 3000);
  Logger.log(`Application running on: ${await app.getUrl()}`);
}
bootstrap();
