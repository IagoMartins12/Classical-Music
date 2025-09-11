// app/libs/redis.ts - Cliente Redis com detecção de build time
import { Redis } from 'ioredis';

declare global {
  var __redis: Redis | undefined | null;
}

// Detectar se está em build time (mesmo sistema do Prisma)
const IS_BUILD_TIME = (() => {
  if (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NEXT_PHASE === 'phase-development-server'
  ) {
    return true;
  }

  const buildCommands = ['build', 'next build'];
  const hasBuildArg = process.argv.some((arg) =>
    buildCommands.some((cmd) => arg.includes(cmd))
  );

  return hasBuildArg;
})();

// Configuração Redis (apenas se não for build time)
const createRedisInstance = (): Redis | null => {
  if (IS_BUILD_TIME) {
    console.log('🔧 Build time detected - skipping Redis connection');
    return null;
  }

  const redis = new Redis({
    host: process.env.REDIS_HOST || 'opus-atlas-redis',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || 'RedisOpusAtlas2024!',
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    commandTimeout: 5000,
  });

  // Event listeners para debugging (apenas em runtime)
  redis.on('connect', () => {
    console.log('🔗 Redis connected successfully');
  });

  redis.on('ready', () => {
    console.log('✅ Redis ready for commands');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
  });

  redis.on('close', () => {
    console.log('🔌 Redis connection closed');
  });

  redis.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
  });

  return redis;
};

// Singleton para development (evitar múltiplas conexões)
const redis = globalThis.__redis ?? createRedisInstance();

if (process.env.NODE_ENV !== 'production' && !IS_BUILD_TIME) {
  globalThis.__redis = redis;
}

export default redis;

// Utility functions para cache (build-safe)
export const cacheHelper = {
  // Set com TTL
  async set(key: string, value: any, ttlSeconds: number = 600): Promise<void> {
    if (IS_BUILD_TIME || !redis) {
      // Durante build, não fazer nada
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      await redis.setex(key, ttlSeconds, serialized);
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      // Não quebrar a aplicação se Redis falhar
    }
  },

  // Get com parsing
  async get<T = any>(key: string): Promise<T | null> {
    if (IS_BUILD_TIME || !redis) {
      // Durante build, sempre retornar null (cache miss)
      return null;
    }

    try {
      const cached = await redis.get(key);
      if (!cached) return null;
      return JSON.parse(cached) as T;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  },

  // Delete
  async del(key: string): Promise<void> {
    if (IS_BUILD_TIME || !redis) {
      return;
    }

    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
    }
  },

  // Verificar se existe
  async exists(key: string): Promise<boolean> {
    if (IS_BUILD_TIME || !redis) {
      return false;
    }

    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  },

  // Múltiplas chaves
  async mget(keys: string[]): Promise<(any | null)[]> {
    if (IS_BUILD_TIME || !redis) {
      return new Array(keys.length).fill(null);
    }

    try {
      const values = await redis.mget(...keys);
      return values.map((value) => {
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      });
    } catch (error) {
      console.error('Redis MGET error:', error);
      return new Array(keys.length).fill(null);
    }
  },

  // Health check
  async ping(): Promise<boolean> {
    if (IS_BUILD_TIME || !redis) {
      return false;
    }

    try {
      const result = await redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis PING error:', error);
      return false;
    }
  },
};
