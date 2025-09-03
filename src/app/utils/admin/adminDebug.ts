// app/utils/adminDebug.ts - Utilitários para Debug dos Gráficos

export const debugChartData = (data: any, chartName: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 Debug Chart: ${chartName}`);
    console.log('Raw data:', data);
    console.log('Data length:', data?.length || 0);
    console.log('Data type:', typeof data);
    console.log('Is array:', Array.isArray(data));

    if (Array.isArray(data) && data.length > 0) {
      console.log('First item:', data[0]);
      console.log('Sample structure:', Object.keys(data[0] || {}));

      // Verificar se os dados têm as propriedades esperadas
      const hasName = data.every((item: any) => 'name' in item);
      const hasValue = data.every((item: any) => 'value' in item);
      const hasValidValues = data.every(
        (item: any) => typeof item.value === 'number' && !isNaN(item.value)
      );

      console.log('All items have name:', hasName);
      console.log('All items have value:', hasValue);
      console.log('All values are valid numbers:', hasValidValues);

      // Mostrar valores inválidos se houver
      if (!hasValidValues) {
        const invalidItems = data.filter(
          (item: any) => typeof item.value !== 'number' || isNaN(item.value)
        );
        console.warn('Invalid items:', invalidItems);
      }
    } else {
      console.warn('Data is empty or not an array');
    }
    console.groupEnd();
  }
};

export const normalizeChartData = (
  data: any[],
  type: 'pie' | 'bar' | 'line' = 'pie'
) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('normalizeChartData: Invalid or empty data', type);
    return [];
  }

  return data
    .filter((item) => {
      // Filtrar itens com valores válidos
      const hasValidValue =
        typeof item.value === 'number' && !isNaN(item.value) && item.value > 0;
      const hasValidName = item.name && typeof item.name === 'string';

      if (!hasValidValue || !hasValidName) {
        console.warn('Filtering out invalid item:', item);
        return false;
      }

      return true;
    })
    .map((item) => ({
      name: String(item.name).trim(),
      value: Number(item.value),
      ...(item.count && { count: Number(item.count) }), // Para backward compatibility
    }))
    .sort((a, b) => b.value - a.value); // Ordenar por valor decrescente
};

// 🔧 HOOK PERSONALIZADO PARA DADOS DE GRÁFICO
import { useEffect, useMemo, useState } from 'react';

export const useChartData = (
  rawData: any[],
  chartName: string,
  type: 'pie' | 'bar' | 'line' = 'pie'
) => {
  return useMemo(() => {
    debugChartData(rawData, chartName);
    return normalizeChartData(rawData, type);
  }, [rawData, chartName, type]);
};

// 🔧 FUNÇÃO PARA MAPEAR QUALIDADE DE DADOS
export const mapDataQuality = (quality: string | null | undefined): string => {
  if (!quality) return 'Não Definido';

  const qualityMap: Record<string, string> = {
    high: 'Alta Qualidade',
    medium: 'Média Qualidade',
    low: 'Baixa Qualidade',
    unknown: 'Qualidade Desconhecida',
    verified: 'Verificado',
    pending: 'Pendente',
    disputed: 'Disputado',
  };

  return qualityMap[quality.toLowerCase()] || quality;
};

// 🔧 FUNÇÃO PARA MAPEAR DADOS DE API PARA GRÁFICOS
export const mapStatsToChartData = (
  stats: any,
  field: string,
  valueField: string = 'count'
): Array<{ name: string; value: number }> => {
  if (!stats || !stats[field] || !Array.isArray(stats[field])) {
    console.warn(
      `mapStatsToChartData: Invalid stats for field ${field}`,
      stats
    );
    return [];
  }

  return stats[field]
    .filter(
      (item: any) =>
        item && typeof item[valueField] === 'number' && item[valueField] > 0
    )
    .map((item: any) => {
      let name =
        item.name ||
        item.epoch ||
        item.instrument ||
        item.difficulty ||
        item.quality ||
        'Desconhecido';

      // Mapear qualidade de dados se necessário
      if (field === 'byQuality' && item.quality) {
        name = mapDataQuality(item.quality);
      }

      return {
        name: String(name),
        value: Number(item[valueField]) || 0,
      };
    })
    .sort((a, b) => b.value - a.value);
};

// 🔧 VERIFICADOR DE PERFORMANCE PARA QUERIES
export const performanceMonitor = {
  start: (label: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-start`);
    }
  },

  end: (label: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);

      if (process.env.NODE_ENV === 'development') {
        const measure = performance.getEntriesByName(label)[0];
        if (measure) {
          console.log(`⏱️ ${label}: ${measure.duration.toFixed(2)}ms`);

          // Avisar sobre queries lentas
          if (measure.duration > 1000) {
            console.warn(
              `🐌 Slow query detected: ${label} took ${measure.duration.toFixed(
                2
              )}ms`
            );
          }
        }
      }
    }
  },
};

// 🔧 UTILITÁRIO PARA CACHE EM MEMÓRIA (CLIENT-SIDE)
class SimpleCache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();

  set(key: string, data: any, ttlMinutes: number = 5) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);

    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

export const adminCache = new SimpleCache();

// 🔧 HOOK PARA CACHE DE DADOS DE ADMIN
export const useCachedAdminData = (
  key: string,
  fetchFn: () => Promise<any>,
  ttlMinutes: number = 5
) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tentar buscar do cache primeiro
        const cachedData = adminCache.get(key);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }

        // Se não tem cache, buscar da API
        setLoading(true);
        performanceMonitor.start(key);

        const result = await fetchFn();

        performanceMonitor.end(key);

        // Salvar no cache
        adminCache.set(key, result, ttlMinutes);

        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, ttlMinutes]);

  return { data, loading, error };
};
