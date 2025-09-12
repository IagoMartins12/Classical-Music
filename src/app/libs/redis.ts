// app/libs/redis.ts - Cliente Redis simplificado e compatível
import { Redis } from 'ioredis';

declare global {
  var __redis: Redis | undefined | null;
}

// Detectar se está em build time
const isBuildTime = (() => {
  return (
    process.env.NODE_ENV === 'production' &&
    (process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.CI === 'true' ||
      process.argv.includes('build'))
  );
})();

// Configuração Redis usando apenas opções compatíveis
const createRedisInstance = (): Redis | null => {
  if (isBuildTime) {
    console.log('Build time detected - skipping Redis connection');
    return null;
  }

  try {
    let redis: Redis;

    // Usar REDIS_URL se disponível (mais simples)
    if (process.env.REDIS_URL) {
      console.log('Connecting to Redis using REDIS_URL...');
      redis = new Redis(process.env.REDIS_URL);
    } else {
      // Fallback para configuração separada
      redis = new Redis({
        host: process.env.REDIS_HOST || 'opus-atlas-redis',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      });
    }

    // Event listeners para logging
    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    redis.on('error', (err) => {
      console.log('Redis error:', err.message);
    });

    redis.on('ready', () => {
      console.log('Redis ready for commands');
    });

    return redis;
  } catch (error) {
    console.log('Failed to create Redis instance:', error);
    return null;
  }
};

// Singleton Redis client
export const redis = globalThis.__redis ?? createRedisInstance();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__redis = redis;
}

// Helper functions para operações de cache
export const cacheHelper = {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) {
      console.log(`Redis not available - skipping cache get for ${key}`);
      return null;
    }

    try {
      const cached = await redis.get(key);
      if (cached) {
        console.log(`Cache hit for ${key}`);
        return JSON.parse(cached) as T;
      }
      console.log(`Cache miss for ${key}`);
      return null;
    } catch (error) {
      console.log(`Cache get error for ${key}:`, error);
      return null;
    }
  },

  async set<T>(
    key: string,
    data: T,
    ttlSeconds: number = 600
  ): Promise<boolean> {
    if (!redis) {
      console.log(`Redis not available - skipping cache set for ${key}`);
      return false;
    }

    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(data));
      console.log(`Cached ${key} for ${ttlSeconds}s`);
      return true;
    } catch (error) {
      console.log(`Cache set error for ${key}:`, error);
      return false;
    }
  },

  async del(key: string): Promise<boolean> {
    if (!redis) return false;

    try {
      await redis.del(key);
      console.log(`Deleted cache for ${key}`);
      return true;
    } catch (error) {
      console.log(`Cache delete error for ${key}:`, error);
      return false;
    }
  },

  async ping(): Promise<boolean> {
    if (!redis) return false;

    try {
      const result = await redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.log('Redis ping failed:', error);
      return false;
    }
  },
};
