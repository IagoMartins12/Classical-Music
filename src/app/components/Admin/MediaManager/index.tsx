// app/components/Admin/MediaManager.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiPlay,
  FiPause,
  FiRefreshCw,
  FiBarChart2,
  FiSettings,
  FiDatabase,
  FiSearch,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi';
import { SiSpotify, SiYoutube } from 'react-icons/si';

interface MediaStats {
  total: number;
  withSpotify: number;
  withYoutube: number;
  withBoth: number;
  withNone: number;
  pending: number;
  errors: number;
  lastUpdated: string;
}

interface BatchJob {
  id: string;
  status: 'running' | 'completed' | 'paused' | 'error';
  progress: number;
  total: number;
  processed: number;
  found: number;
  errors: number;
  startedAt: string;
  estimatedCompletion?: string;
}

export default function MediaManager() {
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [batchJob, setBatchJob] = useState<BatchJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Carregar estatísticas
  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/media-stats');
      const data = await response.json();
      setStats(data.stats);
      setBatchJob(data.batchJob);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setIsLoading(false);
    }
  };

  const startBatchSearch = async () => {
    try {
      const response = await fetch('/api/admin/media-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', filter: selectedFilter }),
      });

      if (response.ok) {
        loadStats(); // Recarregar para ver o job iniciado
      }
    } catch (error) {
      console.error('Erro ao iniciar busca em lote:', error);
    }
  };

  const pauseBatchSearch = async () => {
    try {
      const response = await fetch('/api/admin/media-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause' }),
      });

      if (response.ok) {
        loadStats();
      }
    } catch (error) {
      console.error('Erro ao pausar busca:', error);
    }
  };

  const resumeBatchSearch = async () => {
    try {
      const response = await fetch('/api/admin/media-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume' }),
      });

      if (response.ok) {
        loadStats();
      }
    } catch (error) {
      console.error('Erro ao retomar busca:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-primary">
        <div className="section-wrap">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
              <span className="text-theme-primary font-medium">
                Carregando estatísticas...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-primary">
      <div className="section-wrap space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-brand classical-title">
              Gerenciador de Mídia
            </h1>
            <p className="text-theme-secondary mt-2">
              Gerencie a busca automática de áudio e vídeo para as obras
            </p>
          </div>
          <button
            onClick={loadStats}
            className="btn-classical-secondary flex items-center space-x-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Atualizar</span>
          </button>
        </div>

        {/* Estatísticas Gerais */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="classical-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                  <FiDatabase className="w-5 h-5 text-theme-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-theme-primary">
                    Total de Obras
                  </h3>
                  <p className="text-2xl font-bold text-gradient-brand">
                    {stats.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="classical-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                  <SiSpotify className="w-5 h-5 text-theme-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-theme-primary">
                    Com Spotify
                  </h3>
                  <p className="text-2xl font-bold text-accent-green">
                    {stats.withSpotify.toLocaleString()}
                  </p>
                  <p className="text-sm text-theme-tertiary">
                    {((stats.withSpotify / stats.total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="classical-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-red to-accent-orange rounded-xl flex items-center justify-center">
                  <SiYoutube className="w-5 h-5 text-theme-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-theme-primary">
                    Com YouTube
                  </h3>
                  <p className="text-2xl font-bold text-accent-red">
                    {stats.withYoutube.toLocaleString()}
                  </p>
                  <p className="text-sm text-theme-tertiary">
                    {((stats.withYoutube / stats.total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="classical-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                  <FiCheckCircle className="w-5 h-5 text-theme-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-theme-primary">
                    Com Ambos
                  </h3>
                  <p className="text-2xl font-bold text-accent-purple">
                    {stats.withBoth.toLocaleString()}
                  </p>
                  <p className="text-sm text-theme-tertiary">
                    {((stats.withBoth / stats.total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status do Job em Lote */}
        {batchJob && (
          <div className="classical-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-green rounded-xl flex items-center justify-center">
                  {batchJob.status === 'running' ? (
                    <FiPlay className="w-5 h-5 text-theme-primary animate-pulse" />
                  ) : batchJob.status === 'paused' ? (
                    <FiPause className="w-5 h-5 text-theme-primary" />
                  ) : batchJob.status === 'error' ? (
                    <FiAlertTriangle className="w-5 h-5 text-theme-primary" />
                  ) : (
                    <FiCheckCircle className="w-5 h-5 text-theme-primary" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary">
                    Busca em Lote -{' '}
                    {batchJob.status === 'running'
                      ? 'Em Execução'
                      : batchJob.status === 'paused'
                      ? 'Pausado'
                      : batchJob.status === 'error'
                      ? 'Erro'
                      : 'Concluído'}
                  </h3>
                  <p className="text-theme-secondary">
                    {batchJob.processed} de {batchJob.total} obras processadas
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                {batchJob.status === 'running' && (
                  <button
                    onClick={pauseBatchSearch}
                    className="btn-classical-secondary flex items-center space-x-2"
                  >
                    <FiPause className="w-4 h-4" />
                    <span>Pausar</span>
                  </button>
                )}

                {batchJob.status === 'paused' && (
                  <button
                    onClick={resumeBatchSearch}
                    className="btn-classical-primary flex items-center space-x-2"
                  >
                    <FiPlay className="w-4 h-4" />
                    <span>Retomar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-theme-tertiary">
                <span>Progresso: {batchJob.progress.toFixed(1)}%</span>
                <span>Encontrado mídia: {batchJob.found}</span>
                <span>Erros: {batchJob.errors}</span>
              </div>

              <div className="w-full bg-theme-secondary/20 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-accent-blue to-accent-green h-3 rounded-full transition-all duration-300"
                  style={{ width: `${batchJob.progress}%` }}
                />
              </div>

              {batchJob.estimatedCompletion && (
                <p className="text-sm text-theme-tertiary text-center">
                  <FiClock className="w-4 h-4 inline mr-1" />
                  Conclusão estimada:{' '}
                  {new Date(batchJob.estimatedCompletion).toLocaleString(
                    'pt-BR'
                  )}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Controles de Busca */}
        <div className="classical-card p-6">
          <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
            <FiSearch className="w-5 h-5" />
            <span>Busca em Lote</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Filtros */}
            <div>
              <label className="block text-sm font-medium text-theme-tertiary mb-2">
                Filtrar obras:
              </label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full px-3 py-2 bg-theme-elevated border border-theme-secondary rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="all">Todas as obras sem mídia</option>
                <option value="individual">Apenas obras individuais</option>
                <option value="collections-small">
                  Coleções pequenas (≤5 movimentos)
                </option>
                <option value="collections-medium">
                  Coleções médias (6-10 movimentos)
                </option>
                <option value="errors-only">
                  Apenas obras com erro anterior
                </option>
                <option value="high-priority">
                  Alta prioridade (compositores famosos)
                </option>
              </select>
            </div>

            {/* Ações */}
            <div className="flex items-end space-x-3">
              <button
                onClick={startBatchSearch}
                disabled={batchJob?.status === 'running'}
                className="btn-classical-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPlay className="w-4 h-4" />
                <span>Iniciar Busca</span>
              </button>

              <button className="btn-classical-secondary flex items-center space-x-2">
                <FiSettings className="w-4 h-4" />
                <span>Configurações</span>
              </button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
            <p className="text-sm text-theme-secondary mb-2">
              <strong>⚠️ Importante:</strong> A busca em lote pode levar várias
              horas para completar.
            </p>
            <ul className="text-sm text-theme-tertiary space-y-1 ml-4">
              <li>• Respeita limites de rate limiting das APIs</li>
              <li>• Processa obras em lotes de 10 com delays de 5s</li>
              <li>• Pode ser pausada e retomada a qualquer momento</li>
              <li>• Evita re-processar obras já analisadas</li>
            </ul>
          </div>
        </div>

        {/* Gráfico de Cobertura */}
        {stats && (
          <div className="classical-card p-6">
            <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
              <FiBarChart2 className="w-5 h-5" />
              <span>Cobertura de Mídia</span>
            </h3>

            <div className="space-y-4">
              {/* Spotify */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-theme-secondary">Spotify</span>
                  <span className="text-accent-green font-medium">
                    {stats.withSpotify} / {stats.total} (
                    {((stats.withSpotify / stats.total) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-theme-secondary/20 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-accent-green to-accent-blue h-2 rounded-full"
                    style={{
                      width: `${(stats.withSpotify / stats.total) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* YouTube */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-theme-secondary">YouTube</span>
                  <span className="text-accent-red font-medium">
                    {stats.withYoutube} / {stats.total} (
                    {((stats.withYoutube / stats.total) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-theme-secondary/20 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-accent-red to-accent-orange h-2 rounded-full"
                    style={{
                      width: `${(stats.withYoutube / stats.total) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Ambos */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-theme-secondary">
                    Ambas as plataformas
                  </span>
                  <span className="text-accent-purple font-medium">
                    {stats.withBoth} / {stats.total} (
                    {((stats.withBoth / stats.total) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-theme-secondary/20 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-accent-purple to-accent-blue h-2 rounded-full"
                    style={{
                      width: `${(stats.withBoth / stats.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-theme-tertiary">
                Última atualização:{' '}
                {new Date(stats.lastUpdated).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
