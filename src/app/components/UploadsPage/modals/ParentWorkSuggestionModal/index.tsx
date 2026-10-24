// app/components/modals/ParentWorkSuggestionModal.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  PiBookOpen,
  PiCalendarBlank,
  PiCheck,
  PiClock,
  PiGlobe,
  PiInfo,
  PiMusicNotes,
  PiSpeakerHigh,
  PiStar,
  PiTag,
  PiUser,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/app/components/ui/Button';
import { CaixaDeMarcar } from '@/app/components/ui/CaixaDeMarcar';
import { cx } from '@/app/components/ui/cx';
import { FormBlock, FormSheet } from '@/app/components/site/edit/FormSheet';
import { useTx } from '@/app/hooks/useTx';

interface ParentWorkData {
  id: string;
  title: string;
  subtitle?: string;
  opOrCatalog?: string;
  compositionYear?: string;
  firstPublishDate?: string;
  tone?: string;
  mediaDuration?: string;
  workStyle?: string;
  moviment?: string;
  categoryNames?: string[];
  workGenresArr?: string[];
  dedicateTo?: string;
  instrumentation?: string;
  workType?: string;
  difficultyLevel?: string;
  imslpTags?: string[];
  composer?: {
    id: string;
    name: string;
    fullName: string;
  };
  epoch?: {
    id: string;
    name: string;
  };
  instrument?: {
    id: string;
    name: string;
  };
  epochId?: string;
  instrumentId?: string;
}

interface CurrentFormData {
  opOrCatalog: string;
  compositionYear: string;
  firstPublishDate: string;
  tone: string;
  mediaDuration: string;
  workStyle: string;
  moviment: string;
  categoryNames: string[];
  workGenresArr: string[];
  dedicateTo: string;
  instrumentation: string;
  workType: string;
  difficultyLevel: string;
  imslpTags: string;
  epochId: string;
  instrumentId: string;
}

interface ParentWorkSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentWorkData: ParentWorkData | null;
  currentFormData: CurrentFormData;
  onApplyData: (selectedData: Partial<CurrentFormData>) => void;
}

interface FieldSuggestion {
  key: keyof CurrentFormData;
  label: string;
  icon: React.ComponentType<any>;
  parentValue: any;
  currentValue: any;
  isArray?: boolean;
  displayValue?: string;
  canCopy: boolean;
  category: 'catalog' | 'musical' | 'metadata' | 'classification';
}

/** The first question: whether to look at what the parent work offers. */
const ParentWorkConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  parentWorkTitle: string;
}> = ({ isOpen, onClose, onConfirm, parentWorkTitle }) => {
  const tx = useTx();
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      type="question"
      title={tx(
        'Aproveitar dados da obra da coleção?',
        'Use details from the collection work?'
      )}
      message={tx(
        `“${parentWorkTitle}” tem dados que podem preencher campos vazios desta peça. O que você já digitou não muda.`,
        `“${parentWorkTitle}” has details that can fill this piece’s empty fields. What you typed stays.`
      )}
      confirmText={tx('Ver opções', 'See options')}
      cancelText={tx('Não, obrigado', 'No, thanks')}
    />
  );
};

