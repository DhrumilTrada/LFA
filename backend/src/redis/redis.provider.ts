import * as Redis from 'ioredis'
import { Provider } from '@nestjs/common'

export const RedisClientProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    return new Redis.Redis({
      host: process.env.BULL_REDIS_HOST,
      port: Number(process.env.BULL_REDIS_PORT)
    })
  }
}
