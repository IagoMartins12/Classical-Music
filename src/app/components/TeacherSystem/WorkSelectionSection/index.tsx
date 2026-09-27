// app/components/lessons/WorkSelectionSection.tsx - Componente para Seleção de Peças
'use client';
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PiBookOpen,
  PiCheck,
  PiInfo,
  PiMusicNotes,
  PiPlus,
  PiTrash,
  PiUser,
  PiX,
} from 'react-icons/pi';
import { AnimatedCard, AnimatedItem } from '../../animation/AnimatedComponents';
import ComposerSearchInput from '../../ComposerSearchInput';
import ScoreSelectionModal from '../../LearningModal/ScoreSelectionModal';
import SimpleWorkSearchInput from '../../SimpleWorkSearchInput';
import {
  findComposers,
  getWorkById,
  searchWorks,
} from '@/app/requests/catalog-search';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

// 🆕 Interface para dados das peças vinculadas
export interface LessonWork {
  workId: string;
  workTitle: string;
  composerName: string;
  composerId: string;
  scoreId?: string; // ID do WorkScore
  scoreTitle?: string;
  scoreUrl?: string;
  scoreType?: string;
  scoreSource?: 'IMSLP' | 'CUSTOM' | 'UPLOAD';
}

// 🆕 Interface para obras
interface Work {
  id: string;
  title: string;
  composer: {
    id?: string;
    name: string;
    fullName: string;
  };
}

interface WorkSelectionSectionProps {
  selectedWorks: LessonWork[];
  onWorksChange: (works: LessonWork[]) => void;
  maxWorks?: number;
  disabled?: boolean;
}

interface Composer {
  id: string;
  name: string;
  fullName?: string;
  worksCount?: number;
}

