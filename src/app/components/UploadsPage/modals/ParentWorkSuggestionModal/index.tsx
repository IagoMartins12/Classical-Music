// app/components/modals/ParentWorkSuggestionModal.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  FiCheck,
  FiCopy,
  FiInfo,
  FiCalendar,
  FiMusic,
  FiTag,
  FiUser,
  FiClock,
  FiVolume2,
  FiBookOpen,
  FiStar,
  FiGlobe,
  FiLayers,
  FiX,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Modal from '@/app/components/Modal';
import Checkbox from '@/app/components/Common/Checkbox';

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

// 🆕 MODAL PEQUENO DE CONFIRMAÇÃO
const ParentWorkConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  parentWorkTitle: string;
}> = ({ isOpen, onClose, onConfirm, parentWorkTitle }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      showCloseButton={true}
    >
      <AnimatedItem direction="scale" springType="bouncy" className="w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FiLayers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-primary">
                Informações disponíveis
              </h2>
              <p className="text-theme-secondary text-sm">
                Dados úteis encontrados na obra pai
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="p-4 classical-card-simple  rounded-lg">
              <div className="flex items-start space-x-3">
                <FiInfo className="w-5 h-5 text-theme-primary mt-0.5" />
                <div className="text-sm text-theme-primary">
                  <p className="font-medium mb-2">
                    Deseja aproveitar informações da obra da coleção?
                  </p>
                  <p className="mb-2">
                    A obra <strong>&quot;{parentWorkTitle}&quot;</strong> possui
                    dados que podem ser úteis para preencher campos vazios desta
                    peça.
                  </p>
                  <p className="text-xs text-theme-primary">
                    💡 Apenas campos vazios serão preenchidos. Suas informações
                    já digitadas não serão sobrescritas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              leftIcon={<FiX />}
            >
              Não, obrigado
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={onConfirm}
              leftIcon={<FiCheck />}
            >
              Sim, ver opções
            </Button>
          </div>
        </div>
      </AnimatedItem>
    </Modal>
  );
};

