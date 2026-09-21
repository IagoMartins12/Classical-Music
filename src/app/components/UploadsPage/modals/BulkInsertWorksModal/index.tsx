// app/components/uploads/modals/BulkInsertWorksModal.tsx - TRADUZIDO
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiMusic,
  FiSearch,
  FiPlay,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiExternalLink,
  FiInfo,
  FiLoader,
  FiTrash2,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Modal from '@/app/components/Modal';
import CreateWorkModal from '../CreateWorkModal';
import { useToast } from '@/app/hooks/useToast';
import { useProcessChanges } from '@/app/hooks/useFormChanges';
import { useTranslation } from '@/app/context/TranslationContext';
import Checkbox from '@/app/components/Common/Checkbox';
import {
  discoverComposerWorks,
  importComposerWorks,
  type ImportOutcome,
} from '@/app/requests/external-sources';

/**
 * Obras por chamada de importação. A API aceita até 100 e limita a 5 chamadas
 * por minuto; lotes menores mostram o progresso andando.
 */
const IMPORT_CHUNK = 25;

interface DiscoveredWork {
  id: string;
  title: string;
  imslpId: string;
  imslpUrl: string;
  opOrCatalog?: string;
  instrument?: string;
  selected: boolean;
  alreadyExists?: boolean;
  existingWorkId?: string;
}

interface ProcessResult {
  workId: string;
  tempId: string;
  title: string;
  status: 'success' | 'error' | 'duplicate' | 'skipped';
  message: string;
  details?: any;
  createdWorkId?: string;
}

// Interface para tracking de progresso individual
interface WorkProgress {
  tempId: string;
  title: string;
  status: 'waiting' | 'processing' | 'success' | 'error';
  message?: string;
  details?: any;
}

interface BulkInsertWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  composer: {
    id: string;
    name: string;
    fullName: string;
    imslpId?: string;
    permLinkImslp?: string;
  };
  instruments: Array<{ id: string; name: string; category?: string | null }>;
  epochs: Array<{ id: string; name: string }>;
}

