'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiSearch,
  FiPlay,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiExternalLink,
  FiLoader,
  FiTrash2,
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiMusic,
  FiShoppingCart,
  FiChevronDown,
  FiChevronUp,
  FiEye,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Modal from '@/app/components/Modal';
import { useToast } from '@/app/hooks/useToast';
import { useProcessChanges } from '@/app/hooks/useFormChanges';
import Checkbox from '@/app/components/Common/Checkbox';
import Image from 'next/image';
import { ScraperApiClient } from '@/app/services/scraper-api/scraper-api.client';
import {
  ScrapedEvent,
  ScraperJob,
} from '@/app/services/scraper-api/scraper-api.types';
import { useScrapers } from '@/app/hooks/useScrapers';

interface EventWithSelection extends ScrapedEvent {
  id: string;
  selected: boolean;
}

interface ProcessResult {
  eventId: string;
  tempId: string;
  title: string;
  status: 'success' | 'error' | 'duplicate' | 'skipped';
  message: string;
  createdEventId?: string;
}

interface EventProgress {
  tempId: string;
  title: string;
  status: 'waiting' | 'processing' | 'success' | 'error';
  message?: string;
}

type Step = 'select-scraper' | 'scraping' | 'select' | 'process' | 'results';

interface EventScraperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  autoStart?: boolean;
  defaultScraperId?: string;
}

