import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DomainErrorFilter } from './common/filters/domain-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // ✅ utiliser le vrai filter métier
  app.useGlobalFilters(new DomainErrorFilter());

  await app.listen(3001);

  console.log('🚀 Server running on http://localhost:3001');
}

bootstrap();