const ParentWorkSuggestionModal: React.FC<ParentWorkSuggestionModalProps> = ({
  isOpen,
  onClose,
  parentWorkData,
  currentFormData,
  onApplyData,
}) => {
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
        label: 'Op./Catálogo',
        icon: FiBookOpen,
        parentValue: parentWorkData.opOrCatalog,
        currentValue: currentFormData.opOrCatalog,
        canCopy:
          !!parentWorkData.opOrCatalog && !currentFormData.opOrCatalog.trim(),
        category: 'catalog',
      },
      {
        key: 'compositionYear',
        label: 'Ano de Composição',
        icon: FiCalendar,
        parentValue: parentWorkData.compositionYear,
        currentValue: currentFormData.compositionYear,
        canCopy:
          !!parentWorkData.compositionYear &&
          !currentFormData.compositionYear.trim(),
        category: 'catalog',
      },
      {
        key: 'firstPublishDate',
        label: 'Primeira Publicação',
        icon: FiCalendar,
        parentValue: parentWorkData.firstPublishDate,
        currentValue: currentFormData.firstPublishDate,
        canCopy:
          !!parentWorkData.firstPublishDate &&
          !currentFormData.firstPublishDate.trim(),
        category: 'catalog',
      },
      {
        key: 'tone',
        label: 'Tonalidade',
        icon: FiMusic,
        parentValue: parentWorkData.tone,
        currentValue: currentFormData.tone,
        canCopy: !!parentWorkData.tone && !currentFormData.tone.trim(),
        category: 'musical',
      },
      {
        key: 'mediaDuration',
        label: 'Duração',
        icon: FiClock,
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
        label: 'Estilo Musical',
        icon: FiVolume2,
        parentValue: parentWorkData.workStyle,
        currentValue: currentFormData.workStyle,
        canCopy:
          !!parentWorkData.workStyle && !currentFormData.workStyle.trim(),
        category: 'musical',
      },
      {
        key: 'moviment',
        label: 'Movimento',
        icon: FiMusic,
        parentValue: parentWorkData.moviment,
        currentValue: currentFormData.moviment,
        canCopy: !!parentWorkData.moviment && !currentFormData.moviment.trim(),
        category: 'musical',
      },
      {
        key: 'instrumentation',
        label: 'Instrumentação',
        icon: FiUser,
        parentValue: parentWorkData.instrumentation,
        currentValue: currentFormData.instrumentation,
        canCopy:
          !!parentWorkData.instrumentation &&
          !currentFormData.instrumentation.trim(),
        category: 'musical',
      },
      {
        key: 'dedicateTo',
        label: 'Dedicado a',
        icon: FiStar,
        parentValue: parentWorkData.dedicateTo,
        currentValue: currentFormData.dedicateTo,
        canCopy:
          !!parentWorkData.dedicateTo && !currentFormData.dedicateTo.trim(),
        category: 'metadata',
      },

      // Arrays
      {
        key: 'categoryNames',
        label: 'Categorias',
        icon: FiTag,
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
        label: 'Gêneros',
        icon: FiTag,
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
        label: 'Tipo de Obra',
        icon: FiGlobe,
        parentValue: parentWorkData.workType,
        currentValue: currentFormData.workType,
        canCopy:
          !!parentWorkData.workType &&
          currentFormData.workType === 'INDIVIDUAL',
        category: 'classification',
      },
      {
        key: 'difficultyLevel',
        label: 'Nível de Dificuldade',
        icon: FiStar,
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
        label: 'Tags IMSLP',
        icon: FiTag,
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
        label: 'Época',
        icon: FiCalendar,
        parentValue: parentWorkData.epoch?.name,
        currentValue: currentFormData.epochId,
        displayValue: parentWorkData.epoch?.name,
        canCopy: !!parentWorkData.epochId && !currentFormData.epochId.trim(),
        category: 'classification',
      },
      {
        key: 'instrumentId',
        label: 'Instrumento',
        icon: FiMusic,
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
    catalog: { title: 'Catálogo', icon: FiBookOpen, color: 'text-blue-600' },
    musical: { title: 'Musical', icon: FiMusic, color: 'text-purple-600' },
    metadata: { title: 'Metadados', icon: FiInfo, color: 'text-green-600' },
    classification: {
      title: 'Classificação',
      icon: FiTag,
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

      {/* MODAL PRINCIPAL (já existente) */}
      <Modal
        isOpen={showMainModal}
        onClose={handleCloseMainModal}
        maxWidth="3xl"
        showCloseButton={true}
      >
        <AnimatedItem direction="scale" springType="bouncy" className="w-full">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <FiCopy className="w-5 h-5 text-theme-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-theme-primary">
                    Copiar informações da obra pai
                  </h2>
                  <p className="text-theme-secondary text-sm">
                    <strong>{parentWorkData.title}</strong> tem informações que
                    podem ser úteis
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6  overflow-y-auto">
              <div className="space-y-6">
                {/* Info */}
                <AnimatedCard
                  className="bg-blue-50 border-blue-200 p-4"
                  hover="none"
                >
                  <div className="flex items-start space-x-3">
                    <FiInfo className="w-5 h-5 text-black mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">
                        Campos que podem ser copiados
                      </p>
                      <p>
                        Apenas campos vazios serão preenchidos. Suas informações
                        já digitadas não serão sobrescritas.
                      </p>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      Selecionar Todos
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleClearAll}
                    >
                      Limpar Seleção
                    </Button>
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    {selectedFields.size} de {fieldSuggestions.length}{' '}
                    selecionados
                  </div>
                </div>

                {/* Fields by Category */}
                {Object.entries(groupedSuggestions).map(
                  ([category, suggestions]) => {
                    const categoryInfo =
                      categoryLabels[category as keyof typeof categoryLabels];
                    const CategoryIcon = categoryInfo.icon;

                    return (
                      <AnimatedCard
                        key={category}
                        className="classical-card-simple p-4"
                        hover="none"
                      >
                        <div className="flex items-center space-x-2 mb-4">
                          <CategoryIcon
                            className={`w-5 h-5 text-theme-primary`}
                          />
                          <h3 className="text-lg font-semibold text-theme-primary">
                            {categoryInfo.title}
                          </h3>
                          <span className="text-sm text-theme-tertiary">
                            ({suggestions.length}{' '}
                            {suggestions.length !== 1
                              ? 'disponíveis'
                              : 'disponível'}
                            )
                          </span>
                        </div>

                        <div className="space-y-3">
                          {suggestions.map((suggestion) => {
                            const Icon = suggestion.icon;
                            const isSelected = selectedFields.has(
                              suggestion.key
                            );
                            const displayValue =
                              suggestion.displayValue || suggestion.parentValue;

                            return (
                              <div
                                key={suggestion.key}
                                className={`p-3 rounded-lg  transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-theme-tertiary'
                                    : 'border-theme-secondary border-2 bg-theme-elevated hover:border-theme-primary'
                                }`}
                                onClick={() =>
                                  handleFieldToggle(suggestion.key)
                                }
                              >
                                <div className="flex items-start space-x-3">
                                  <Checkbox
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() =>
                                      handleFieldToggle(suggestion.key)
                                    }
                                    className="mt-1"
                                  />
                                  <Icon
                                    className={`w-4 h-4 mt-1 text-theme-tertiary`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`font-medium text-sm text-theme-primary`}
                                    >
                                      {suggestion.label}
                                    </p>
                                    <p
                                      className={`text-xs mt-1 truncate text-theme-secondary`}
                                    >
                                      {displayValue || 'Valor não disponível'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AnimatedCard>
                    );
                  }
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-theme-secondary">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseMainModal}
                disabled={isApplying}
              >
                Cancelar
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={handleApply}
                disabled={selectedFields.size === 0 || isApplying}
                leftIcon={
                  isApplying ? (
                    <FiCopy className="animate-pulse" />
                  ) : (
                    <FiCheck />
                  )
                }
              >
                {isApplying
                  ? 'Aplicando...'
                  : `Aplicar ${selectedFields.size} campo${selectedFields.size !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        </AnimatedItem>
      </Modal>
    </>
  );
};

export default ParentWorkSuggestionModal;