export default function EventScraperModal({
  isOpen,
  onClose,
  onSuccess,
  // autoStart = false,
  defaultScraperId,
}: EventScraperModalProps) {
  const router = useRouter();
  const toast = useToast();

  // Estados principais
  const [currentStep, setCurrentStep] = useState<Step>('select-scraper');
  const [selectedScraperId, setSelectedScraperId] = useState<string>(
    defaultScraperId || ''
  );
  const [scrapedEvents, setScrapedEvents] = useState<EventWithSelection[]>([]);
  const [processResults, setProcessResults] = useState<ProcessResult[]>([]);
  const [eventProgress, setEventProgress] = useState<EventProgress[]>([]);

  // ✅ NOVO: Estados do Job
  const [currentJob, setCurrentJob] = useState<ScraperJob | null>(null);
  const [jobProgress, setJobProgress] = useState({
    percentage: 0,
    message: 'Iniciando...',
  });

  // Estado para mostrar/ocultar duplicados
  const [showDuplicates, setShowDuplicates] = useState(false);

  // Estados de loading
  const [isScraping, setIsScraping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcess = useProcessChanges(isScraping || isProcessing);

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    existing: 0,
    selected: 0,
  });

  const { scrapers, isLoading: isLoadingScrapers } = useScrapers();

  // Filtrar eventos
  const newEvents = scrapedEvents.filter((e) => !e.isDuplicate);
  const duplicateEvents = scrapedEvents.filter((e) => e.isDuplicate);

  // ==================== FUNÇÕES ====================

  // 1. Executar scraper (ASSÍNCRONO COM PROGRESSO)
  const handleRunScraper = async (scraperId?: string) => {
    const targetScraperId = scraperId || selectedScraperId;

    if (!targetScraperId) {
      toast.error('Erro', 'Selecione um scraper para continuar');
      return;
    }

    setSelectedScraperId(targetScraperId);
    setIsScraping(true);
    setCurrentStep('scraping');
    setJobProgress({ percentage: 0, message: 'Iniciando scraper...' });

    try {
      const scraper = scrapers.find((s) => s.id === targetScraperId);
      toast.info('Iniciando scraper', `Executando ${scraper?.name}...`);

      // ✅ Usar novo endpoint unificado
      const jobId = await ScraperApiClient.scrapeAsync(targetScraperId);

      // Aguardar conclusão com callback de progresso
      const response = await ScraperApiClient.waitForCompletion(
        jobId,
        (job: ScraperJob) => {
          setCurrentJob(job);
          setJobProgress({
            percentage: job.progress.percentage,
            message: job.progress.message,
          });
        }
      );

      if (
        !response.success ||
        !response.events ||
        response.events.length === 0
      ) {
        toast.warning('Aviso', 'Nenhum evento encontrado');
        setCurrentStep('select-scraper');
        return;
      }

      // Processar eventos
      const eventsWithSelection: EventWithSelection[] = response.events.map(
        (event: any, index: number) => ({
          ...event,
          id: event.externalId || `temp-${Date.now()}-${index}`,
          selected: !event.isDuplicate,
        })
      );

      setScrapedEvents(eventsWithSelection);
      updateStats(eventsWithSelection);
      setCurrentStep('select');

      toast.success(
        'Sucesso',
        `${response.events.length} eventos encontrados. ${response.duplicates} já existem no sistema.`
      );
    } catch (error: any) {
      console.error('Erro ao executar scraper:', error);
      toast.error('Erro', error.message || 'Erro ao buscar eventos');
      setCurrentStep('select-scraper');
    } finally {
      setIsScraping(false);
      setCurrentJob(null);
    }
  };
  // 2. Atualizar estatísticas
  const updateStats = (events: EventWithSelection[]) => {
    const newStats = {
      total: events.length,
      new: events.filter((e) => !e.isDuplicate).length,
      existing: events.filter((e) => e.isDuplicate).length,
      selected: events.filter((e) => e.selected).length,
    };
    setStats(newStats);
  };

  // 3. Toggle seleção de evento
  const toggleEventSelection = (eventId: string) => {
    const updated = scrapedEvents.map((event) =>
      event.id === eventId ? { ...event, selected: !event.selected } : event
    );
    setScrapedEvents(updated);
    updateStats(updated);
  };

  // 4. Selecionar/deselecionar todos
  const toggleSelectAll = (selectAll: boolean) => {
    const updated = scrapedEvents.map((event) => ({
      ...event,
      selected: selectAll && !event.isDuplicate,
    }));
    setScrapedEvents(updated);
    updateStats(updated);
  };

  // 5. Remover evento da lista
  const removeEvent = (eventId: string) => {
    const updated = scrapedEvents.filter((event) => event.id !== eventId);
    setScrapedEvents(updated);
    updateStats(updated);
  };

  // 6. Processar eventos selecionados
  const handleProcessEvents = async () => {
    const selectedEvents = scrapedEvents.filter(
      (e) => e.selected && !e.isDuplicate
    );

    if (selectedEvents.length === 0) {
      toast.error('Erro', 'Nenhum evento selecionado para importar');
      return;
    }

    setCurrentStep('process');
    setIsProcessing(true);
    setProcessResults([]);

    const initialProgress: EventProgress[] = selectedEvents.map((event) => ({
      tempId: event.id,
      title: event.title,
      status: 'waiting',
      message: 'Aguardando processamento...',
    }));
    setEventProgress(initialProgress);

    try {
      const results: ProcessResult[] = [];

      for (let i = 0; i < selectedEvents.length; i++) {
        const event = selectedEvents[i];

        setEventProgress((prev) =>
          prev.map((p) =>
            p.tempId === event.id
              ? { ...p, status: 'processing', message: 'Inserindo no banco...' }
              : p
          )
        );

        try {
          const result = await ScraperApiClient.importEvents(
            selectedScraperId,
            [event]
          );

          if (result.success && result.imported > 0) {
            const successResult: ProcessResult = {
              eventId: event.externalId,
              tempId: event.id,
              title: event.title,
              status: 'success',
              message: 'Evento criado com sucesso',
              createdEventId: result.details?.[0]?.eventId,
            };
            results.push(successResult);

            setEventProgress((prev) =>
              prev.map((p) =>
                p.tempId === event.id
                  ? { ...p, status: 'success', message: 'Evento criado!' }
                  : p
              )
            );
          } else {
            const errorMsg =
              result.details?.[0]?.message || 'Erro ao criar evento';
            const errorResult: ProcessResult = {
              eventId: event.externalId,
              tempId: event.id,
              title: event.title,
              status: 'error',
              message: errorMsg,
            };
            results.push(errorResult);

            setEventProgress((prev) =>
              prev.map((p) =>
                p.tempId === event.id
                  ? { ...p, status: 'error', message: errorMsg }
                  : p
              )
            );
          }
        } catch (error: any) {
          const errorMsg = error.message || 'Erro de conexão';
          const errorResult: ProcessResult = {
            eventId: event.externalId,
            tempId: event.id,
            title: event.title,
            status: 'error',
            message: errorMsg,
          };
          results.push(errorResult);

          setEventProgress((prev) =>
            prev.map((p) =>
              p.tempId === event.id
                ? { ...p, status: 'error', message: errorMsg }
                : p
            )
          );
        }

        if (i < selectedEvents.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      setProcessResults(results);
      setCurrentStep('results');

      router.refresh();

      const successCount = results.filter((r) => r.status === 'success').length;
      toast.success(
        'Importação Concluída',
        `${successCount}/${results.length} eventos importados com sucesso`
      );

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Erro no processamento:', error);
      toast.error('Erro', error.message || 'Erro ao processar eventos');
    } finally {
      setIsProcessing(false);
    }
  };

  // 7. Fechar modal e resetar
  const handleClose = () => {
    setCurrentStep('select-scraper');
    setSelectedScraperId(defaultScraperId || '');
    setScrapedEvents([]);
    setProcessResults([]);
    setEventProgress([]);
    setStats({ total: 0, new: 0, existing: 0, selected: 0 });
    setShowDuplicates(false);
    setCurrentJob(null);
    setJobProgress({ percentage: 0, message: 'Iniciando...' });
    onClose();
  };

  if (!isOpen) return null;

  if (isLoadingScrapers && scrapers.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-6 text-center">
          <FiLoader className="w-8 h-8 text-brand-primary animate-spin mx-auto mb-4" />
          <p className="text-theme-secondary">Carregando scrapers...</p>
        </div>
      </Modal>
    );
  }
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="5xl"
      showCloseButton={true}
      confirmOnClose={true}
      isProcessing={hasProcess}
      processName={
        isScraping
          ? 'Buscando eventos'
          : currentStep === 'process'
            ? 'Processamento de eventos'
            : currentStep === 'results'
              ? 'Resultados'
              : currentStep === 'select'
                ? 'Seleção de eventos'
                : 'Busca de eventos'
      }
    >
      <AnimatedItem direction="scale" springType="bouncy" className="w-full">
        <div className="overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-green rounded-xl flex items-center justify-center">
                <FiSearch className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary classical-title">
                  Buscar e Importar Eventos
                </h2>
                <p className="text-theme-secondary text-sm">
                  Scrapers de concertos e eventos
                </p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center space-x-2">
              {(
                [
                  'select-scraper',
                  'scraping',
                  'select',
                  'process',
                  'results',
                ] as Step[]
              ).map((step, index) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentStep === step
                      ? 'bg-brand-primary'
                      : index <
                          (
                            [
                              'select-scraper',
                              'scraping',
                              'select',
                              'process',
                              'results',
                            ] as Step[]
                          ).indexOf(currentStep)
                        ? 'bg-green-400'
                        : 'bg-theme-secondary'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {/* STEP 1: SELECT SCRAPER */}
            {currentStep === 'select-scraper' && (
              <div className="p-6">
                <h3 className="text-lg font-bold text-theme-primary mb-4">
                  Selecione a Fonte dos Eventos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scrapers.map((scraper) => (
                    <AnimatedCard
                      key={scraper.id}
                      className={`classical-card-simple p-6 cursor-pointer transition-all ${
                        selectedScraperId === scraper.id
                          ? 'border-brand-primary shadow-theme-glow'
                          : 'hover:border-brand-primary/50'
                      }`}
                      onClick={() => setSelectedScraperId(scraper.id)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl">{scraper.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-theme-primary mb-1">
                            {scraper.name}
                          </h4>
                          <p className="text-sm text-theme-secondary mb-2">
                            {scraper.description}
                          </p>
                          <div className="flex items-center text-xs text-theme-tertiary">
                            <FiMapPin className="w-3 h-3 mr-1" />
                            {scraper.venue}
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedScraperId === scraper.id
                              ? 'border-brand-primary bg-brand-primary'
                              : 'border-theme-tertiary'
                          }`}
                        >
                          {selectedScraperId === scraper.id && (
                            <FiCheck className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<FiPlay />}
                    onClick={() => handleRunScraper()}
                    disabled={!selectedScraperId || isScraping}
                  >
                    Executar Scraper
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: SCRAPING COM PROGRESSO */}
            {currentStep === 'scraping' && (
              <div className="p-6 text-center">
                <AnimatedCard className="classical-card-2 p-8 max-w-md mx-auto">
                  <FiLoader className="w-16 h-16 text-brand-primary animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-theme-primary mb-2">
                    Buscando Eventos...
                  </h3>
                  <p className="text-theme-secondary mb-4">
                    {jobProgress.message}
                  </p>

                  {/* ✅ BARRA DE PROGRESSO */}
                  <div className="w-full bg-theme-secondary rounded-full h-3 mb-2 overflow-hidden">
                    <div
                      className="h-full progress-bar transition-all duration-300 rounded-full"
                      style={{ width: `${jobProgress.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-theme-tertiary">
                    {jobProgress.percentage}% completo
                  </div>

                  {/* ✅ INFO DO JOB */}
                  {currentJob && (
                    <div className="mt-4 text-left text-xs text-theme-tertiary space-y-1">
                      <div>
                        Status:{' '}
                        <span className="text-brand-primary font-medium">
                          {currentJob.status}
                        </span>
                      </div>
                      <div>
                        Progresso: {currentJob.progress.current}/
                        {currentJob.progress.total}
                      </div>
                    </div>
                  )}
                </AnimatedCard>
              </div>
            )}

            {/* STEP 3: SELECT EVENTS (mesmo código anterior) */}
            {currentStep === 'select' && (
              <div className="p-6">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="classical-card-simple p-4 text-center">
                    <div className="text-2xl font-bold text-theme-primary">
                      {stats.total}
                    </div>
                    <div className="text-xs text-theme-secondary">Total</div>
                  </div>
                  <div className="classical-card-simple p-4 text-center bg-green-50/5">
                    <div className="text-2xl font-bold text-green-500">
                      {stats.new}
                    </div>
                    <div className="text-xs text-theme-secondary">Novos</div>
                  </div>
                  <div className="classical-card-simple p-4 text-center bg-yellow-50/5">
                    <div className="text-2xl font-bold text-yellow-500">
                      {stats.existing}
                    </div>
                    <div className="text-xs text-theme-secondary">
                      Já existem
                    </div>
                  </div>
                  <div className="classical-card-simple p-4 text-center bg-blue-50/5">
                    <div className="text-2xl font-bold text-blue-500">
                      {stats.selected}
                    </div>
                    <div className="text-xs text-theme-secondary">
                      Selecionados
                    </div>
                  </div>
                </div>

                {/* Select All */}
                <div className="flex items-center justify-between mb-4 classical-card-simple p-4">
                  <Checkbox
                    label="Selecionar todos os eventos novos"
                    checked={stats.selected === stats.new && stats.new > 0}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                  <Button
                    variant="primary"
                    onClick={handleProcessEvents}
                    disabled={stats.selected === 0}
                  >
                    Importar {stats.selected} eventos
                  </Button>
                </div>

                {/* Eventos Novos */}
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-theme-primary mb-3">
                    Eventos Novos ({newEvents.length})
                  </h4>
                  <div className=" overflow-y-auto space-y-3">
                    {newEvents.map((event) => (
                      <AnimatedItem
                        key={event.id}
                        direction="left"
                        springType="smooth"
                      >
                        <EventCard
                          event={event}
                          removeEvent={removeEvent}
                          toggleEventSelection={toggleEventSelection}
                        />
                      </AnimatedItem>
                    ))}
                  </div>
                </div>

                {/* Seção de Duplicados */}
                {duplicateEvents.length > 0 && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowDuplicates(!showDuplicates)}
                      className="w-full classical-card-simple p-4 flex items-center justify-between hover:border-yellow-500/30 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <FiEye className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-theme-primary">
                          Ver eventos duplicados ({duplicateEvents.length})
                        </span>
                      </div>
                      {showDuplicates ? (
                        <FiChevronUp className="w-5 h-5 text-theme-tertiary" />
                      ) : (
                        <FiChevronDown className="w-5 h-5 text-theme-tertiary" />
                      )}
                    </button>

                    {showDuplicates && (
                      <AnimatedItem direction="down" springType="smooth">
                        <div className="mt-3  overflow-y-auto space-y-3 border-l-4 border-yellow-500/30 pl-4">
                          {duplicateEvents.map((event) => (
                            <AnimatedItem
                              key={event.id}
                              direction="left"
                              springType="smooth"
                            >
                              <EventCard
                                event={event}
                                isDuplicate
                                removeEvent={removeEvent}
                                toggleEventSelection={toggleEventSelection}
                              />
                            </AnimatedItem>
                          ))}
                        </div>
                      </AnimatedItem>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: PROCESSING */}
            {/* STEP 4: PROCESSING */}
            {currentStep === 'process' && (
              <div className="p-6">
                <div className="mb-6 text-center">
                  <h3 className="text-lg font-bold text-theme-primary mb-2">
                    Importando Eventos
                  </h3>
                  <p className="text-theme-secondary mb-4">
                    Processando {stats.selected} evento(s)...
                  </p>

                  <div className="w-full bg-theme-secondary rounded-full h-2 mb-2">
                    <div
                      className="progress-bar h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (eventProgress.filter(
                            (e) =>
                              e.status === 'success' || e.status === 'error'
                          ).length /
                            eventProgress.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-theme-tertiary">
                    {
                      eventProgress.filter(
                        (e) => e.status === 'success' || e.status === 'error'
                      ).length
                    }{' '}
                    / {eventProgress.length} concluídos
                  </div>
                </div>

                <div className=" overflow-y-auto space-y-3">
                  {eventProgress.map((event) => (
                    <div
                      key={event.tempId}
                      className={`classical-card-simple rounded-lg p-4 transition-all ${
                        event.status === 'success'
                          ? 'bg-accent-green/5 border-accent-green/20'
                          : event.status === 'error'
                            ? 'bg-accent-red/5 border-accent-red/20'
                            : event.status === 'processing'
                              ? 'bg-brand-primary/5 border-brand-primary/30'
                              : 'bg-theme-elevated border-theme-secondary'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {event.status === 'waiting' && (
                            <div className="w-5 h-5 rounded-full bg-theme-secondary flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-theme-tertiary"></div>
                            </div>
                          )}
                          {event.status === 'processing' && (
                            <FiLoader className="w-5 h-5 text-brand-primary animate-spin" />
                          )}
                          {event.status === 'success' && (
                            <div className="w-5 h-5 rounded-full bg-accent-green flex items-center justify-center">
                              <FiCheck className="w-3 h-3 text-white" />
                            </div>
                          )}
                          {event.status === 'error' && (
                            <div className="w-5 h-5 rounded-full bg-accent-red flex items-center justify-center">
                              <FiX className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-theme-primary truncate">
                            {event.title}
                          </h4>
                          <p
                            className={`text-xs ${
                              event.status === 'success'
                                ? 'text-accent-green'
                                : event.status === 'error'
                                  ? 'text-accent-red'
                                  : event.status === 'processing'
                                    ? 'text-brand-primary'
                                    : 'text-theme-tertiary'
                            }`}
                          >
                            {event.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: RESULTS */}
            {currentStep === 'results' && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-theme-primary mb-2">
                    Importação Concluída!
                  </h3>
                  <p className="text-theme-secondary">
                    {
                      processResults.filter((r) => r.status === 'success')
                        .length
                    }{' '}
                    evento(s) importado(s) com sucesso
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="classical-card-simple p-4 text-center bg-green-500/5">
                    <div className="text-2xl font-bold text-green-500">
                      {
                        processResults.filter((r) => r.status === 'success')
                          .length
                      }
                    </div>
                    <div className="text-xs text-theme-secondary">Sucesso</div>
                  </div>
                  <div className="classical-card-simple p-4 text-center bg-red-500/5">
                    <div className="text-2xl font-bold text-red-500">
                      {
                        processResults.filter((r) => r.status === 'error')
                          .length
                      }
                    </div>
                    <div className="text-xs text-theme-secondary">Erro</div>
                  </div>
                  <div className="classical-card-simple p-4 text-center bg-yellow-500/5">
                    <div className="text-2xl font-bold text-yellow-500">
                      {
                        processResults.filter(
                          (r) =>
                            r.status === 'duplicate' || r.status === 'skipped'
                        ).length
                      }
                    </div>
                    <div className="text-xs text-theme-secondary">
                      Ignorados
                    </div>
                  </div>
                </div>

                <div className="overflow-x-hidden overflow-y-auto space-y-2">
                  {processResults.map((result) => (
                    <div
                      key={result.tempId}
                      className={`classical-card-simple p-3 rounded ${
                        result.status === 'success'
                          ? 'bg-green-500/5'
                          : result.status === 'error'
                            ? 'bg-red-500/5'
                            : 'bg-yellow-500/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {result.status === 'success' && (
                            <FiCheck className="w-4 h-4 text-green-500" />
                          )}
                          {result.status === 'error' && (
                            <FiX className="w-4 h-4 text-red-500" />
                          )}
                          {(result.status === 'duplicate' ||
                            result.status === 'skipped') && (
                            <FiAlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className="text-sm text-theme-primary">
                            {result.title}
                          </span>
                        </div>
                        <span
                          className={`text-xs ${
                            result.status === 'success'
                              ? 'text-green-500'
                              : result.status === 'error'
                                ? 'text-red-500'
                                : 'text-yellow-500'
                          }`}
                        >
                          {result.message}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="primary" onClick={handleClose}>
                    Concluir
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </AnimatedItem>
    </Modal>
  );
}

// Componente de card de evento
const EventCard = ({
  event,
  isDuplicate = false,
  removeEvent,
  toggleEventSelection,
}: {
  event: EventWithSelection;
  isDuplicate?: boolean;
  removeEvent: (event: any) => void;
  toggleEventSelection: (id: string) => void;
}) => (
  <div
    className={`classical-card-simple rounded-lg p-4 ${
      isDuplicate
        ? 'opacity-60 bg-yellow-500/5 border-yellow-500/20'
        : event.selected
          ? 'border-brand-primary shadow-theme-glow'
          : ''
    }`}
  >
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 pt-1">
        {isDuplicate ? (
          <div className="w-5 h-5 rounded bg-yellow-500/20 flex items-center justify-center">
            <FiAlertCircle className="w-3 h-3 text-yellow-500" />
          </div>
        ) : (
          <Checkbox
            checked={event.selected}
            onChange={() => toggleEventSelection(event.id)}
          />
        )}
      </div>

      {event.imageUrl && (
        <div className="flex-shrink-0">
          <Image
            src={event.imageUrl}
            alt={event.title}
            className="w-16 h-16 object-cover rounded"
            width={64}
            height={64}
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-bold text-theme-primary">{event.title}</h4>
          {isDuplicate && (
            <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded ml-2 flex-shrink-0">
              Já existe
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-theme-secondary mb-2">
          <div className="flex items-center">
            <FiCalendar className="w-3 h-3 mr-1" />
            {new Date(event.startDate).toLocaleDateString('pt-BR')}
            {event.startTime && ` às ${event.startTime}`}
          </div>
          <div className="flex items-center">
            <FiMusic className="w-3 h-3 mr-1" />
            {event.type}
          </div>
          {event.venueDetails && (
            <div className="flex items-center">
              <FiMapPin className="w-3 h-3 mr-1" />
              {event.venueDetails}
            </div>
          )}
          {event.ticketInfo && (
            <div className="flex items-center">
              <FiDollarSign className="w-3 h-3 mr-1" />
              {event.ticketInfo}
            </div>
          )}
        </div>

        {event.composerNames.length > 0 && (
          <div className="text-xs text-theme-tertiary">
            🎼 {event.composerNames.join(', ')}
          </div>
        )}

        <p className="text-xs text-theme-tertiary mt-2 line-clamp-2">
          {event.description}
        </p>
      </div>

      <div className="flex-shrink-0 flex items-center space-x-2">
        <a
          href={event.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-theme-tertiary hover:text-accent-blue"
          title="Ver evento"
        >
          <FiExternalLink className="w-4 h-4" />
        </a>

        {event.ticketUrl !== event.externalUrl && (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-theme-tertiary hover:text-accent-green"
            title="Comprar ingresso"
          >
            <FiShoppingCart className="w-4 h-4" />
          </a>
        )}

        {!isDuplicate && (
          <button
            onClick={() => removeEvent(event.id)}
            className="text-theme-tertiary hover:text-accent-red"
            title="Remover"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  </div>
);
