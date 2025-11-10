// app/libs/hybrid-cache.ts
import Redis from 'ioredis';

// ✅ Cliente Redis (lazy loading)
let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  // Apenas em produção E se REDIS_URL estiver configurado
  if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
    if (!redisClient) {
      try {
        redisClient = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            if (times > 3) return null;
            return Math.min(times * 50, 2000);
          },
        });
        console.log('✅ Redis client initialized for production');
      } catch (error) {
        console.error('❌ Redis connection failed:', error);
        return null;
      }
    }
    return redisClient;
  }
  return null;
}

/**
 * ✅ Cache wrapper genérico com fallback
 */
async function cacheWrapper<T>(
  fn: () => Promise<T>,
  key: string,
  ttl: number // em segundos
): Promise<T> {
  const redis = getRedisClient();

  // ✅ SEM REDIS: executar função diretamente
  if (!redis) {
    console.log(`📦 No Redis: executing ${key} directly`);
    return fn();
  }

  // ✅ COM REDIS: tentar buscar do cache
  try {
    const cached = await redis.get(key);

    if (cached) {
      console.log(`✅ Redis HIT: ${key}`);
      return JSON.parse(cached);
    }

    console.log(`❌ Redis MISS: ${key}`);
    const result = await fn();

    // Salvar no cache
    await redis.setex(key, ttl, JSON.stringify(result));
    console.log(`💾 Redis SAVED: ${key} (TTL: ${ttl}s)`);

    return result;
  } catch (error) {
    console.error(`❌ Redis error for ${key}:`, error);
    // Fallback: executar função diretamente
    return fn();
  }
}

/**
 * ✅ Presets de cache com TTLs otimizados
 */
export const cachePresets = {
  // 30 minutos - dados que mudam com frequência
  short: <T>(fn: () => Promise<T>, key: string) =>
    cacheWrapper(fn, `short:${key}`, 1800),

  // 1 hora - dados moderadamente dinâmicos
  hourly: <T>(fn: () => Promise<T>, key: string) =>
    cacheWrapper(fn, `hourly:${key}`, 3600),

  // 4 horas - dados semi-estáticos
  halfDay: <T>(fn: () => Promise<T>, key: string) =>
    cacheWrapper(fn, `halfday:${key}`, 14400),

  // 24 horas - dados estáticos
  daily: <T>(fn: () => Promise<T>, key: string) =>
    cacheWrapper(fn, `daily:${key}`, 86400),

  // 7 dias - dados muito estáveis
  weekly: <T>(fn: () => Promise<T>, key: string) =>
    cacheWrapper(fn, `weekly:${key}`, 604800),
};

/**
 * ✅ Invalidação de cache
 */
export async function invalidateCache(key: string) {
  const redis = getRedisClient();
  if (!redis) {
    console.log(`🔧 No Redis: skipping invalidation of ${key}`);
    return;
  }

  try {
    await redis.del(key);
    console.log(`🗑️ Cache invalidated: ${key}`);
  } catch (error) {
    console.error(`❌ Failed to invalidate ${key}:`, error);
  }
}

export async function invalidateCacheByPrefix(prefix: string) {
  const redis = getRedisClient();
  if (!redis) {
    console.log(`🔧 No Redis: skipping prefix invalidation ${prefix}`);
    return;
  }

  try {
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑️ Invalidated ${keys.length} keys with prefix: ${prefix}`);
    }
  } catch (error) {
    console.error(`❌ Failed to invalidate prefix ${prefix}:`, error);
  }
}
