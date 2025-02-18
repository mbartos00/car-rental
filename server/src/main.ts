import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodFilter } from './shared/zod-filter/zod.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ZodFilter());
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
