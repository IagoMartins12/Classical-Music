// app/libs/redis.ts - Redis corrigido para desenvolvimento
import { Redis } from 'ioredis';

declare global {
  var __redis: Redis | undefined | null;
}

// Detectar ambiente de desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Configuração Redis APENAS para produção
const createRedisInstance = (): Redis | null => {
  // Em desenvolvimento, NUNCA criar instância Redis
  if (isDevelopment) {
    console.log('🚧 Development mode - Redis disabled, using memory cache');
    return null;
  }

  // Em produção, tentar criar Redis
  if (isProduction && process.env.REDIS_URL) {
    try {
      console.log('🔗 Production mode - connecting to Redis...');
      const redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 2, // Reduzir tentativas
        connectTimeout: 3000, // Timeout mais baixo
        lazyConnect: true, // Não conectar imediatamente
      });

      redis.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });

      redis.on('error', (err) => {
        console.log('❌ Redis error:', err.message);
      });

      return redis;
    } catch (error) {
      console.log('❌ Failed to create Redis instance:', error);
      return null;
    }
  }

  console.log('⚠️ Redis not configured');
  return null;
};

// Singleton Redis client (será null em desenvolvimento)
export const redis = globalThis.__redis ?? createRedisInstance();

if (isDevelopment) {
  globalThis.__redis = redis; // null em desenvolvimento
}

// Helper functions com fallback inteligente
export const cacheHelper = {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) {
      // Em desenvolvimento, sempre retorna null (sem logs excessivos)
      return null;
    }

    try {
      const cached = await redis.get(key);
      if (cached) {
        console.log(`📦 Cache hit: ${key}`);
        return JSON.parse(cached) as T;
      }
      return null;
    } catch (error) {
      console.log(`❌ Cache get error for ${key}:`, error);
      return null;
    }
  },

  async set<T>(
    key: string,
    data: T,
    ttlSeconds: number = 600
  ): Promise<boolean> {
    if (!redis) {
      // Em desenvolvimento, simula sucesso sem fazer nada
      return false;
    }

    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(data));
      console.log(`💾 Cached ${key} for ${ttlSeconds}s`);
      return true;
    } catch (error) {
      console.log(`❌ Cache set error for ${key}:`, error);
      return false;
    }
  },

  async del(key: string): Promise<boolean> {
    if (!redis) return false;

    try {
      await redis.del(key);
      console.log(`🗑️ Deleted cache for ${key}`);
      return true;
    } catch (error) {
      console.log(`❌ Cache delete error for ${key}:`, error);
      return false;
    }
  },

  async ping(): Promise<boolean> {
    if (!redis) return false;

    try {
      const result = await redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.log('❌ Redis ping failed:', error);
      return false;
    }
  },
};