export default function WorkSelectionSection({
  selectedWorks,
  onWorksChange,
  maxWorks = 4,
  disabled = false,
}: WorkSelectionSectionProps) {
  // Estados para adicionar nova peça
  const [isAddingWork, setIsAddingWork] = useState(false);
  const [selectedComposer, setSelectedComposer] = useState('');
  const [selectedWorkId, setSelectedWorkId] = useState('');
  const [popularComposers, setPopularComposers] = useState<Composer[]>([]);

  // 🆕 Estados para obras do compositor
  const [composerWorks, setComposerWorks] = useState<Work[]>([]);
  const [loadingComposerWorks, setLoadingComposerWorks] = useState(false);
  const lastComposerRef = useRef<string>('');

  // Estados para modal de partitura
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [currentWorkForScore, setCurrentWorkForScore] = useState<{
    workId: string;
    workTitle: string;
    composerName: string;
    index: number;
  } | null>(null);

  // 🆕 Carregar compositores populares ao inicializar
  useEffect(() => {
    loadPopularComposers();
  }, []);

  const loadPopularComposers = async () => {
    try {
      // Sem termo, a API devolve os compositores mais conhecidos.
      const composers = await findComposers('', 20);
      setPopularComposers(
        composers.map((composer) => ({
          id: composer.id,
          name: composer.name,
          fullName: composer.fullName ?? undefined,
        }))
      );
    } catch (error) {
      console.error('❌ Erro ao carregar compositores:', error);
    }
  };

  // 🆕 FUNÇÃO PARA CARREGAR OBRAS DO COMPOSITOR - IGUAL AO CreateScoreModal
  const loadComposerWorks = useCallback(async (composerId: string) => {
    // Evitar chamadas duplicadas
    if (
      !composerId ||
      composerId.trim() === '' ||
      lastComposerRef.current === composerId
    ) {
      return;
    }

    console.log(
      '🎼 [WORK-SELECTION] Carregando obras do compositor:',
      composerId
    );
    lastComposerRef.current = composerId;

    try {
      setLoadingComposerWorks(true);

      const data = await searchWorks({ composerId, limit: 20 });
      setComposerWorks(data.works);
    } catch (error) {
      console.error(
        '❌ [WORK-SELECTION] Erro ao buscar obras do compositor:',
        error
      );
      setComposerWorks([]);
    } finally {
      setLoadingComposerWorks(false);
    }
  }, []);

  // 🆕 EFFECT PARA CARREGAR OBRAS QUANDO COMPOSITOR MUDA - SEM LOOPS
  useEffect(() => {
    if (selectedComposer && selectedComposer.trim() !== '') {
      // Só carrega se realmente mudou
      if (lastComposerRef.current !== selectedComposer) {
        loadComposerWorks(selectedComposer);
      }
    } else {
      // Limpar obras do compositor se não há filtro
      if (composerWorks.length > 0) {
        setComposerWorks([]);
        lastComposerRef.current = '';
      }
    }
  }, [selectedComposer, loadComposerWorks, composerWorks.length]);

  // 🆕 Adicionar nova peça
  const handleAddWork = useCallback(async () => {
    if (!selectedWorkId || selectedWorks.length >= maxWorks) return;

    console.log('selectedWorkId', selectedWorkId);
    try {
      // Buscar dados completos da obra
      const workData = await getWorkById(selectedWorkId);
      if (!workData) {
        throw new Error('Erro ao buscar dados da obra');
      }

      // Verificar se já não está na lista
      if (selectedWorks.some((w) => w.workId === selectedWorkId)) {
        console.log('⚠️ Obra já está na lista');
        return;
      }

      const newWork: LessonWork = {
        workId: workData.id,
        workTitle: workData.title,
        composerName: workData.composer.fullName || workData.composer.name,
        composerId: workData.composer.id,
      };

      const updatedWorks = [...selectedWorks, newWork];
      onWorksChange(updatedWorks);

      // Resetar form
      setSelectedComposer('');
      setSelectedWorkId('');
      setIsAddingWork(false);

      console.log('✅ Peça adicionada:', newWork);
    } catch (error) {
      console.error('❌ Erro ao adicionar peça:', error);
    }
  }, [selectedWorkId, selectedWorks, maxWorks, onWorksChange]);

  // 🆕 Remover peça
  const handleRemoveWork = useCallback(
    (index: number) => {
      const updatedWorks = selectedWorks.filter((_, i) => i !== index);
      onWorksChange(updatedWorks);
      console.log('🗑️ Peça removida:', selectedWorks[index]);
    },
    [selectedWorks, onWorksChange]
  );

  // 🆕 Abrir modal de seleção de partitura
  const handleSelectScore = useCallback(
    (workIndex: number) => {
      const work = selectedWorks[workIndex];
      setCurrentWorkForScore({
        workId: work.workId,
        workTitle: work.workTitle,
        composerName: work.composerName,
        index: workIndex,
      });
      setShowScoreModal(true);
    },
    [selectedWorks]
  );

  // 🆕 Callback do modal de partitura
  const handleScoreSelected = useCallback(
    (workScore: any) => {
      if (!currentWorkForScore) return;

      const updatedWorks = [...selectedWorks];
      const workIndex = currentWorkForScore.index;

      if (workScore) {
        // Adicionar partitura
        updatedWorks[workIndex] = {
          ...updatedWorks[workIndex],
          scoreId: workScore.id,
          scoreTitle: workScore.title,
          scoreUrl: workScore.downloadUrl,
          scoreType: workScore.type,
          scoreSource: workScore.source,
        };
        console.log('🎼 Partitura selecionada:', workScore.title);
      } else {
        // Remover partitura
        const {
          scoreId,
          scoreTitle,
          scoreUrl,
          scoreType,
          scoreSource,
          ...workWithoutScore
        } = updatedWorks[workIndex];
        updatedWorks[workIndex] = workWithoutScore;
        const _object = {
          scoreId,
          scoreTitle,
          scoreUrl,
          scoreType,
          scoreSource,
        };
        console.log('🗑️ Partitura removida da peça', _object);
      }

      onWorksChange(updatedWorks);
      setShowScoreModal(false);
      setCurrentWorkForScore(null);
    },
    [currentWorkForScore, selectedWorks, onWorksChange]
  );

  // 🆕 Reset do formulário de adição
  const resetAddForm = useCallback(() => {
    setSelectedComposer('');
    setSelectedWorkId('');
    setIsAddingWork(false);
    // 🆕 Limpar também as obras do compositor
    setComposerWorks([]);
    lastComposerRef.current = '';
  }, []);

  const canAddWork = selectedWorks.length < maxWorks;
  const hasComposerSelected =
    selectedComposer && selectedComposer.trim() !== '';
  const hasWorkSelected =
    selectedWorkId && selectedWorkId.trim() !== '' ? true : false;

  return (
    <AnimatedCard className="classical-card p-6 relative z-10">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Inline gap={3}>
            <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
              <PiMusicNotes className="w-5 h-5 text-theme-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-primary classical-title">
                Peças Musicais
              </h3>
              <Text papel="rotulo" tom="suave" as="p">
                Vincule até {maxWorks} peças com suas partituras à aula
              </Text>
            </div>
          </Inline>

          {/* Contador */}
          <div className="text-right">
            <div
              className={`text-lg font-bold ${
                selectedWorks.length >= maxWorks
                  ? 'text-accent-red'
                  : 'text-theme-primary'
              }`}
            >
              {selectedWorks.length}/{maxWorks}
            </div>
            <Text papel="legenda" tom="fraco" as="div">
              {selectedWorks.length === 0
                ? 'Nenhuma peça'
                : selectedWorks.length === 1
                  ? '1 peça vinculada'
                  : `${selectedWorks.length} peças vinculadas`}
            </Text>
          </div>
        </div>

        {/* Lista de peças selecionadas */}
        {selectedWorks.length > 0 && (
          <div className="space-y-3">
            <Inline
              as="h4"
              gap={2}
              className="text-sm font-medium text-theme-primary"
            >
              <PiBookOpen className="w-4 h-4" />
              <span>Peças Vinculadas</span>
            </Inline>

            <div className="space-y-2">
              {selectedWorks.map((work, index) => (
                <AnimatedItem
                  key={work.workId}
                  direction="left"
                  springType="gentle"
                >
                  <div className="bg-theme-elevated border border-theme-secondary rounded-lg p-4">
                    <div className="flex items-center flex-col sm:flex-row gap-4 sm:gap-0 justify-between">
                      <Inline gap={3} className="flex-1 min-w-0 w-full">
                        <div className="w-8 h-8 bg-accent-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <PiMusicNotes className="w-4 h-4 text-accent-blue" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <Inline gap={2}>
                            <h5 className="font-medium text-theme-primary truncate">
                              {work.workTitle}
                            </h5>
                            <Text
                              papel="legenda"
                              tom="suave"
                              className="bg-theme-secondary/20 px-2 py-0.5 rounded"
                            >
                              #{index + 1}
                            </Text>
                          </Inline>
                          <Text
                            papel="rotulo"
                            tom="fraco"
                            as="p"
                            className="truncate"
                          >
                            {work.composerName}
                          </Text>

                          {/* Informações da partitura */}
                          {work.scoreId ? (
                            <Inline gap={2} className="mt-2">
                              <Inline
                                gap={1}
                                className="text-xs text-accent-green"
                              >
                                <PiCheck className="w-3 h-3" />
                                <span>Partitura: {work.scoreTitle}</span>
                              </Inline>
                              <Text papel="legenda" tom="fraco">
                                ({work.scoreSource})
                              </Text>
                            </Inline>
                          ) : (
                            <Text
                              papel="legenda"
                              tom="fraco"
                              as="div"
                              className="mt-2"
                            >
                              Nenhuma partitura selecionada
                            </Text>
                          )}
                        </div>
                      </Inline>

                      <Inline gap={2} className="flex-shrink-0">
                        {/* Botão de selecionar partitura */}
                        <button
                          type="button"
                          onClick={() => handleSelectScore(index)}
                          disabled={disabled}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                            work.scoreId
                              ? 'bg-accent-green/10 border-accent-green/30 text-accent-green hover:bg-accent-green/20'
                              : 'bg-theme-elevated border-theme-secondary text-theme-secondary hover:border-theme-primary hover:text-theme-primary'
                          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {work.scoreId
                            ? 'Trocar Partitura'
                            : 'Selecionar Partitura'}
                        </button>

                        {/* Botão de remover */}
                        <button
                          type="button"
                          onClick={() => handleRemoveWork(index)}
                          disabled={disabled}
                          className={`w-8 h-8 rounded-lg bg-accent-red/10 hover:bg-accent-red/20 transition-colors flex items-center justify-center ${
                            disabled ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <PiTrash className="w-3 h-3 text-accent-red" />
                        </button>
                      </Inline>
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </div>
        )}

        {/* Formulário para adicionar nova peça */}
        {(canAddWork || isAddingWork) && (
          <div className="space-y-4">
            {/* Botão de adicionar ou formulário */}
            {!isAddingWork ? (
              <button
                type="button"
                onClick={() => setIsAddingWork(true)}
                disabled={!canAddWork || disabled}
                className={`w-full p-4 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  canAddWork && !disabled
                    ? 'border-theme-secondary hover:border-brand-primary text-theme-secondary hover:text-brand-primary bg-theme-elevated hover:bg-brand-primary/5'
                    : 'border-theme-tertiary/50 text-theme-tertiary cursor-not-allowed opacity-50'
                }`}
              >
                <PiPlus className="w-4 h-4" />
                <span>
                  {selectedWorks.length === 0
                    ? 'Adicionar primeira peça'
                    : `Adicionar peça (${selectedWorks.length}/${maxWorks})`}
                </span>
              </button>
            ) : (
              <div className="bg-brand-primary/5 border border-color-primary rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Inline
                    as="h4"
                    gap={2}
                    className="text-sm font-medium text-theme-primary"
                  >
                    <PiPlus className="w-4 h-4 text-brand-primary" />
                    <span>Adicionar Nova Peça</span>
                  </Inline>
                  <button
                    type="button"
                    onClick={resetAddForm}
                    className="w-6 h-6 rounded-full bg-theme-elevated border border-theme-secondary hover:border-accent-red transition-colors flex items-center justify-center"
                  >
                    <PiX className="w-3 h-3 text-theme-tertiary hover:text-accent-red" />
                  </button>
                </div>

                {/* Filtro de Compositor */}
                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-2">
                    <Inline gap={2}>
                      <PiUser className="w-4 h-4" />
                      <span>Compositor</span>
                      {hasWorkSelected && (
                        <span className="text-xs text-accent-blue">
                          (Selecionado automaticamente)
                        </span>
                      )}
                    </Inline>
                  </label>

                  <ComposerSearchInput
                    selectedComposer={selectedComposer}
                    onComposerSelect={setSelectedComposer}
                    popularComposers={popularComposers}
                    isDisabled={hasWorkSelected}
                  />

                  {hasWorkSelected && (
                    <Text papel="legenda" tom="fraco" as="p" className="mt-2">
                      💡 O compositor foi selecionado automaticamente baseado na
                      obra escolhida.
                    </Text>
                  )}
                </div>

                {/* Filtro de Obra */}
                <div>
                  <label className="block text-sm font-medium text-theme-tertiary mb-2">
                    <Inline gap={2}>
                      <PiMusicNotes className="w-4 h-4" />
                      <span>Obra *</span>
                      {/* 🆕 Indicador de carregamento das obras do compositor */}
                      {loadingComposerWorks && (
                        <Text papel="legenda" tom="ouro">
                          (Carregando obras...)
                        </Text>
                      )}
                    </Inline>
                  </label>

                  <SimpleWorkSearchInput
                    selectedWork={selectedWorkId}
                    onWorkSelect={setSelectedWorkId}
                    filterByComposer={selectedComposer}
                    placeholder="Digite para buscar uma obra..."
                    // 🆕 Passar as obras do compositor como sugestões
                    userSuggestions={composerWorks}
                    loadingUserSuggestions={loadingComposerWorks}
                  />

                  {/* 🆕 Informação sobre as obras carregadas */}
                  {hasComposerSelected &&
                    composerWorks.length > 0 &&
                    !loadingComposerWorks && (
                      <Text papel="legenda" tom="fraco" as="p" className="mt-2">
                        🎼 {composerWorks.length} obra(s) de{' '}
                        {popularComposers.find((c) => c.id === selectedComposer)
                          ?.name || 'compositor selecionado'}{' '}
                        carregadas automaticamente
                      </Text>
                    )}
                </div>

                {/* Botões de ação */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2">
                  <Text papel="legenda" tom="fraco" as="div">
                    {hasComposerSelected && hasWorkSelected ? (
                      <Inline as="span" gap={1} className="text-accent-green">
                        <PiCheck className="w-3 h-3" />
                        <span>Pronto para adicionar</span>
                      </Inline>
                    ) : !hasComposerSelected && !hasWorkSelected ? (
                      <span>Selecione um compositor e uma obra</span>
                    ) : hasComposerSelected ? (
                      <span>
                        {loadingComposerWorks
                          ? 'Carregando obras do compositor...'
                          : 'Agora selecione uma obra'}
                      </span>
                    ) : (
                      <span>Selecione um compositor primeiro</span>
                    )}
                  </Text>

                  <Inline gap={2}>
                    <button
                      type="button"
                      onClick={resetAddForm}
                      className="btn-classical-secondary text-sm"
                    >
                      Cancelar
                    </button>

                    <Inline
                      as="button"
                      gap={2}
                      type="button"
                      onClick={handleAddWork}
                      disabled={!hasWorkSelected || loadingComposerWorks}
                      className="btn-classical-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PiCheck className="w-3 h-3" />
                      <span>Adicionar Peça</span>
                    </Inline>
                  </Inline>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informação sobre limite */}
        {selectedWorks.length >= maxWorks && (
          <div className="bg-accent-yellow/10 border border-accent-yellow/30 rounded-lg p-3">
            <div className="flex items-start space-x-3">
              <PiInfo className="w-5 h-5 text-accent-yellow mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-accent-yellow mb-1">
                  Limite de peças atingido
                </p>
                <p className="text-theme-secondary">
                  Você pode vincular no máximo {maxWorks} peças por aula. Para
                  adicionar uma nova peça, remova uma das existentes primeiro.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dicas de uso */}
        {selectedWorks.length === 0 && !isAddingWork && (
          <div className="bg-theme-secondary/10 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <PiInfo className="w-5 h-5 text-theme-tertiary mt-0.5 hidden sm:flex" />
              <Text papel="rotulo" tom="suave" as="div">
                <p className="font-medium mb-1">
                  💡 Como funciona o sistema de peças:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Selecione primeiro o compositor, depois a obra</li>
                  <li>As obras do compositor são carregadas automaticamente</li>
                  <li>Cada peça pode ter uma partitura opcional vinculada</li>
                  <li>As partituras vêm do seu acervo no Opus Atlas</li>
                  <li>Você pode adicionar até {maxWorks} peças por aula</li>
                  <li>
                    As peças vinculadas aparecerão nos relatórios de progresso
                  </li>
                </ul>
              </Text>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Seleção de Partitura */}
      {showScoreModal && currentWorkForScore && (
        <ScoreSelectionModal
          isOpen={showScoreModal}
          onClose={() => {
            setShowScoreModal(false);
            setCurrentWorkForScore(null);
          }}
          workId={currentWorkForScore.workId}
          workTitle={currentWorkForScore.workTitle}
          composerName={currentWorkForScore.composerName}
          currentSelectedScore={
            selectedWorks[currentWorkForScore.index].scoreId
              ? {
                  id: selectedWorks[currentWorkForScore.index].scoreId!,
                  sourceId: selectedWorks[currentWorkForScore.index].scoreId!,
                  source: selectedWorks[currentWorkForScore.index]
                    .scoreSource! as 'IMSLP' | 'CUSTOM' | 'UPLOAD',
                  title: selectedWorks[currentWorkForScore.index].scoreTitle!,
                  downloadUrl:
                    selectedWorks[currentWorkForScore.index].scoreUrl,
                  fileFormat: 'PDF',
                  type:
                    selectedWorks[currentWorkForScore.index].scoreType ||
                    'SCORES',
                }
              : null
          }
          onScoreSelected={handleScoreSelected}
          isEditing={!!selectedWorks[currentWorkForScore.index].scoreId}
        />
      )}
    </AnimatedCard>
  );
}
