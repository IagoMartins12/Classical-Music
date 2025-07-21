import React, { useState, useEffect } from 'react';
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
  FiZap,
} from 'react-icons/fi';
import { SiSpotify, SiYoutube } from 'react-icons/si';

interface MediaStats {
  total: number;
  withSpotify: number;
  withYoutube: number;
  withBoth: number;
  withNone: number;
  validForAutoSearch: number;
  invalidForAutoSearch: number;
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

const MediaManager: React.FC = () => {
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [batchJob, setBatchJob] = useState<BatchJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState('ultra-simple');

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
        body: JSON.stringify({
          action: 'start',
          strategy: selectedStrategy,
        }),
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-white font-medium">
                Carregando estatísticas...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Gerenciador de Mídia
            </h1>
            <p className="text-gray-400 mt-2">
              Sistema ultra-simplificado para busca automática de áudio e vídeo
            </p>
          </div>
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Atualizar</span>
          </button>
        </div>

        {/* Estatísticas Principais */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FiDatabase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Total de Obras</h3>
                  <p className="text-2xl font-bold text-blue-400">
                    {stats.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <SiSpotify className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Com Spotify</h3>
                  <p className="text-2xl font-bold text-green-400">
                    {stats.withSpotify.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    {((stats.withSpotify / stats.total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <SiYoutube className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Com YouTube</h3>
                  <p className="text-2xl font-bold text-red-400">
                    {stats.withYoutube.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    {((stats.withYoutube / stats.total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <FiCheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Com Ambos</h3>
                  <p className="text-2xl font-bold text-purple-400">
                    {stats.withBoth.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    {((stats.withBoth / stats.total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas de Busca Automática */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FiZap className="w-5 h-5 text-yellow-400" />
                <span>Elegibilidade para Busca Automática</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Obras Válidas</span>
                    <span className="text-green-400 font-medium">
                      {stats.validForAutoSearch} (
                      {((stats.validForAutoSearch / stats.total) * 100).toFixed(
                        1
                      )}
                      %)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats.validForAutoSearch / stats.total) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Obras Inválidas</span>
                    <span className="text-orange-400 font-medium">
                      {stats.invalidForAutoSearch} (
                      {(
                        (stats.invalidForAutoSearch / stats.total) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats.invalidForAutoSearch / stats.total) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                <p className="text-yellow-300 text-xs">
                  <strong>Obras inválidas:</strong> Coletâneas, livros, métodos,
                  exercícios e obras muito genéricas são excluídas da busca
                  automática.
                </p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FiBarChart2 className="w-5 h-5 text-blue-400" />
                <span>Cobertura de Mídia</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Sem Mídia</span>
                    <span className="text-gray-400 font-medium">
                      {stats.withNone} (
                      {((stats.withNone / stats.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-gray-500 to-gray-400 h-2 rounded-full"
                      style={{
                        width: `${(stats.withNone / stats.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Com Mídia</span>
                    <span className="text-blue-400 font-medium">
                      {stats.total - stats.withNone} (
                      {(
                        ((stats.total - stats.withNone) / stats.total) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                      style={{
                        width: `${
                          ((stats.total - stats.withNone) / stats.total) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status do Job em Lote */}
        {batchJob && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                  {batchJob.status === 'running' ? (
                    <FiPlay className="w-5 h-5 text-white animate-pulse" />
                  ) : batchJob.status === 'paused' ? (
                    <FiPause className="w-5 h-5 text-white" />
                  ) : batchJob.status === 'error' ? (
                    <FiAlertTriangle className="w-5 h-5 text-white" />
                  ) : (
                    <FiCheckCircle className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Busca Ultra-Simples -{' '}
                    {batchJob.status === 'running'
                      ? 'Em Execução'
                      : batchJob.status === 'paused'
                      ? 'Pausado'
                      : batchJob.status === 'error'
                      ? 'Erro'
                      : 'Concluído'}
                  </h3>
                  <p className="text-gray-400">
                    {batchJob.processed} de {batchJob.total} obras processadas
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                {batchJob.status === 'running' && (
                  <button
                    onClick={pauseBatchSearch}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <FiPause className="w-4 h-4" />
                    <span>Pausar</span>
                  </button>
                )}

                {batchJob.status === 'paused' && (
                  <button
                    onClick={resumeBatchSearch}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <FiPlay className="w-4 h-4" />
                    <span>Retomar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Progresso: {batchJob.progress.toFixed(1)}%</span>
                <span>Mídia encontrada: {batchJob.found}</span>
                <span>Erros: {batchJob.errors}</span>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${batchJob.progress}%` }}
                />
              </div>

              {batchJob.estimatedCompletion && (
                <p className="text-sm text-gray-400 text-center">
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
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <FiSearch className="w-5 h-5" />
            <span>Busca Ultra-Simples em Lote</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Info sobre a estratégia */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estratégia de Busca:
              </label>
              <div className="p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FiZap className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium">Ultra-Simples</span>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Busca: "título - compositor"</li>
                  <li>• Sempre pega o PRIMEIRO resultado válido</li>
                  <li>• Filtra apenas música clássica</li>
                  <li>• Exclui coletâneas e obras complexas</li>
                  <li>• Máxima velocidade e eficiência</li>
                </ul>
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col justify-end space-y-3">
              <button
                onClick={startBatchSearch}
                disabled={batchJob?.status === 'running'}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <FiPlay className="w-5 h-5" />
                <span>Iniciar Busca Ultra-Simples</span>
              </button>

              <button className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors">
                <FiSettings className="w-4 h-4" />
                <span>Configurações Avançadas</span>
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <p className="text-blue-300 text-sm mb-2">
              <strong>🚀 Sistema Ultra-Simplificado:</strong>
            </p>
            <ul className="text-blue-400 text-sm space-y-1 ml-4">
              <li>
                • Busca apenas obras válidas (exclui coletâneas automaticamente)
              </li>
              <li>• Query simples: "título - compositor"</li>
              <li>• Pega sempre o primeiro resultado válido encontrado</li>
              <li>• 10x mais rápido que o sistema anterior</li>
              <li>• Respeita rate limits: 1 req/seg para cada API</li>
            </ul>
          </div>
        </div>

        {/* Última atualização */}
        {stats && (
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Última atualização:{' '}
              {new Date(stats.lastUpdated).toLocaleString('pt-BR')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaManager;
