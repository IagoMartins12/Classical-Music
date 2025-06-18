// components/LearningModal/LearningModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiTarget,
  FiCheckCircle,
  FiCalendar,
  FiClock,
  FiMusic,
  FiHeart,
  FiUsers,
  FiBookOpen,
  FiAward,
  FiTrendingUp,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useLearningStore } from '@/app/stores/useLearningStore';
import { useAuth } from '@/app/hooks/useAuth';
import Modal from '../Modal';
import Button from '../Common/Button';
import StarRating from './StarRating';
import FormField from './FormField';

export type LearningType = 'want-to-learn' | 'learned';
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

interface LearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  workId: string;
  workTitle: string;
  composerName: string;
  type: LearningType;
}

interface WantToLearnFormData {
  priority: number;
  notes?: string;
  targetDate?: string;
  estimatedStudyTime?: number;
  difficulty?: DifficultyLevel;
  motivation?: string;
  context?: string;
}

interface LearnedFormData {
  mastery: number;
  studyStartDate?: string;
  studyDuration?: number;
  notes?: string;
  wouldRecommend: boolean;
  publicPerformance: boolean;
  difficulty?: DifficultyLevel;
  enjoyment?: number;
  technicalChallenges?: string;
  musicalInsights?: string;
}

const LearningModal = ({
  isOpen,
  onClose,
  workId,
  workTitle,
  composerName,
  type,
}: LearningModalProps) => {
  const { user } = useAuth();
  const {
    toggleWantToLearn,
    toggleLearned,
    removeWantToLearn,
    removeLearned,
    getWantToLearnItem,
    getLearnedItem,
    isWantToLearn,
    isLearned,
    addLearned,
    addWantToLearn,
  } = useLearningStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificar se o item já existe
  const isCurrentlyActive =
    type === 'want-to-learn' ? isWantToLearn(workId) : isLearned(workId);

  // Obter o item atual (com todos os dados)
  const currentItem =
    type === 'want-to-learn'
      ? getWantToLearnItem(workId)
      : getLearnedItem(workId);

  // Form states
  const [wantToLearnForm, setWantToLearnForm] = useState<WantToLearnFormData>({
    priority: 0,
  });

  const [learnedForm, setLearnedForm] = useState<LearnedFormData>({
    mastery: 0,
    wouldRecommend: true,
    publicPerformance: false,
  });

  // Initialize form with existing data if editing
  useEffect(() => {
    if (currentItem) {
      if (type === 'want-to-learn') {
        const item = currentItem as any; // WantToLearnItem
        setWantToLearnForm({
          priority: item.priority || 0,
          notes: item.notes || '',
          targetDate: item.targetDate ? item.targetDate.split('T')[0] : '',
          estimatedStudyTime: item.estimatedStudyTime || undefined,
          difficulty: item.difficulty || undefined,
          motivation: item.motivation || '',
          context: item.context || '',
        });
      } else {
        const item = currentItem as any; // LearnedItem
        setLearnedForm({
          mastery: item.mastery || 0,
          studyStartDate: item.studyStartDate
            ? item.studyStartDate.split('T')[0]
            : '',
          studyDuration: item.studyDuration || undefined,
          notes: item.notes || '',
          wouldRecommend: item.wouldRecommend ?? true,
          publicPerformance: item.publicPerformance || false,
          difficulty: item.difficulty || undefined,
          enjoyment: item.enjoyment || undefined,
          technicalChallenges: item.technicalChallenges || '',
          musicalInsights: item.musicalInsights || '',
        });
      }
    } else {
      // Reset to defaults when no existing item
      setWantToLearnForm({ priority: 0 });
      setLearnedForm({
        mastery: 0,
        wouldRecommend: true,
        publicPerformance: false,
      });
    }
  }, [currentItem, type]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      if (isCurrentlyActive) {
        // ATUALIZAR item existente usando PATCH
        if (type === 'want-to-learn') {
          const response = await fetch('/api/learning/want-to-learn', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workId,
              ...wantToLearnForm,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.item) {
              // Atualizar item no store local
              addWantToLearn(result.item);
            }
            toast.success('Obra atualizada na sua lista de estudos!', {
              icon: '✏️',
              duration: 3000,
            });
          } else {
            throw new Error('Erro ao atualizar');
          }
        } else {
          const response = await fetch('/api/learning/learned', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workId,
              ...learnedForm,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.item) {
              // Atualizar item no store local
              addLearned(result.item);
            }
            toast.success('Dados da obra aprendida atualizados!', {
              icon: '✏️',
              duration: 3000,
            });
          } else {
            throw new Error('Erro ao atualizar');
          }
        }
      } else {
        // ADICIONAR novo item usando toggle
        if (type === 'want-to-learn') {
          await toggleWantToLearn(
            workId,
            user.id,
            wantToLearnForm.priority,
            wantToLearnForm
          );
          toast.success('Obra adicionada à sua lista de estudos!', {
            icon: '🎯',
            duration: 3000,
          });
        } else {
          await toggleLearned(
            workId,
            user.id,
            learnedForm.mastery,
            learnedForm
          );
          toast.success('Parabéns! Obra marcada como aprendida!', {
            icon: '🎉',
            duration: 3000,
          });
        }
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle removal
  const handleRemove = async () => {
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      if (type === 'want-to-learn') {
        await removeWantToLearn(workId);
        toast.success('Obra removida da sua lista de estudos!', {
          icon: '🗑️',
          duration: 3000,
        });
      } else {
        await removeLearned(workId);
        toast.success('Obra removida da lista de aprendidas!', {
          icon: '🗑️',
          duration: 3000,
        });
      }
      onClose();
    } catch (error) {
      console.error('Erro ao remover:', error);
      toast.error('Erro ao remover. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const config =
    type === 'want-to-learn'
      ? {
          title: isCurrentlyActive
            ? 'Editar na Lista de Estudos'
            : 'Adicionar à Lista de Estudos',
          subtitle: isCurrentlyActive
            ? 'Atualize seus objetivos e prioridades'
            : 'Defina seus objetivos e prioridades',
          icon: FiTarget,
          color: 'blue',
          emoji: '🎯',
        }
      : {
          title: isCurrentlyActive
            ? 'Editar Obra Aprendida'
            : 'Marcar como Aprendida',
          subtitle: isCurrentlyActive
            ? 'Atualize sua experiência de aprendizado'
            : 'Compartilhe sua experiência de aprendizado',
          icon: FiCheckCircle,
          color: 'green',
          emoji: '🎉',
        };

  const difficultyOptions = [
    { value: '', label: 'Selecione a dificuldade' },
    { value: 'BEGINNER', label: 'Iniciante' },
    { value: 'INTERMEDIATE', label: 'Intermediário' },
    { value: 'ADVANCED', label: 'Avançado' },
  ];

  const handleClose = () => {
    // Não resetar os forms para manter a persistência
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="2xl"
      showCloseButton={true}
      className="max-h-[90vh] overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 ">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
              config.color === 'blue'
                ? 'from-accent-blue to-brand-primary'
                : 'from-accent-green to-brand-primary'
            } flex items-center justify-center shadow-theme-glow`}
          >
            <config.icon className="w-5 h-5 text-theme-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-theme-primary classical-title">
              {config.title}
            </h2>
            <p className="text-sm text-theme-secondary">{config.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Work Info */}
      <div className="px-6 py-4 classical-card !rounded-2xl !shadow-none !border-none !transform-none border-b border-theme-secondary">
        <div className="flex items-center space-x-3">
          <FiMusic className="w-5 h-5 text-theme-tertiary" />
          <div>
            <h3 className="font-semibold text-theme-primary">{workTitle}</h3>
            <p className="text-sm text-theme-secondary">{composerName}</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-6 py-6 space-y-6">
        {type === 'want-to-learn' ? (
          // Want to Learn Form
          <>
            <StarRating
              value={wantToLearnForm.priority}
              onChange={(value) =>
                setWantToLearnForm((prev) => ({ ...prev, priority: value }))
              }
              label="Prioridade"
              labels={['Baixa', 'Baixa-Média', 'Média', 'Média-Alta', 'Alta']}
            />

            <FormField
              label="Motivação"
              icon={FiHeart}
              description="Por que você quer aprender esta obra?"
            >
              <textarea
                value={wantToLearnForm.motivation || ''}
                onChange={(e) =>
                  setWantToLearnForm((prev) => ({
                    ...prev,
                    motivation: e.target.value,
                  }))
                }
                className="w-full input-classical-2 resize-none"
                rows={3}
                placeholder="Ex: Quero tocar no recital de fim de ano..."
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Data Alvo"
                icon={FiCalendar}
                description="Quando você gostaria de aprender?"
              >
                <input
                  type="date"
                  value={wantToLearnForm.targetDate || ''}
                  onChange={(e) =>
                    setWantToLearnForm((prev) => ({
                      ...prev,
                      targetDate: e.target.value,
                    }))
                  }
                  className="w-full input-classical-2"
                />
              </FormField>

              <FormField
                label="Tempo Estimado"
                icon={FiClock}
                description="Horas de estudo previstas"
              >
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={wantToLearnForm.estimatedStudyTime || ''}
                  onChange={(e) =>
                    setWantToLearnForm((prev) => ({
                      ...prev,
                      estimatedStudyTime: parseInt(e.target.value) || undefined,
                    }))
                  }
                  className="w-full input-classical-2"
                  placeholder="Ex: 50"
                />
              </FormField>
            </div>

            <FormField label="Dificuldade Estimada" icon={FiTrendingUp}>
              <select
                value={wantToLearnForm.difficulty || ''}
                onChange={(e) =>
                  setWantToLearnForm((prev) => ({
                    ...prev,
                    difficulty:
                      (e.target.value as DifficultyLevel) || undefined,
                  }))
                }
                className="w-full input-classical-2"
              >
                {difficultyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Contexto"
              icon={FiUsers}
              description="Onde você pretende tocar esta obra?"
            >
              <input
                type="text"
                value={wantToLearnForm.context || ''}
                onChange={(e) =>
                  setWantToLearnForm((prev) => ({
                    ...prev,
                    context: e.target.value,
                  }))
                }
                className="w-full input-classical-2"
                placeholder="Ex: Recital, aula, estudo pessoal..."
              />
            </FormField>

            <FormField label="Notas Pessoais" icon={FiBookOpen}>
              <textarea
                value={wantToLearnForm.notes || ''}
                onChange={(e) =>
                  setWantToLearnForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                className="w-full input-classical-2 resize-none"
                rows={3}
                placeholder="Observações adicionais..."
              />
            </FormField>
          </>
        ) : (
          // Learned Form
          <>
            <StarRating
              value={learnedForm.mastery}
              onChange={(value) =>
                setLearnedForm((prev) => ({ ...prev, mastery: value }))
              }
              label="Nível de Maestria"
              labels={[
                'Iniciante',
                'Básico',
                'Intermediário',
                'Avançado',
                'Expert',
              ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Início dos Estudos" icon={FiCalendar}>
                <input
                  type="date"
                  value={learnedForm.studyStartDate || ''}
                  onChange={(e) =>
                    setLearnedForm((prev) => ({
                      ...prev,
                      studyStartDate: e.target.value,
                    }))
                  }
                  className="w-full input-classical-2"
                />
              </FormField>

              <FormField
                label="Duração do Estudo"
                icon={FiClock}
                description="Quantos dias levou para aprender"
              >
                <input
                  type="number"
                  min="1"
                  value={learnedForm.studyDuration || ''}
                  onChange={(e) =>
                    setLearnedForm((prev) => ({
                      ...prev,
                      studyDuration: parseInt(e.target.value) || undefined,
                    }))
                  }
                  className="w-full input-classical-2"
                  placeholder="Ex: 90"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Dificuldade Real" icon={FiTrendingUp}>
                <select
                  value={learnedForm.difficulty || ''}
                  onChange={(e) =>
                    setLearnedForm((prev) => ({
                      ...prev,
                      difficulty:
                        (e.target.value as DifficultyLevel) || undefined,
                    }))
                  }
                  className="w-full input-classical-2"
                >
                  {difficultyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="space-y-2">
                <StarRating
                  value={learnedForm.enjoyment || 0}
                  onChange={(value) =>
                    setLearnedForm((prev) => ({
                      ...prev,
                      enjoyment: value,
                    }))
                  }
                  label="Satisfação"
                  labels={[
                    'Não gostei',
                    'Pouco',
                    'Regular',
                    'Gostei',
                    'Adorei',
                  ]}
                />
              </div>
            </div>

            <FormField
              label="Desafios Técnicos"
              icon={FiTarget}
              description="Principais dificuldades encontradas"
            >
              <textarea
                value={learnedForm.technicalChallenges || ''}
                onChange={(e) =>
                  setLearnedForm((prev) => ({
                    ...prev,
                    technicalChallenges: e.target.value,
                  }))
                }
                className="w-full input-classical-2 resize-none"
                rows={2}
                placeholder="Ex: Passagens rápidas na mão esquerda, ornamentações..."
              />
            </FormField>

            <FormField
              label="Insights Musicais"
              icon={FiAward}
              description="O que você aprendeu musicalmente"
            >
              <textarea
                value={learnedForm.musicalInsights || ''}
                onChange={(e) =>
                  setLearnedForm((prev) => ({
                    ...prev,
                    musicalInsights: e.target.value,
                  }))
                }
                className="w-full input-classical-2 resize-none"
                rows={2}
                placeholder="Ex: Compreendi melhor o estilo romântico, expressividade..."
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="wouldRecommend"
                  checked={learnedForm.wouldRecommend}
                  onChange={(e) =>
                    setLearnedForm((prev) => ({
                      ...prev,
                      wouldRecommend: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-accent-green border-theme-secondary rounded focus:ring-brand-primary"
                />
                <label
                  htmlFor="wouldRecommend"
                  className="text-sm font-medium text-theme-secondary cursor-pointer"
                >
                  Recomendaria para outros
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="publicPerformance"
                  checked={learnedForm.publicPerformance}
                  onChange={(e) =>
                    setLearnedForm((prev) => ({
                      ...prev,
                      publicPerformance: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-accent-green border-theme-secondary rounded focus:ring-brand-primary"
                />
                <label
                  htmlFor="publicPerformance"
                  className="text-sm font-medium text-theme-secondary cursor-pointer"
                >
                  Já toquei em público
                </label>
              </div>
            </div>

            <FormField label="Notas Gerais" icon={FiBookOpen}>
              <textarea
                value={learnedForm.notes || ''}
                onChange={(e) =>
                  setLearnedForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                className="w-full input-classical-2 resize-none"
                rows={3}
                placeholder="Suas impressões gerais sobre o aprendizado desta obra..."
              />
            </FormField>
          </>
        )}
      </div>

      {/* Footer */}
      <div
        className={`px-6 py-4 border-t border-theme-secondary flex items-center ${
          isCurrentlyActive && !isSubmitting ? 'justify-between' : 'justify-end'
        } space-x-3`}
      >
        {isCurrentlyActive && !isSubmitting && (
          <Button variant="outline" onClick={handleRemove}>
            Deletar peça da lista
          </Button>
        )}
        <div className=" flex items-center space-x-3">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            rightIcon={config.emoji}
          >
            {isCurrentlyActive ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LearningModal;
