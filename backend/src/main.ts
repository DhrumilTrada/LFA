import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ResponseTransformInterceptor } from "./helpers/response-mapping/response.transformer";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { LoggingInterceptor } from "./helpers/app-logger.interceptor";
import { SwaggerConfig } from "./config/swagger.config";
import { AppConfig } from "./config/app.config";
import { Logger } from "nestjs-pino";
import { LoggingConfig } from "./config/logging.config";
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // config services
  const swaggerConfig = app.get(SwaggerConfig);
  const appConfig = app.get(AppConfig);
  const loggingConfig = app.get(LoggingConfig);

  // enable cors
  app.enableCors({
    origin: "http://localhost:3000",
    credentials: true,
  });

  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });

  // Apply Global Validation to prevent bad requests
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Generate Swagger Documentation
  if (swaggerConfig.generateDocumentation) {
    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.appTitle)
      .setDescription(swaggerConfig.appDescription)
      .setVersion(swaggerConfig.appVersion.toString())
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          name: "JWT",
          description: "Enter JWT token",
          in: "header",
        },
        "access-token"
      )
      // Add Bearer token for the second type of token (e.g., refresh token)
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // Optional
        },
        "refresh-token" // Name of the second token security scheme
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerConfig.apiPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true, // this
      },
    });
  }

  // Logs all requests and responses for all incoming requests
  if (appConfig.requestLogging) {
    app.useGlobalInterceptors(new LoggingInterceptor());
  }

  // Transform Responses to use {data, status, message} format
  app.useGlobalInterceptors(
    new ResponseTransformInterceptor(app.get(Reflector))
  );

  //pino logger
  app.useLogger(app.get(Logger));

  // Use new stream in express

  await app.listen(appConfig.port || 3001);
}
bootstrap();

// Add ConfigModule and cloudinaryConfig to AppModule imports
// In app.module.ts:
// imports: [
//   ConfigModule.forRoot({ isGlobal: true, load: [cloudinaryConfig] }),
//   ...existing modules
// ]
