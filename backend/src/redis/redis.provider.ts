import * as Redis from 'ioredis'
import { Provider } from '@nestjs/common'

export const RedisClientProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    if (process.env.BULL_REDIS_URL) {
      return new Redis.Redis(process.env.BULL_REDIS_URL);
    }
    return new Redis.Redis({
      host: process.env.BULL_REDIS_HOST,
      port: Number(process.env.BULL_REDIS_PORT),
      password: process.env.BULL_REDIS_PASSWORD,
      tls: {} // Enable TLS for Upstash if needed
    });
  }
}
