import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { HttpLoggingInterceptor } from './common/http-logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const host = config.get<string>('HOST', '127.0.0.1');
  if (!['127.0.0.1', '::1', 'localhost'].includes(host)) {
    throw new Error(
      'La API sin autenticación solo puede escuchar en localhost',
    );
  }

  app.setGlobalPrefix(config.get<string>('API_PREFIX', 'api'));
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalInterceptors(new HttpLoggingInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('VigiAPP API')
    .setDescription(
      'Endpoints HTTP disponibles en el backend local de VigiAPP.',
    )
    .setVersion('0.1.0')
    .build();
  SwaggerModule.setup(
    'docs',
    app,
    () => SwaggerModule.createDocument(app, swaggerConfig),
    { useGlobalPrefix: true },
  );

  const port = config.get<number>('PORT', 3000);
  await app.listen(port, host);
}

void bootstrap();
