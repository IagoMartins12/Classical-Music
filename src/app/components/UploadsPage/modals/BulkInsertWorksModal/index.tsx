// app/components/uploads/modals/BulkInsertWorksModal.tsx - TRADUZIDO
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PiArrowSquareOut,
  PiCheck,
  PiMagnifyingGlass,
  PiPlay,
  PiSpinnerGap,
  PiTrash,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { CaixaDeMarcar } from '@/app/components/ui/CaixaDeMarcar';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import {
  Aviso,
  FormBlock,
  FormSheet,
} from '@/app/components/site/edit/FormSheet';
import CreateWorkModal from '../CreateWorkModal';
import { useToast } from '@/app/hooks/useToast';
import { useProcessChanges } from '@/app/hooks/useFormChanges';
import { useTranslation } from '@/app/context/TranslationContext';
import {
  discoverComposerWorks,
  importComposerWorks,
  type ImportOutcome,
} from '@/app/requests/external-sources';
import { useTx } from '@/app/hooks/useTx';
import { ApiError } from '@/app/libs/api/client';
import { QuillOnPaper } from '@/app/components/site/QuillOnPaper';

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
  const tx = useTx();
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
  // The search found nothing to import (no works, or no source to read).
  const [nothingFound, setNothingFound] = useState(false);

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
    setNothingFound(false);
    try {
      const data = await discoverComposerWorks(composer.id);
      if (!data.works.length) {
        setNothingFound(true);
        return;
      }
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
      // No page to read for this composer: to the person, simply no works.
      if (error instanceof ApiError && error.status === 404) {
        setNothingFound(true);
        return;
      }
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

  const etapas = ['discover', 'select', 'process', 'results'] as const;
  const etapaAtual = etapas.indexOf(currentStep as (typeof etapas)[number]);
  const feitas = workProgress.filter(
    (w) => w.status === 'success' || w.status === 'error'
  ).length;
  const contagem = (rotulo: string, valor: number) => (
    <div className="flex flex-col gap-1">
      <span className="font-display text-[1.75rem] leading-none text-texto tabular-nums">
        {valor}
      </span>
      <span className="t-legenda">{rotulo}</span>
    </div>
  );
  const iconeDoEstado = (status: string) =>
    status === 'processing' ? (
      <PiSpinnerGap
        aria-hidden="true"
        className="h-5 w-5 shrink-0 animate-spin text-ouro-texto"
      />
    ) : status === 'success' ? (
      <PiCheck
        aria-hidden="true"
        className="h-5 w-5 shrink-0 text-ouro-texto"
      />
    ) : status === 'error' ? (
      <PiX aria-hidden="true" className="h-5 w-5 shrink-0 text-erro" />
    ) : status === 'duplicate' ? (
      <PiWarningCircle
        aria-hidden="true"
        className="h-5 w-5 shrink-0 text-texto-suave"
      />
    ) : (
      <span
        aria-hidden="true"
        className="grid h-5 w-5 shrink-0 place-items-center"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--linha-forte)]" />
      </span>
    );

  const rodape =
    currentStep === 'discover' ? (
      <Button
        variante="primario"
        icone={PiMagnifyingGlass}
        carregando={isDiscovering}
        onClick={handleDiscoverWorks}
        className="w-full"
      >
        {isDiscovering ? t('bulk_discovering') : t('bulk_discover_button')}
      </Button>
    ) : currentStep === 'select' ? (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button tamanho="p" onClick={() => toggleSelectAll(true)}>
            {t('bulk_select_all_new')}
          </Button>
          <Button
            tamanho="p"
            variante="fantasma"
            onClick={() => toggleSelectAll(false)}
          >
            {t('bulk_unselect_all')}
          </Button>
        </div>
        <Button
          variante="primario"
          icone={PiPlay}
          onClick={handleProcessWorks}
          disabled={stats.selected === 0}
        >
          {t('bulk_import_button', {
            count: stats.selected,
            plural: stats.selected !== 1 ? 's' : '',
          })}
        </Button>
      </div>
    ) : currentStep === 'results' ? (
      <div className="flex justify-end">
        <Button variante="primario" onClick={handleClose}>
          {t('bulk_results_complete_button')}
        </Button>
      </div>
    ) : null;

  return (
    <>
      <FormSheet
        aberto={isOpen}
        aoFechar={handleClose}
        titulo={t('bulk_modal_title')}
        descricao={composer.fullName || composer.name}
        sujo={hasProcess || currentStep === 'select'}
        ocupado={currentStep === 'process' || isDiscovering}
        rodape={rodape}
      >
        <ol
          aria-label={tx('Etapas', 'Steps')}
          className="mb-6 flex items-center gap-2"
        >
          {etapas.map((etapa, i) => (
            <li
              key={etapa}
              aria-current={i === etapaAtual ? 'step' : undefined}
              className={cx(
                'h-1 flex-1 rounded-full',
                i <= etapaAtual ? 'bg-[var(--ouro)]' : 'bg-[var(--linha)]'
              )}
            />
          ))}
        </ol>

        {currentStep === 'discover' && (
          <FormBlock
            titulo={t('bulk_step_discover')}
            nota={t('bulk_step_discover_description', {
              composer: composer.fullName,
            })}
          >
            {isDiscovering ? (
              // Reading the composer's works takes a few seconds: the same
              // quill as the scores being fetched on a work page.
              <div
                role="status"
                className="flex flex-col items-center gap-5 rounded-card bg-sup-2 px-6 py-8 text-center"
              >
                <QuillOnPaper />
                <div className="flex max-w-[40ch] flex-col items-center gap-1.5">
                  <p className="font-display text-[1.375rem] leading-snug">
                    {tx(
                      `Procurando as obras de ${composer.name}…`,
                      `Looking for ${composer.name}'s works…`
                    )}
                  </p>
                  <p className="t-rotulo text-texto-suave">
                    {tx(
                      'Leva alguns segundos. A lista aparece sozinha.',
                      'It takes a few seconds. The list shows up on its own.'
                    )}
                  </p>
                </div>
              </div>
            ) : nothingFound ? (
              <div
                role="status"
                className="flex flex-col items-start gap-2 rounded-card bg-sup-2 p-6"
              >
                <p className="font-display text-[1.375rem] leading-snug">
                  {tx(
                    `Não encontramos obras de ${composer.name} para importar`,
                    `We found no works by ${composer.name} to import`
                  )}
                </p>
                <p className="t-rotulo text-texto-suave">
                  {tx(
                    'Ainda não temos obras deste compositor. Você pode cadastrar uma a uma pelo envio de obra.',
                    'We have no works by this composer yet. You can add them one by one through the work upload.'
                  )}
                </p>
              </div>
            ) : (
              <Aviso titulo={t('bulk_step_discover_how_title')}>
                <ul className="flex list-disc flex-col gap-1 pl-4">
                  <li>{t('bulk_step_discover_how_1')}</li>
                  <li>{t('bulk_step_discover_how_2')}</li>
                  <li>{t('bulk_step_discover_how_3')}</li>
                  <li>{t('bulk_step_discover_how_4')}</li>
                </ul>
              </Aviso>
            )}
          </FormBlock>
        )}

        {currentStep === 'select' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {contagem(t('bulk_stats_total'), stats.total)}
              {contagem(t('bulk_stats_new'), stats.new)}
              {contagem(t('bulk_stats_existing'), stats.existing)}
              {contagem(t('bulk_stats_selected'), stats.selected)}
            </div>
            <ul className="flex flex-col divide-y divide-[var(--linha)]">
              {discoveredWorks.map((work) => (
                <li key={work.id} className="flex items-center gap-3 py-3">
                  {work.alreadyExists ? (
                    <span className="t-legenda w-28 shrink-0">
                      {t('bulk_work_exists')}
                    </span>
                  ) : (
                    <CaixaDeMarcar
                      rotulo={<span className="sr-only">{work.title}</span>}
                      marcado={work.selected}
                      aoMudar={() => toggleWorkSelection(work.id)}
                    />
                  )}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium text-texto">
                      {work.title}
                    </span>
                    <span className="t-legenda truncate">
                      {[work.opOrCatalog, work.instrument]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  <a
                    href={work.imslpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-texto-suave hover:bg-[var(--interactive-hover)] hover:text-texto"
                  >
                    <Icon de={PiArrowSquareOut} tamanho="p" rotulo="IMSLP" />
                  </a>
                  <Button
                    tamanho="p"
                    variante="fantasma"
                    icone={PiTrash}
                    rotulo={t('bulk_remove_work')}
                    onClick={() => removeWork(work.id)}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {currentStep === 'process' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="t-subtitulo">{t('bulk_processing_title')}</h3>
              <p className="t-rotulo text-texto-suave">
                {t('bulk_processing_description', { count: stats.selected })}
              </p>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={workProgress.length}
                aria-valuenow={feitas}
                className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--linha)]"
              >
                <div
                  className="h-full rounded-full bg-[var(--ouro)] transition-[width] duration-300"
                  style={{
                    width: `${workProgress.length ? (feitas / workProgress.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="t-legenda">
                {t('bulk_processing_progress', {
                  completed: feitas,
                  total: workProgress.length,
                })}
              </span>
            </div>
            <ul className="flex flex-col divide-y divide-[var(--linha)]">
              {workProgress.map((work) => (
                <li key={work.tempId} className="flex items-start gap-3 py-3">
                  {iconeDoEstado(work.status)}
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-medium text-texto">
                      {work.title}
                    </span>
                    <span className="t-legenda">{work.message}</span>
                    {work.details?.finalTitle &&
                      work.details.finalTitle !== work.title && (
                        <span className="t-legenda">
                          {t('bulk_processing_final_title', {
                            title: work.details.finalTitle,
                          })}
                        </span>
                      )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {currentStep === 'results' && (
          <div className="flex flex-col gap-6">
            <h3 className="t-subtitulo">{t('bulk_results_title')}</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {contagem(
                t('bulk_results_success'),
                processResults.filter((r) => r.status === 'success').length
              )}
              {contagem(
                t('bulk_results_errors'),
                processResults.filter((r) => r.status === 'error').length
              )}
              {contagem(
                t('bulk_results_duplicates'),
                processResults.filter((r) => r.status === 'duplicate').length
              )}
              {contagem(
                t('bulk_results_skipped'),
                processResults.filter((r) => r.status === 'skipped').length
              )}
            </div>
            <ul className="flex flex-col divide-y divide-[var(--linha)]">
              {processResults.map((result) => (
                <li key={result.tempId} className="flex items-start gap-3 py-3">
                  {iconeDoEstado(result.status)}
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-medium text-texto">
                      {result.title}
                    </span>
                    <span className="t-legenda">
                      {result.message.includes('__TURBOPACK')
                        ? t('bulk_results_error_processing')
                        : result.message}
                    </span>
                    {result.details?.finalTitle &&
                      result.details.finalTitle !== result.title && (
                        <span className="t-legenda text-ouro-texto">
                          {t('bulk_processing_final_title', {
                            title: result.details.finalTitle,
                          })}
                        </span>
                      )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </FormSheet>

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
