// app/hooks/useScrapers.ts
'use client';

import { useState, useEffect } from 'react';
import { ScraperApiClient } from '@/app/services/scraper-api/scraper-api.client';
import { ScraperInfo } from '@/app/services/scraper-api/scraper-api.types';
import {
  ScraperConfig,
  SCRAPERS,
} from '../services/scraper-api/scappers/base-scraper.config';

export function useScrapers() {
  const [scrapers, setScrapers] = useState<ScraperConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScrapers();
  }, []);

  const loadScrapers = async () => {
    try {
      setIsLoading(true);

      // Buscar scrapers do backend
      const backendScrapers = await ScraperApiClient.listScrapers();

      // Mesclar com configurações locais
      const mergedScrapers = backendScrapers.map((backend: ScraperInfo) => {
        const localConfig = SCRAPERS[backend.id];
        return {
          id: backend.id,
          name: backend.name,
          description: localConfig?.description || backend.name,
          venue: backend.name,
          icon: localConfig?.icon || '🎵',
          color: localConfig?.color || '#8B5CF6',
          enabled: true,
        };
      });

      setScrapers(mergedScrapers);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao carregar scrapers:', err);
      setError(err.message);

      // Fallback para configuração local
      const localScrapers = Object.values(SCRAPERS).filter((s) => s.enabled);
      setScrapers(localScrapers);
    } finally {
      setIsLoading(false);
    }
  };

  return { scrapers, isLoading, error, reload: loadScrapers };
}
