import { createServer, proxy } from 'aws-serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from '../src/app.module';
import { NestFactory } from '@nestjs/core';

let cachedServer;

async function bootstrapServer() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule, { bodyParser: false });
    await app.init();
    cachedServer = createServer(app.getHttpAdapter().getInstance());
  }
  return cachedServer;
}

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
  cachedServer = await bootstrapServer();
  return proxy(cachedServer, event, context, 'PROMISE').promise;
};