const BulkInsertWorksModal = ({
  isOpen,
  onClose,
  composer,
  instruments,
  epochs,
}: BulkInsertWorksModalProps) => {
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation({ sections: ['pages/uploads'] });

  // Estados principais
  const [currentStep, setCurrentStep] = useState<
    'discover' | 'select' | 'process' | 'results'
  >('discover');
  const [discoveredWorks, setDiscoveredWorks] = useState<DiscoveredWork[]>([]);
  const [processResults, setProcessResults] = useState<ProcessResult[]>([]);

  // Estados para progresso individual
  const [workProgress, setWorkProgress] = useState<WorkProgress[]>([]);

  // Estados de loading
  const [isDiscovering, setIsDiscovering] = useState(false);

  // Estados de edição
  const [editingWork, setEditingWork] = useState<DiscoveredWork | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const hasProcess = useProcessChanges(isDiscovering);

  // Estados de estatísticas
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    existing: 0,
    selected: 0,
  });

  // Descobrir obras do compositor
  const handleDiscoverWorks = async () => {
    setIsDiscovering(true);
    try {
      const data = await discoverComposerWorks(composer.id);
      const works: DiscoveredWork[] = data.works.map((work) => ({
        id: work.imslpId,
        title: work.title,
        imslpId: work.imslpId,
        imslpUrl: work.imslpUrl,
        selected: false,
        alreadyExists: work.alreadyImported,
      }));

      setDiscoveredWorks(works);
      updateStats(works);
      setCurrentStep('select');
    } catch (error) {
      console.error('❌ Erro ao descobrir obras:', error);
      toast.error(
        t('toast_error'),
        error instanceof Error ? error.message : t('toast_bulk_discover_error')
      );
    } finally {
      setIsDiscovering(false);
    }
  };

  // Atualizar estatísticas
  const updateStats = (works: DiscoveredWork[]) => {
    const newStats = {
      total: works.length,
      new: works.filter((w) => !w.alreadyExists).length,
      existing: works.filter((w) => w.alreadyExists).length,
      selected: works.filter((w) => w.selected).length,
    };
    setStats(newStats);
  };

  // Toggle seleção de obra
  const toggleWorkSelection = (workId: string) => {
    const updated = discoveredWorks.map((work) =>
      work.id === workId ? { ...work, selected: !work.selected } : work
    );
    setDiscoveredWorks(updated);
    updateStats(updated);
  };

  // Selecionar/deselecionar todas
  const toggleSelectAll = (selectAll: boolean) => {
    const updated = discoveredWorks.map((work) => ({
      ...work,
      selected: selectAll && !work.alreadyExists,
    }));
    setDiscoveredWorks(updated);
    updateStats(updated);
  };

  // Remover obra da lista
  const removeWork = (workId: string) => {
    const updated = discoveredWorks.filter((work) => work.id !== workId);
    setDiscoveredWorks(updated);
    updateStats(updated);
  };

  // Processar obras com progresso individual
  const handleProcessWorks = async () => {
    const selectedWorks = discoveredWorks.filter(
      (w) => w.selected && !w.alreadyExists
    );

    if (selectedWorks.length === 0) {
      toast.error(t('toast_error'), t('toast_bulk_no_works_selected'));
      return;
    }

    setCurrentStep('process');
    setProcessResults([]);

    // Inicializar progresso individual para cada obra
    const initialProgress: WorkProgress[] = selectedWorks.map((work) => ({
      tempId: work.id,
      title: work.title,
      status: 'waiting',
      message: t('bulk_processing_waiting'),
    }));
    setWorkProgress(initialProgress);

    try {
      const results: ProcessResult[] = [];

      // A API lê e grava as obras no mesmo processo, em lote (o legado
      // chamava a própria API sem cookie, obra a obra, e toda importação
      // voltava 401 marcada como sucesso). O progresso anda de lote em lote.
      for (let start = 0; start < selectedWorks.length; start += IMPORT_CHUNK) {
        const chunk = selectedWorks.slice(start, start + IMPORT_CHUNK);
        const inChunk = new Set(chunk.map((work) => work.id));

        setWorkProgress((prev) =>
          prev.map((p) =>
            inChunk.has(p.tempId)
              ? {
                  ...p,
                  status: 'processing',
                  message: t('bulk_processing_scraping'),
                }
              : p
          )
        );

        let outcomes: ImportOutcome[] = [];
        let chunkError: string | null = null;

        try {
          const imported = await importComposerWorks(
            composer.id,
            chunk.map((work) => work.imslpUrl)
          );
          outcomes = imported.outcomes;
        } catch (error) {
          chunkError =
            error instanceof Error
              ? error.message
              : t('bulk_processing_connection_error');
        }

        const byUrl = new Map(
          outcomes.map((outcome) => [outcome.imslpUrl, outcome])
        );

        const chunkResults: ProcessResult[] = chunk.map((work, index) => {
          const outcome = byUrl.get(work.imslpUrl) ?? outcomes[index];
          const status: ProcessResult['status'] = !outcome
            ? 'error'
            : outcome.status === 'imported'
              ? 'success'
              : outcome.status === 'duplicate'
                ? 'duplicate'
                : 'error';

          return {
            workId: work.imslpId,
            tempId: work.id,
            title: work.title,
            status,
            message:
              status === 'success'
                ? t('bulk_processing_success')
                : outcome?.reason || chunkError || t('toast_bulk_import_error'),
            createdWorkId: outcome?.workId,
          };
        });

        results.push(...chunkResults);

        setWorkProgress((prev) =>
          prev.map((p) => {
            const result = chunkResults.find((r) => r.tempId === p.tempId);

            return result
              ? {
                  ...p,
                  status: result.status === 'error' ? 'error' : 'success',
                  message: result.message,
                }
              : p;
          })
        );
      }

      setProcessResults(results);
      setCurrentStep('results');

      // Refresh da página
      router.refresh();

      // O registro da importação fica na trilha de auditoria da API
      // (`imslp.works.import`); a rota de histórico em lote do legado saiu.
    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      toast.error(
        t('toast_error'),
        error instanceof Error ? error.message : t('toast_bulk_import_error')
      );
    }
  };

  // Fechar modal e resetar
  const handleClose = () => {
    setCurrentStep('discover');
    setDiscoveredWorks([]);
    setProcessResults([]);
    setWorkProgress([]);
    setStats({ total: 0, new: 0, existing: 0, selected: 0 });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        maxWidth="4xl"
        showCloseButton={true}
        confirmOnClose={true}
        isProcessing={
          hasProcess || currentStep === 'process' || currentStep === 'select'
        }
        processName={
          isDiscovering
            ? 'Descoberta de obras'
            : currentStep === 'process'
              ? 'Processamento de obra'
              : currentStep === 'results'
                ? 'Resultados de obras'
                : currentStep === 'select'
                  ? 'Seleção de obras'
                  : 'process'
        }
      >
        <AnimatedItem direction="scale" springType="bouncy" className="w-full">
          <div className="max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-green rounded-xl flex items-center justify-center">
                  <FiMusic className="w-5 h-5 text-theme-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-theme-primary classical-title">
                    {t('bulk_modal_title')}
                  </h2>
                  <p className="text-theme-secondary text-sm">
                    {composer.fullName || composer.name}
                  </p>
                </div>
              </div>

              {/* Step indicator */}
              <div className="flex items-center space-x-2">
                {['discover', 'select', 'process', 'results'].map(
                  (step, index) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        currentStep === step
                          ? 'bg-gray-400'
                          : index <
                              [
                                'discover',
                                'select',
                                'process',
                                'results',
                              ].indexOf(currentStep)
                            ? 'bg-green-400'
                            : 'bg-theme-secondary'
                      }`}
                    />
                  )
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {/* Step 1: Discover */}
              {currentStep === 'discover' && (
                <div className="p-6 text-center">
                  <AnimatedCard className="classical-card-2 p-8 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-green rounded-full flex items-center justify-center mx-auto mb-6">
                      <FiSearch className="w-8 h-8 text-theme-primary" />
                    </div>

                    <h3 className="text-lg font-bold text-theme-primary mb-4">
                      {t('bulk_step_discover')}
                    </h3>

                    <p className="text-theme-secondary mb-6">
                      {t('bulk_step_discover_description', {
                        composer: composer.fullName,
                      })}
                    </p>

                    <div className="space-y-3">
                      <div className="text-xs text-theme-tertiary p-3 bg-theme-secondary/10 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <FiInfo className="w-3 h-3" />
                          <span className="font-medium">
                            {t('bulk_step_discover_how_title')}
                          </span>
                        </div>
                        <ul className="text-left space-y-1 ml-5">
                          <li>• {t('bulk_step_discover_how_1')}</li>
                          <li>• {t('bulk_step_discover_how_2')}</li>
                          <li>• {t('bulk_step_discover_how_3')}</li>
                          <li>• {t('bulk_step_discover_how_4')}</li>
                        </ul>
                      </div>

                      <Button
                        variant="primary"
                        size="lg"
                        leftIcon={
                          isDiscovering ? (
                            <FiLoader className="animate-spin" />
                          ) : (
                            <FiSearch />
                          )
                        }
                        onClick={handleDiscoverWorks}
                        disabled={isDiscovering}
                        className="w-full"
                      >
                        {isDiscovering
                          ? t('bulk_discovering')
                          : t('bulk_discover_button')}
                      </Button>
                    </div>
                  </AnimatedCard>
                </div>
              )}

              {/* Step 2: Select */}
              {currentStep === 'select' && (
                <div className="p-6">
                  {/* Stats and controls */}
                  <div className="mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-theme-primary">
                          {stats.total}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {t('bulk_stats_total')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent-green">
                          {stats.new}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {t('bulk_stats_new')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent-amber">
                          {stats.existing}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {t('bulk_stats_existing')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-brand-primary">
                          {stats.selected}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {t('bulk_stats_selected')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="md"
                          onClick={() => toggleSelectAll(true)}
                        >
                          {t('bulk_select_all_new')}
                        </Button>
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() => toggleSelectAll(false)}
                        >
                          {t('bulk_unselect_all')}
                        </Button>
                      </div>

                      <Button
                        variant="primary"
                        leftIcon={<FiPlay />}
                        onClick={handleProcessWorks}
                        disabled={stats.selected === 0}
                      >
                        {t('bulk_import_button', {
                          count: stats.selected,
                          plural: stats.selected !== 1 ? 's' : '',
                        })}
                      </Button>
                    </div>
                  </div>

                  {/* Works list */}
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {discoveredWorks.map((work, index) => (
                      <AnimatedItem
                        key={work.id}
                        direction="left"
                        style={{
                          animationDelay: `${index * 0.05}s`,
                          animationFillMode: 'backwards',
                        }}
                      >
                        <div
                          className={`classical-card-simple mr-4 rounded-lg p-4 transition-all ${
                            work.alreadyExists
                              ? 'bg-accent-amber/5 border-accent-amber/20'
                              : work.selected
                                ? 'bg-brand-primary/5 border-brand-primary/30'
                                : 'bg-theme-elevated border-theme-secondary hover:border-theme-primary'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {/* Checkbox */}
                              <Checkbox
                                type={work.alreadyExists ? 'text' : 'checkbox'}
                                checked={work.selected}
                                disabled={work.alreadyExists}
                                onChange={() => toggleWorkSelection(work.id)}
                                className="w-4 h-4 text-brand-primary bg-theme-elevated border-theme-secondary rounded focus:ring-brand-primary"
                              />

                              {/* Work info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-theme-primary truncate">
                                  {work.title}
                                </h4>
                                <div className="flex items-center space-x-4 text-xs text-theme-tertiary">
                                  {work.opOrCatalog && (
                                    <span>{work.opOrCatalog}</span>
                                  )}
                                  {work.instrument && (
                                    <span>{work.instrument}</span>
                                  )}
                                </div>
                              </div>

                              {/* Status badges */}
                              <div className="flex items-center space-x-2">
                                {work.alreadyExists && (
                                  <span className="text-xs bg-accent-amber/20 text-accent-amber px-2 py-1 rounded-full">
                                    {t('bulk_work_exists')}
                                  </span>
                                )}

                                <a
                                  href={work.imslpUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-theme-tertiary hover:text-accent-blue"
                                >
                                  <FiExternalLink className="w-4 h-4" />
                                </a>

                                <button
                                  onClick={() => removeWork(work.id)}
                                  className="text-theme-tertiary hover:text-accent-red"
                                  title={t('bulk_remove_work')}
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AnimatedItem>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Process - Com progresso individual */}
              {currentStep === 'process' && (
                <div className="p-6">
                  <div className="mb-6 text-center">
                    <h3 className="text-lg font-bold text-theme-primary mb-2">
                      {t('bulk_processing_title')}
                    </h3>
                    <p className="text-theme-secondary mb-4">
                      {t('bulk_processing_description', {
                        count: stats.selected,
                      })}
                    </p>

                    {/* Barra de progresso geral */}
                    <div className="w-full bg-theme-secondary rounded-full h-2 mb-2">
                      <div
                        className="progress-bar h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (workProgress.filter(
                              (w) =>
                                w.status === 'success' || w.status === 'error'
                            ).length /
                              workProgress.length) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-theme-tertiary">
                      {t('bulk_processing_progress', {
                        completed: workProgress.filter(
                          (w) => w.status === 'success' || w.status === 'error'
                        ).length,
                        total: workProgress.length,
                      })}
                    </div>
                  </div>

                  {/* Lista de obras com progresso individual */}
                  <div className="max-h-96 overflow-y-auto overflow-x-hidden space-y-3">
                    {workProgress.map((work) => (
                      <div
                        key={work.tempId}
                        className={`classical-card-simple rounded-lg p-4 transition-all ${
                          work.status === 'success'
                            ? 'bg-accent-green/5 border-accent-green/20'
                            : work.status === 'error'
                              ? 'bg-accent-red/5 border-accent-red/20'
                              : work.status === 'processing'
                                ? 'bg-brand-primary/5 border-brand-primary/30'
                                : 'bg-theme-elevated border-theme-secondary'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Status icon */}
                          <div className="flex-shrink-0">
                            {work.status === 'waiting' && (
                              <div className="w-5 h-5 rounded-full bg-theme-secondary flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-theme-tertiary"></div>
                              </div>
                            )}
                            {work.status === 'processing' && (
                              <FiLoader className="w-5 h-5 text-brand-primary animate-spin" />
                            )}
                            {work.status === 'success' && (
                              <div className="w-5 h-5 rounded-full bg-accent-green flex items-center justify-center">
                                <FiCheck className="w-3 h-3 text-white" />
                              </div>
                            )}
                            {work.status === 'error' && (
                              <div className="w-5 h-5 rounded-full bg-accent-red flex items-center justify-center">
                                <FiX className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Work info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-theme-primary truncate">
                              {work.title}
                            </h4>
                            <p
                              className={`text-xs ${
                                work.status === 'success'
                                  ? 'text-accent-green'
                                  : work.status === 'error'
                                    ? 'text-accent-red'
                                    : work.status === 'processing'
                                      ? 'text-brand-primary'
                                      : 'text-theme-tertiary'
                              }`}
                            >
                              {work.message}
                            </p>
                            {work.details?.finalTitle &&
                              work.details.finalTitle !== work.title && (
                                <p className="text-xs text-theme-secondary">
                                  {t('bulk_processing_final_title', {
                                    title: work.details.finalTitle,
                                  })}
                                </p>
                              )}
                          </div>

                          {/* Progress indicator para a obra atual */}
                          {work.status === 'processing' && (
                            <div className="flex-shrink-0">
                              <div className="w-16 bg-theme-secondary rounded-full h-1">
                                <div className="bg-brand-primary h-1 rounded-full animate-pulse w-8"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Results */}
              {currentStep === 'results' && (
                <div className="p-6">
                  <div className="mb-6 text-center">
                    <h3 className="text-lg font-bold text-theme-primary mb-2">
                      {t('bulk_results_title')}
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent-green">
                          {
                            processResults.filter((r) => r.status === 'success')
                              .length
                          }
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {t('bulk_results_success')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent-red">
                          {
                            processResults.filter((r) => r.status === 'error')
                              .length
                          }
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {t('bulk_results_errors')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent-amber">
                          {
                            processResults.filter(
                              (r) => r.status === 'duplicate'
                            ).length
                          }
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {t('bulk_results_duplicates')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-theme-tertiary">
                          {
                            processResults.filter((r) => r.status === 'skipped')
                              .length
                          }
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {t('bulk_results_skipped')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Results list */}
                  <div className="max-h-80 flex flex-col gap-2 px-4 py-2 overflow-y-auto overflow-x-hidden space-y-2">
                    {processResults.map((result) => (
                      <div
                        key={result.tempId}
                        className={`rounded-lg border p-3 ${
                          result.status === 'success'
                            ? 'bg-accent-green/5 border border-green-300'
                            : result.status === 'error'
                              ? 'bg-accent-red/5 border border-red-300'
                              : result.status === 'duplicate'
                                ? 'bg-accent-amber/5 border-amber-300'
                                : 'bg-theme-elevated border-theme-secondary'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {result.status === 'success' && (
                              <FiCheck className="w-4 h-4 text-accent-green" />
                            )}
                            {result.status === 'error' && (
                              <FiX className="w-4 h-4 text-accent-red" />
                            )}
                            {result.status === 'duplicate' && (
                              <FiAlertCircle className="w-4 h-4 text-accent-amber" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-theme-primary truncate">
                              {result.title}
                            </h4>
                            <p className="text-xs text-theme-secondary">
                              {result.message.includes('__TURBOPACK')
                                ? t('bulk_results_error_processing')
                                : result.message}
                            </p>
                            {result.details?.finalTitle &&
                              result.details.finalTitle !== result.title && (
                                <p className="text-xs text-brand-primary">
                                  {t('bulk_processing_final_title', {
                                    title: result.details.finalTitle,
                                  })}
                                </p>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <Button variant="primary" onClick={handleClose}>
                      {t('bulk_results_complete_button')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </AnimatedItem>
      </Modal>

      {/* Edit Work Modal */}
      {showEditModal && editingWork && (
        <CreateWorkModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingWork(null);
          }}
          composers={[
            {
              id: composer.id,
              name: composer.name,
              fullName: composer.fullName,
            },
          ]}
          instruments={instruments}
          epochs={epochs}
          editingWork={{
            id: editingWork.id,
            title: editingWork.title,
            composerId: composer.id,
            imslpId: editingWork.imslpId,
            imslpPermlink: editingWork.imslpUrl,
            opOrCatalog: editingWork.opOrCatalog,
          }}
        />
      )}
    </>
  );
};

export default BulkInsertWorksModal;
