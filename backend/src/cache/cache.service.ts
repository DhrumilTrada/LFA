import { Injectable, Inject } from '@nestjs/common'
import * as Redis from 'ioredis'

@Injectable()
export class CacheService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis.Redis
  ) {}

  async set(key: string, value: object): Promise<void> {
    await this.redisClient.set(key, JSON.stringify(value))
  }

  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.redisClient.get(key)
    return data ? JSON.parse(data) : null
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key)
  }

  async clear(): Promise<void> {
    await this.redisClient.flushall()
  }

  async getAllKeys(): Promise<string[]> {
    return await this.redisClient.keys('*')
  }

  async clearKeysByPrefix(prefix: string): Promise<void> {
    const keys = await this.redisClient.keys(`${prefix}*`)
    if (keys.length) {
      await this.redisClient.del(...keys)
    }
  }
}
