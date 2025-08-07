import { Module } from '@nestjs/common';
import { CacheModule as CM } from '@nestjs/cache-manager';
import { createKeyv, Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { CacheService } from './cache.service';
import { config } from '../config/env.config';

@Module({
  imports: [
    CM.registerAsync({
      useFactory: () => {
        const host = config.REDIS_HOST;
        const port = config.REDIS_PORT;
        const password = config.REDIS_PASSWORD;
        const dbNumber = config.REDIS_DB_NUMBER;

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
              store: new CacheableMemory({
                ttl: config.LOCAL_CACHE_TTL,
                lruSize: config.LOCAL_CACHE_LRU_SIZE,
              }),
            }),
            createKeyv(redisUri),
          ],
          nonBlocking: false, // should be blocking because if the local cache is missing a key, but it is present in the redis Promise.race will take the first one available.
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
