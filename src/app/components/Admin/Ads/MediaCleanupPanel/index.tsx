// app/admin/ads/components/MediaCleanupPanel.tsx - Painel para limpeza de mídia
'use client';

import { useState, useEffect } from 'react';
import {
  FiTrash2,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheck,
  FiFolder,
  FiHardDrive,
  FiInfo,
  FiPlay,
  FiEye,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '@/app/components/Common/Button';

interface MediaReport {
  orphanedDirectories: string[];
  integrityCheck: {
    adsWithMissingMedia: Array<{
      id: string;
      title: string;
      expectedDirectory: string;
      missingFiles: string[];
    }>;
    adsWithValidMedia: number;
    totalChecked: number;
  };
  totalOrphanedSize: number;
  recommendations: string[];
}

interface CleanupResult {
  removed: string[];
  failed: string[];
  totalSize: number;
  formattedSize: string;
  dryRun: boolean;
}

export default function MediaCleanupPanel() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<MediaReport | null>(null);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(
    null
  );
  const [selectedDirectories, setSelectedDirectories] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  // Carregar relatório inicial
  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        '/api/admin/ads/media-cleanup?action=report'
      );
      const data = await response.json();

      if (data.success) {
        setReport(data.data);
      } else {
        toast.error('Erro ao carregar relatório');
      }
    } catch {
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const runCleanup = async (dryRun: boolean = true) => {
    if (
      !dryRun &&
      selectedDirectories.length === 0 &&
      report?.orphanedDirectories.length === 0
    ) {
      toast.error('Nenhuma pasta para limpar');
      return;
    }

    if (
      !dryRun &&
      !confirm(
        `Tem certeza que deseja remover ${
          selectedDirectories.length > 0
            ? selectedDirectories.length
            : report?.orphanedDirectories.length
        } pasta(s)? Esta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/ads/media-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cleanup',
          dryRun,
          directories:
            selectedDirectories.length > 0 ? selectedDirectories : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCleanupResult(data.data);
        toast.success(data.message);

        if (!dryRun) {
          // Recarregar relatório após limpeza real
          setTimeout(() => {
            loadReport();
            setSelectedDirectories([]);
          }, 1000);
        }
      } else {
        toast.error(data.error || 'Erro na limpeza');
      }
    } catch {
      toast.error('Erro ao executar limpeza');
    } finally {
      setLoading(false);
    }
  };

  const toggleDirectorySelection = (directory: string) => {
    setSelectedDirectories((prev) =>
      prev.includes(directory)
        ? prev.filter((d) => d !== directory)
        : [...prev, directory]
    );
  };

  const selectAllDirectories = () => {
    if (!report) return;

    if (selectedDirectories.length === report.orphanedDirectories.length) {
      setSelectedDirectories([]);
    } else {
      setSelectedDirectories([...report.orphanedDirectories]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary">
            Limpeza de Mídia
          </h2>
          <p className="text-theme-tertiary">
            Gerencie arquivos órfãos e verifique integridade da mídia
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="ghost"
            leftIcon={<FiRefreshCw className={loading ? 'animate-spin' : ''} />}
            onClick={loadReport}
            disabled={loading}
          >
            Atualizar
          </Button>

          <Button
            variant="ghost"
            leftIcon={<FiEye />}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Ocultar' : 'Detalhes'}
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && !report && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-theme-tertiary">Carregando relatório...</p>
        </div>
      )}

      {/* Resumo */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="classical-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-theme-tertiary">Pastas Órfãs</p>
                <p className="text-2xl font-bold text-accent-amber">
                  {report.orphanedDirectories.length}
                </p>
              </div>
              <FiFolder className="w-8 h-8 text-accent-amber" />
            </div>
          </div>

          <div className="classical-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-theme-tertiary">Espaço Órfão</p>
                <p className="text-2xl font-bold text-accent-red">
                  {formatFileSize(report.totalOrphanedSize)}
                </p>
              </div>
              <FiHardDrive className="w-8 h-8 text-accent-red" />
            </div>
          </div>

          <div className="classical-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-theme-tertiary">Mídia Válida</p>
                <p className="text-2xl font-bold text-accent-green">
                  {report.integrityCheck.adsWithValidMedia}
                </p>
              </div>
              <FiCheck className="w-8 h-8 text-accent-green" />
            </div>
          </div>
        </div>
      )}

      {/* Recomendações */}
      {report && report.recommendations.length > 0 && (
        <div className="classical-card p-4 bg-accent-blue/5 border border-accent-blue/20">
          <h3 className="font-semibold text-theme-primary mb-3 flex items-center">
            <FiInfo className="w-5 h-5 mr-2 text-accent-blue" />
            Recomendações
          </h3>
          <ul className="space-y-2">
            {report.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-theme-secondary">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resultado da limpeza */}
      {cleanupResult && (
        <div
          className={`classical-card p-4 ${
            cleanupResult.dryRun
              ? 'bg-accent-blue/5 border border-accent-blue/20'
              : 'bg-accent-green/5 border border-accent-green/20'
          }`}
        >
          <h3 className="font-semibold text-theme-primary mb-3 flex items-center">
            <FiCheck
              className={`w-5 h-5 mr-2 ${
                cleanupResult.dryRun ? 'text-accent-blue' : 'text-accent-green'
              }`}
            />
            {cleanupResult.dryRun
              ? 'Simulação de Limpeza'
              : 'Limpeza Executada'}
          </h3>

          <div className="space-y-2 text-sm">
            <p>
              <strong>{cleanupResult.removed.length}</strong> pasta(s){' '}
              {cleanupResult.dryRun ? 'seriam removidas' : 'removidas'}
            </p>
            <p>
              <strong>{cleanupResult.formattedSize}</strong>{' '}
              {cleanupResult.dryRun ? 'seriam liberados' : 'liberados'}
            </p>
            {cleanupResult.failed.length > 0 && (
              <p className="text-accent-red">
                <strong>{cleanupResult.failed.length}</strong> pasta(s) falharam
              </p>
            )}
          </div>
        </div>
      )}

      {/* Lista de pastas órfãs */}
      {report && report.orphanedDirectories.length > 0 && (
        <div className="classical-card">
          <div className="p-4 border-b border-theme-primary">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-theme-primary">
                Pastas Órfãs ({report.orphanedDirectories.length})
              </h3>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllDirectories}
                >
                  {selectedDirectories.length ===
                  report.orphanedDirectories.length
                    ? 'Desmarcar Todas'
                    : 'Selecionar Todas'}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FiPlay />}
                  onClick={() => runCleanup(true)}
                  disabled={loading}
                >
                  Simular Limpeza
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<FiTrash2 />}
                  onClick={() => runCleanup(false)}
                  disabled={loading || selectedDirectories.length === 0}
                  className="bg-accent-red hover:bg-accent-red/80"
                >
                  Remover Selecionadas
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {report.orphanedDirectories.map((directory, index) => (
              <div
                key={directory}
                className={`flex items-center space-x-3 p-3 hover:bg-theme-secondary/50 ${
                  index !== report.orphanedDirectories.length - 1
                    ? 'border-b border-theme-secondary'
                    : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedDirectories.includes(directory)}
                  onChange={() => toggleDirectorySelection(directory)}
                  className="rounded border-theme-primary"
                />

                <FiFolder className="w-4 h-4 text-accent-amber" />

                <div className="flex-1">
                  <span className="font-mono text-sm">{directory}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Problemas de integridade */}
      {showDetails &&
        report &&
        report.integrityCheck.adsWithMissingMedia.length > 0 && (
          <div className="classical-card">
            <div className="p-4 border-b border-theme-primary">
              <h3 className="font-semibold text-theme-primary flex items-center">
                <FiAlertTriangle className="w-5 h-5 mr-2 text-accent-amber" />
                Ads com Mídia Faltando (
                {report.integrityCheck.adsWithMissingMedia.length})
              </h3>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {report.integrityCheck.adsWithMissingMedia.map((ad, index) => (
                <div
                  key={ad.id}
                  className={`p-3 ${
                    index !==
                    report.integrityCheck.adsWithMissingMedia.length - 1
                      ? 'border-b border-theme-secondary'
                      : ''
                  }`}
                >
                  <div className="font-medium text-theme-primary">
                    {ad.title}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Pasta esperada: {ad.expectedDirectory}
                  </div>
                  <div className="text-xs text-accent-red mt-1">
                    Arquivos faltando: {ad.missingFiles.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Estado vazio */}
      {report &&
        report.orphanedDirectories.length === 0 &&
        report.integrityCheck.adsWithMissingMedia.length === 0 && (
          <div className="text-center py-12">
            <FiCheck className="w-16 h-16 text-accent-green mx-auto mb-4" />
            <h3 className="text-xl font-medium text-theme-primary mb-2">
              Mídia está íntegra!
            </h3>
            <p className="text-theme-tertiary">
              Não há pastas órfãs ou problemas de integridade encontrados.
            </p>
          </div>
        )}
    </div>
  );
}