const ParentWorkSuggestionModal: React.FC<ParentWorkSuggestionModalProps> = ({
  isOpen,
  onClose,
  parentWorkData,
  currentFormData,
  onApplyData,
}) => {
  const tx = useTx();
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [isApplying, setIsApplying] = useState(false);

  // 🆕 ESTADO PARA MODAL DE CONFIRMAÇÃO
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showMainModal, setShowMainModal] = useState(false);

  // Preparar sugestões de campos
  const fieldSuggestions = useMemo((): FieldSuggestion[] => {
    if (!parentWorkData) return [];

    const suggestions: FieldSuggestion[] = [
      // Catálogo
      {
        key: 'opOrCatalog',
        label: tx('Op./Catálogo', 'Op./Catalog'),
        icon: PiBookOpen,
        parentValue: parentWorkData.opOrCatalog,
        currentValue: currentFormData.opOrCatalog,
        canCopy:
          !!parentWorkData.opOrCatalog && !currentFormData.opOrCatalog.trim(),
        category: 'catalog',
      },
      {
        key: 'compositionYear',
        label: tx('Ano de Composição', 'Year of composition'),
        icon: PiCalendarBlank,
        parentValue: parentWorkData.compositionYear,
        currentValue: currentFormData.compositionYear,
        canCopy:
          !!parentWorkData.compositionYear &&
          !currentFormData.compositionYear.trim(),
        category: 'catalog',
      },
      {
        key: 'firstPublishDate',
        label: tx('Primeira Publicação', 'First publication'),
        icon: PiCalendarBlank,
        parentValue: parentWorkData.firstPublishDate,
        currentValue: currentFormData.firstPublishDate,
        canCopy:
          !!parentWorkData.firstPublishDate &&
          !currentFormData.firstPublishDate.trim(),
        category: 'catalog',
      },
      {
        key: 'tone',
        label: tx('Tonalidade', 'Key'),
        icon: PiMusicNotes,
        parentValue: parentWorkData.tone,
        currentValue: currentFormData.tone,
        canCopy: !!parentWorkData.tone && !currentFormData.tone.trim(),
        category: 'musical',
      },
      {
        key: 'mediaDuration',
        label: tx('Duração', 'Duration'),
        icon: PiClock,
        parentValue: parentWorkData.mediaDuration,
        currentValue: currentFormData.mediaDuration,
        canCopy:
          !!parentWorkData.mediaDuration &&
          !currentFormData.mediaDuration.trim(),
        category: 'musical',
      },

      // Musical
      {
        key: 'workStyle',
        label: tx('Estilo Musical', 'Musical style'),
        icon: PiSpeakerHigh,
        parentValue: parentWorkData.workStyle,
        currentValue: currentFormData.workStyle,
        canCopy:
          !!parentWorkData.workStyle && !currentFormData.workStyle.trim(),
        category: 'musical',
      },
      {
        key: 'moviment',
        label: tx('Movimento', 'Movement'),
        icon: PiMusicNotes,
        parentValue: parentWorkData.moviment,
        currentValue: currentFormData.moviment,
        canCopy: !!parentWorkData.moviment && !currentFormData.moviment.trim(),
        category: 'musical',
      },
      {
        key: 'instrumentation',
        label: tx('Instrumentação', 'Instrumentation'),
        icon: PiUser,
        parentValue: parentWorkData.instrumentation,
        currentValue: currentFormData.instrumentation,
        canCopy:
          !!parentWorkData.instrumentation &&
          !currentFormData.instrumentation.trim(),
        category: 'musical',
      },
      {
        key: 'dedicateTo',
        label: tx('Dedicado a', 'Dedicated to'),
        icon: PiStar,
        parentValue: parentWorkData.dedicateTo,
        currentValue: currentFormData.dedicateTo,
        canCopy:
          !!parentWorkData.dedicateTo && !currentFormData.dedicateTo.trim(),
        category: 'metadata',
      },

      // Arrays
      {
        key: 'categoryNames',
        label: tx('Categorias', 'Categories'),
        icon: PiTag,
        parentValue: parentWorkData.categoryNames,
        currentValue: currentFormData.categoryNames,
        isArray: true,
        displayValue: parentWorkData.categoryNames?.join(', '),
        canCopy:
          !!parentWorkData.categoryNames?.length &&
          !currentFormData.categoryNames.length,
        category: 'classification',
      },
      {
        key: 'workGenresArr',
        label: tx('Gêneros', 'Genres'),
        icon: PiTag,
        parentValue: parentWorkData.workGenresArr,
        currentValue: currentFormData.workGenresArr,
        isArray: true,
        displayValue: parentWorkData.workGenresArr?.join(', '),
        canCopy:
          !!parentWorkData.workGenresArr?.length &&
          !currentFormData.workGenresArr.length,
        category: 'classification',
      },

      // Special fields
      {
        key: 'workType',
        label: tx('Tipo de Obra', 'Work type'),
        icon: PiGlobe,
        parentValue: parentWorkData.workType,
        currentValue: currentFormData.workType,
        canCopy:
          !!parentWorkData.workType &&
          currentFormData.workType === 'INDIVIDUAL',
        category: 'classification',
      },
      {
        key: 'difficultyLevel',
        label: tx('Nível de Dificuldade', 'Difficulty level'),
        icon: PiStar,
        parentValue: parentWorkData.difficultyLevel,
        currentValue: currentFormData.difficultyLevel,
        canCopy:
          !!parentWorkData.difficultyLevel &&
          !currentFormData.difficultyLevel.trim(),
        category: 'classification',
      },

      // IMSLP Tags
      {
        key: 'imslpTags',
        label: tx('Tags IMSLP', 'IMSLP tags'),
        icon: PiTag,
        parentValue: parentWorkData.imslpTags,
        currentValue: currentFormData.imslpTags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        isArray: true,
        displayValue: parentWorkData.imslpTags?.join(', '),
        canCopy:
          !!parentWorkData.imslpTags?.length &&
          !currentFormData.imslpTags.trim(),
        category: 'metadata',
      },

      // IDs (special handling)
      {
        key: 'epochId',
        label: tx('Época', 'Era'),
        icon: PiCalendarBlank,
        parentValue: parentWorkData.epoch?.name,
        currentValue: currentFormData.epochId,
        displayValue: parentWorkData.epoch?.name,
        canCopy: !!parentWorkData.epochId && !currentFormData.epochId.trim(),
        category: 'classification',
      },
      {
        key: 'instrumentId',
        label: tx('Instrumento', 'Instrument'),
        icon: PiMusicNotes,
        parentValue: parentWorkData.instrument?.name,
        currentValue: currentFormData.instrumentId,
        displayValue: parentWorkData.instrument?.name,
        canCopy:
          !!parentWorkData.instrumentId && !currentFormData.instrumentId.trim(),
        category: 'classification',
      },
    ];

    return suggestions.filter((s) => s.canCopy);
  }, [parentWorkData, currentFormData]);

  // Agrupar por categoria
  const groupedSuggestions = useMemo(() => {
    return fieldSuggestions.reduce(
      (acc, suggestion) => {
        if (!acc[suggestion.category]) {
          acc[suggestion.category] = [];
        }
        acc[suggestion.category].push(suggestion);
        return acc;
      },
      {} as Record<string, FieldSuggestion[]>
    );
  }, [fieldSuggestions]);

  const categoryLabels = {
    catalog: {
      title: tx('Catálogo', 'Catalog'),
      icon: PiBookOpen,
      color: 'text-blue-600',
    },
    musical: { title: 'Musical', icon: PiMusicNotes, color: 'text-purple-600' },
    metadata: {
      title: tx('Metadados', 'Metadata'),
      icon: PiInfo,
      color: 'text-green-600',
    },
    classification: {
      title: tx('Classificação', 'Classification'),
      icon: PiTag,
      color: 'text-orange-600',
    },
  };

  // 🆕 LÓGICA ATUALIZADA PARA MOSTRAR MODAL DE CONFIRMAÇÃO PRIMEIRO
  useEffect(() => {
    if (isOpen && fieldSuggestions.length > 0) {
      setShowConfirmation(true);
      setShowMainModal(false);
    } else {
      setShowConfirmation(false);
      setShowMainModal(false);
    }
  }, [isOpen, fieldSuggestions.length]);

  const handleConfirmShowSuggestions = () => {
    setShowConfirmation(false);
    setShowMainModal(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    onClose();
  };

  const handleCloseMainModal = () => {
    setShowMainModal(false);
    onClose();
  };

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fieldKey)) {
        newSet.delete(fieldKey);
      } else {
        newSet.add(fieldKey);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedFields(new Set(fieldSuggestions.map((s) => s.key)));
  };

  const handleClearAll = () => {
    setSelectedFields(new Set());
  };

  const handleApply = async () => {
    if (!parentWorkData) return;

    setIsApplying(true);

    try {
      const dataToApply: Partial<CurrentFormData> = {};

      selectedFields.forEach((fieldKey) => {
        const suggestion = fieldSuggestions.find((s) => s.key === fieldKey);
        if (!suggestion) return;

        switch (fieldKey) {
          case 'epochId':
            if (parentWorkData.epochId) {
              dataToApply.epochId = parentWorkData.epochId;
            }
            break;
          case 'instrumentId':
            if (parentWorkData.instrumentId) {
              dataToApply.instrumentId = parentWorkData.instrumentId;
            }
            break;
          case 'imslpTags':
            if (parentWorkData.imslpTags?.length) {
              dataToApply.imslpTags = parentWorkData.imslpTags.join(', ');
            }
            break;
          case 'categoryNames':
          case 'workGenresArr':
            if (
              suggestion.parentValue &&
              Array.isArray(suggestion.parentValue)
            ) {
              (dataToApply as any)[fieldKey] = [...suggestion.parentValue];
            }
            break;
          default:
            if (suggestion.parentValue) {
              (dataToApply as any)[fieldKey] = suggestion.parentValue;
            }
        }
      });

      onApplyData(dataToApply);
      handleCloseMainModal();
    } catch (error) {
      console.error('Erro ao aplicar dados:', error);
    } finally {
      setIsApplying(false);
    }
  };

  if (!parentWorkData || fieldSuggestions.length === 0) {
    return null;
  }

  return (
    <>
      {/* 🆕 MODAL DE CONFIRMAÇÃO */}
      <ParentWorkConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmShowSuggestions}
        parentWorkTitle={parentWorkData.title}
      />

      <FormSheet
        aberto={showMainModal}
        aoFechar={handleCloseMainModal}
        titulo={tx(
          'Copiar dados da obra da coleção',
          'Copy details from the collection work'
        )}
        descricao={tx(
          `“${parentWorkData.title}” tem dados que podem ser úteis. Só campos vazios são preenchidos.`,
          `“${parentWorkData.title}” has details that may help. Only empty fields are filled.`
        )}
        ocupado={isApplying}
        rodape={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="t-legenda">
              {selectedFields.size} {tx('de', 'of')} {fieldSuggestions.length}{' '}
              {tx('selecionados', 'selected')}
            </span>
            <div className="ml-auto flex gap-2">
              <Button
                variante="fantasma"
                onClick={handleCloseMainModal}
                disabled={isApplying}
              >
                {tx('Cancelar', 'Cancel')}
              </Button>
              <Button
                variante="primario"
                icone={PiCheck}
                carregando={isApplying}
                disabled={selectedFields.size === 0}
                onClick={handleApply}
              >
                {isApplying
                  ? 'Aplicando…'
                  : `Aplicar ${selectedFields.size} campo${selectedFields.size !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        }
      >
        <div className="mb-6 flex gap-2">
          <Button tamanho="p" onClick={handleSelectAll}>
            {tx('Selecionar todos', 'Select all')}
          </Button>
          <Button tamanho="p" variante="fantasma" onClick={handleClearAll}>
            {tx('Limpar seleção', 'Clear selection')}
          </Button>
        </div>
        {Object.entries(groupedSuggestions).map(([category, suggestions]) => {
          const categoryInfo =
            categoryLabels[category as keyof typeof categoryLabels];
          return (
            <FormBlock
              key={category}
              titulo={categoryInfo.title}
              nota={tx(
                `${suggestions.length} ${suggestions.length !== 1 ? 'disponíveis' : 'disponível'}`,
                `${suggestions.length} available`
              )}
            >
              {suggestions.map((suggestion) => {
                const displayValue =
                  suggestion.displayValue || suggestion.parentValue;
                return (
                  <div
                    key={suggestion.key}
                    className={cx(
                      'rounded-controle px-4 py-3 sm:col-span-2',
                      selectedFields.has(suggestion.key)
                        ? 'tint-ouro'
                        : 'bg-sup-2'
                    )}
                  >
                    <CaixaDeMarcar
                      rotulo={suggestion.label}
                      ajuda={
                        <span className="block truncate">
                          {displayValue ||
                            tx('Valor não disponível', 'Value not available')}
                        </span>
                      }
                      marcado={selectedFields.has(suggestion.key)}
                      aoMudar={() => handleFieldToggle(suggestion.key)}
                    />
                  </div>
                );
              })}
            </FormBlock>
          );
        })}
      </FormSheet>
    </>
  );
};

export default ParentWorkSuggestionModal;
