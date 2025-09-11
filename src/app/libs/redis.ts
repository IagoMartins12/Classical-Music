// app/libs/redis.ts - Cliente Redis configurado (versão corrigida)
import { Redis } from 'ioredis';

declare global {
  var __redis: Redis | undefined;
}

// Configuração Redis simplificada e compatível
const createRedisInstance = (): Redis => {
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'opus-atlas-redis',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || 'RedisOpusAtlas2024!',
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    commandTimeout: 5000,
  });

  // Event listeners para debugging
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

if (process.env.NODE_ENV !== 'production') {
  globalThis.__redis = redis;
}

export default redis;

// Utility functions para cache
export const cacheHelper = {
  // Set com TTL
  async set(key: string, value: any, ttlSeconds: number = 600): Promise<void> {
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
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
    }
  },

  // Verificar se existe
  async exists(key: string): Promise<boolean> {
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
    try {
      const result = await redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis PING error:', error);
      return false;
    }
  },
};
