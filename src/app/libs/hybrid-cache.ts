// app/libs/hybrid-cache.ts - Cache híbrido que funciona com ou sem Redis
import { cacheHelper } from './redis';

type CacheFunction<T> = () => Promise<T>;

interface CacheOptions {
  key: string;
  ttl: number; // TTL em segundos
  fallbackToMemory?: boolean; // Se true, usa cache em memória quando Redis não disponível
}

// Cache em memória simples para fallback (apenas em desenvolvimento)
const memoryCache = new Map<string, { data: any; expires: number }>();
const isDevelopment = process.env.NODE_ENV === 'development';

// Limpar cache em memória periodicamente (apenas em desenvolvimento)
if (isDevelopment) {
  setInterval(() => {
    const now = Date.now();
    for (const [key, { expires }] of memoryCache.entries()) {
      if (now > expires) {
        memoryCache.delete(key);
      }
    }
  }, 300000); // Limpar a cada 5 minutos
}

/**
 * Cache híbrido que usa Redis em produção e fallback em desenvolvimento
 * - Produção: Redis com fallback gracioso se falhar
 * - Desenvolvimento: Cache em memória opcional
 * - Sempre executa a função se cache não disponível
 */
export async function hybridCache<T>(
  fn: CacheFunction<T>,
  options: CacheOptions
): Promise<T> {
  const { key, ttl, fallbackToMemory = true } = options;

  try {
    // Tentar buscar no Redis primeiro (se disponível)
    const cached = await cacheHelper.get<T>(key);
    if (cached !== null) {
      console.log(`🎯 Cache hit (Redis): ${key}`);
      return cached;
    }

    // Se não encontrou no Redis, tentar cache em memória (apenas em dev)
    if (process.env.NODE_ENV === 'development' && fallbackToMemory) {
      const memoryItem = memoryCache.get(key);
      if (memoryItem && Date.now() < memoryItem.expires) {
        console.log(`🧠 Cache hit (Memory): ${key}`);
        return memoryItem.data as T;
      }
    }

    // Cache miss - executar função
    console.log(`💨 Cache miss: ${key} - executing function...`);
    const result = await fn();

    // Tentar salvar no Redis (sem falhar se Redis não disponível)
    const redisSaved = await cacheHelper.set(key, result, ttl);

    if (redisSaved) {
      console.log(`💾 Cached in Redis: ${key} (TTL: ${ttl}s)`);
    } else {
      // Fallback para cache em memória se Redis não disponível
      if (process.env.NODE_ENV === 'development' && fallbackToMemory) {
        const expires = Date.now() + ttl * 1000;
        memoryCache.set(key, { data: result, expires });
        console.log(`🧠 Cached in Memory: ${key} (TTL: ${ttl}s)`);
      } else {
        console.log(`⚠️ No cache available for: ${key}`);
      }
    }

    return result;
  } catch (error) {
    // Em caso de qualquer erro de cache, executar função normalmente
    console.log(`❌ Cache error for ${key}, executing function:`, error);
    return await fn();
  }
}

/**
 * Versões pré-configuradas com TTLs apropriados para diferentes tipos de dados
 */
export const cachePresets = {
  // Cache diário - renova a cada 24h (featuredComposer)
  daily: <T>(fn: CacheFunction<T>, key: string) =>
    hybridCache(fn, { key: `daily:${key}`, ttl: 86400 }), // 24 horas

  // Cache de horas - renova a cada 4h (dados que mudam moderadamente)
  hourly: <T>(fn: CacheFunction<T>, key: string) =>
    hybridCache(fn, { key: `hourly:${key}`, ttl: 14400 }), // 4 horas

  // Cache curto - renova a cada 30 min (recentAdditions, dados dinâmicos)
  short: <T>(fn: CacheFunction<T>, key: string) =>
    hybridCache(fn, { key: `short:${key}`, ttl: 1800 }), // 30 minutos

  // Cache longo - renova a cada 7 dias (dados estáticos como épocos)
  weekly: <T>(fn: CacheFunction<T>, key: string) =>
    hybridCache(fn, { key: `weekly:${key}`, ttl: 604800 }), // 7 dias

  // Cache customizado
  custom: <T>(fn: CacheFunction<T>, key: string, ttlSeconds: number) =>
    hybridCache(fn, { key: `custom:${key}`, ttl: ttlSeconds }),
};

/**
 * Função para invalidar cache específico
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    // Invalidar no Redis
    await cacheHelper.del(key);

    // Invalidar no cache em memória
    if (process.env.NODE_ENV === 'development') {
      memoryCache.delete(key);
    }

    console.log(`🗑️ Cache invalidated: ${key}`);
  } catch (error) {
    console.log(`❌ Error invalidating cache ${key}:`, error);
  }
}

/**
 * Função para invalidar múltiplas chaves por prefixo
 */
export async function invalidateCacheByPrefix(prefix: string): Promise<void> {
  try {
    // No Redis, seria mais complexo - por simplicidade, apenas log
    console.log(`🗑️ Cache invalidation requested for prefix: ${prefix}`);

    // Invalidar cache em memória por prefixo
    if (process.env.NODE_ENV === 'development') {
      for (const key of memoryCache.keys()) {
        if (key.startsWith(prefix)) {
          memoryCache.delete(key);
        }
      }
    }
  } catch (error) {
    console.log(`❌ Error invalidating cache by prefix ${prefix}:`, error);
  }
}
