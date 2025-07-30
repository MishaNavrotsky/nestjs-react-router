import { Module } from '@nestjs/common';
import { CacheModule as CM } from '@nestjs/cache-manager';
import { createKeyv, Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { CacheService } from './cache.service';

@Module({
  imports: [CM.registerAsync({
    useFactory: async () => {
      const host = process.env.REDIS_HOST || 'localhost';
      const port = process.env.REDIS_PORT || '6379';
      const password = process.env.REDIS_PASSWORD || '';
      const dbNumber = process.env.REDIS_DB_NUMBER || '0';

      const redisUri = password
        ? `redis://:${password}@${host}:${port}/${dbNumber}`
        : `redis://${host}:${port}/${dbNumber}`;

      return {
        // here you may have a question, why two and how do they work: from the cache-manager code 
        // // result = await Promise.race(stores.map(async (store) => store.get(key)));
        // and per NestJS docs:
        // // In this example, we've registered two stores: CacheableMemory and KeyvRedis. 
        // // The CacheableMemory store is a simple in-memory store, while KeyvRedis is a Redis store. 
        // // The stores array is used to specify the stores you want to use. The first store in the array is the default store, and the rest are fallback stores.
        // https://docs.nestjs.com/techniques/caching
        // Well or the nestjs docs are wrong or the behaviour of @nestjs/cache-manager is different from cache-manager
        stores: [
          new Keyv({
            store: new CacheableMemory({ ttl: process.env.LOCAL_CACHE_TTL || 60000, lruSize: Number(process.env.LOCAL_CACHE_LRU_SIZE || 50000) }),
          }),
          createKeyv(redisUri)
        ],
        nonBlocking: true,
      }
    }
  })],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule { }
