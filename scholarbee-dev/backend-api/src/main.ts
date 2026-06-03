import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ServerOptions } from 'socket.io';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { PopulateInterceptor } from './common/interceptors/populate.interceptor';

class CustomIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: Partial<ServerOptions>): any {
    const server = super.createIOServer(port, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Authorization', 'Content-Type', 'timezone']
      },
      transports: ['websocket', 'polling'],
      path: '/socket.io',
    });

    console.log(`WebSocket server created on port ${port}`);
    return server;
  }
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('Starting application...');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Get config service
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type', 'timezone']
  });

  // Use custom WebSocket adapter for proper handling
  logger.log('Configuring WebSocket adapter...');
  app.useWebSocketAdapter(new CustomIoAdapter(app));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // API prefix
  // REVIEW: We should setup api versioning as well
  app.setGlobalPrefix('api');

  // Get the PopulateInterceptor instance from the app context instead of creating a new one
  const populateInterceptor = app.get(PopulateInterceptor);
  app.useGlobalInterceptors(populateInterceptor);
  app.useGlobalInterceptors(new LoggingInterceptor());
  // app.useGlobalInterceptors(new ResponseInterceptor());

  // Serve static files for Swagger custom scripts
  // In dev: __dirname is dist/src, so we go up to dist, then to public
  // In prod: __dirname is dist, so we go up one level to backend root, then to public
  const publicPath = join(process.cwd(), 'public');
  app.useStaticAssets(publicPath, {
    prefix: '/static/',
  });
  logger.log(`Static files served from: ${publicPath}`);

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('ScholarBee API')
    .setDescription('The ScholarBee API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customCss: `
      .swagger-ui .topbar { display: none; }
    `,
    customSiteTitle: 'ScholarBee API Documentation',
    swaggerOptions: {
      docExpansion: 'none',   // collapse all by default
      filter: true,            // enables search/filtering
      operationsSorter: 'alpha', // sorts alphabetically within groups
      tagsSorter: 'alpha',       // sorts tag groups alphabetically
    },
    customJs: [
      '/static/swagger-auth-plugin.js',
    ],
  });


  // Get port from environment or use default
  const port = configService.get<number>('PORT') || 3010;

  await app.listen(port);
  logger.debug(`Testing logger for deployment debugging`);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation is available at: http://localhost:${port}/api/docs`);
  logger.log(`WebSocket server is available at: ws://localhost:${port}/socket.io`);
  logger.log(
    `Swagger documentation is available at: http://localhost:${port}/api/docs`,
  );
  logger.log(`WebSocket server is available at: ws://localhost:${port}/chat`);
}
bootstrap();

// triggered reload

// triggered reload 2

// reload for ml_score
