// components/teacher/ShareReportModal.tsx - Modal para selecionar dados para compartilhar

'use client';

import { useState } from 'react';
import {
  PiArrowsClockwise,
  PiBookOpen,
  PiCalendarBlank,
  PiChartBar,
  PiChatCenteredText,
  PiCheck,
  PiHeart,
  PiMedal,
  PiPulse,
  PiShareNetwork,
  PiTarget,
  PiTrendUp,
  PiUsers,
} from 'react-icons/pi';
import Modal from '@/app/components/Modal';
import Checkbox from '../../Common/Checkbox';
import { Text } from '@/app/components/ui/Text';
import { Field } from '@/app/components/ui/Field';
import { Button } from '@/app/components/ui/Button';

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (shareData: ShareReportData) => Promise<boolean>;
  loading: boolean;
  studentName: string;
  periodLabel: string;
}

export interface ShareReportData {
  title: string;
  description?: string;
  teacherMessage?: string;
  selectedSections: {
    overview: boolean;
    evolution: boolean;
    preferences: boolean;
    engagement: boolean;
    insights: boolean;
    assignments: boolean;
    repertoire: boolean;
    attendance: boolean;
    comparisons: boolean;
    achievements: boolean;
    recommendations: boolean;
  };
  allowComments: boolean;
  expiresInDays?: number;
}

const SECTION_OPTIONS = [
  {
    key: 'overview',
    icon: PiChartBar,
    title: 'Visão Geral',
    description: 'Estatísticas básicas de progresso',
    defaultEnabled: true,
  },
  {
    key: 'evolution',
    icon: PiTrendUp,
    title: 'Evolução do Progresso',
    description: 'Gráficos de progresso ao longo do tempo',
    defaultEnabled: true,
  },
  {
    key: 'preferences',
    icon: PiHeart,
    title: 'Preferências Musicais',
    description: 'Compositores e períodos favoritos',
    defaultEnabled: true,
  },
  {
    key: 'engagement',
    icon: PiPulse,
    title: 'Padrões de Engajamento',
    description: 'Análise de horários e dias produtivos',
    defaultEnabled: false,
  },
  {
    key: 'insights',
    icon: PiTarget,
    title: 'Insights Pedagógicos',
    description: 'Estilo de aprendizado e áreas fortes',
    defaultEnabled: true,
  },
  {
    key: 'assignments',
    icon: PiBookOpen,
    title: 'Análise de Tarefas',
    description: 'Performance em diferentes tipos de tarefa',
    defaultEnabled: false,
  },
  {
    key: 'repertoire',
    icon: PiUsers,
    title: 'Análise de Repertório',
    description: 'Compositores estudados e complexidade',
    defaultEnabled: true,
  },
  {
    key: 'attendance',
    icon: PiCalendarBlank,
    title: 'Detalhes de Presença',
    description: 'Pontualidade e padrões de faltas',
    defaultEnabled: false,
  },
  {
    key: 'comparisons',
    icon: PiUsers,
    title: 'Comparações',
    description: 'Comparação com períodos anteriores',
    defaultEnabled: false,
  },
  {
    key: 'achievements',
    icon: PiMedal,
    title: 'Conquistas e Marcos',
    description: 'Marcos de aprendizado alcançados',
    defaultEnabled: true,
  },
  {
    key: 'recommendations',
    icon: PiChatCenteredText,
    title: 'Recomendações',
    description: 'Sugestões para próximos passos',
    defaultEnabled: false,
  },
] as const;

export default function ShareReportModal({
  isOpen,
  onClose,
  onShare,
  loading,
  studentName,
  periodLabel,
}: ShareReportModalProps) {
  const [shareData, setShareData] = useState<ShareReportData>({
    title: `Relatório de Progresso - ${studentName}`,
    description: `Relatório detalhado de progresso no período: ${periodLabel}`,
    teacherMessage: '',
    selectedSections: SECTION_OPTIONS.reduce(
      (acc, option) => ({
        ...acc,
        [option.key]: option.defaultEnabled,
      }),
      {} as ShareReportData['selectedSections']
    ),
    allowComments: false,
    expiresInDays: 30,
  });

  const handleSectionToggle = (
    sectionKey: keyof ShareReportData['selectedSections']
  ) => {
    setShareData((prev) => ({
      ...prev,
      selectedSections: {
        ...prev.selectedSections,
        [sectionKey]: !prev.selectedSections[sectionKey],
      },
    }));
  };

  const handleShare = async () => {
    const success = await onShare(shareData);
    if (success) {
      onClose();
    }
  };

  const selectedCount = Object.values(shareData.selectedSections).filter(
    Boolean
  ).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-theme-primary classical-title">
              Compartilhar Relatório
            </h2>
            <p className="text-theme-tertiary">
              Selecione as informações que serão compartilhadas com{' '}
              {studentName}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Configurações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-theme-primary">
              Informações Básicas
            </h3>

            <div>
              <Field
                label="Título do Relatório"
                type="text"
                value={shareData.title}
                onChange={(e) =>
                  setShareData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Digite um título para o relatório..."
              />
            </div>

            <div>
              <Field.Area
                label="Descrição (opcional)"
                value={shareData.description}
                onChange={(e) =>
                  setShareData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={2}
                placeholder="Breve descrição do que o relatório contém..."
              />
            </div>

            <div>
              <Field.Area
                label="Mensagem para o Aluno (opcional)"
                value={shareData.teacherMessage}
                onChange={(e) =>
                  setShareData((prev) => ({
                    ...prev,
                    teacherMessage: e.target.value,
                  }))
                }
                rows={3}
                placeholder="Escreva uma mensagem personalizada para o aluno sobre este relatório..."
              />
            </div>
          </div>

          {/* Seleção de Seções */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-theme-primary">
                Seções do Relatório
              </h3>
              <Text papel="rotulo" tom="fraco">
                {selectedCount} de {SECTION_OPTIONS.length} selecionadas
              </Text>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SECTION_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                const isSelected =
                  shareData.selectedSections[
                    option.key as keyof ShareReportData['selectedSections']
                  ];

                return (
                  <label
                    key={option.key}
                    className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-theme-secondary hover:border-theme-primary bg-theme-elevated'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? 'bg-brand-primary text-white'
                            : 'bg-theme-secondary text-theme-tertiary'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      <div className="flex-1">
                        <div className="font-medium text-theme-primary mb-1">
                          {option.title}
                        </div>
                        <Text papel="rotulo" tom="fraco" as="div">
                          {option.description}
                        </Text>
                      </div>

                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-brand-primary border-brand-primary'
                            : 'border-theme-secondary'
                        }`}
                      >
                        {isSelected && (
                          <PiCheck className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>

                    <Checkbox
                      checked={isSelected}
                      onChange={() =>
                        handleSectionToggle(
                          option.key as keyof ShareReportData['selectedSections']
                        )
                      }
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Configurações Avançadas */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-theme-primary">
              Configurações
            </h3>

            <div className="flex items-center justify-between p-4 bg-theme-elevated rounded-lg">
              <div>
                <div className="font-medium text-theme-primary">
                  Permitir Comentários
                </div>
                <Text papel="rotulo" tom="fraco" as="div">
                  O aluno poderá deixar comentários no relatório
                </Text>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <Checkbox
                  checked={shareData.allowComments}
                  onChange={(e) =>
                    setShareData((prev) => ({
                      ...prev,
                      allowComments: e.target.checked,
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-theme-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
              </label>
            </div>

            <div>
              <Field.Selecao
                label="Expirar após (dias)"
                value={shareData.expiresInDays || 30}
                onChange={(e) =>
                  setShareData((prev) => ({
                    ...prev,
                    expiresInDays: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
              >
                <option value="">Nunca</option>
                <option value="7">7 dias</option>
                <option value="15">15 dias</option>
                <option value="30">30 dias</option>
                <option value="60">60 dias</option>
                <option value="90">90 dias</option>
              </Field.Selecao>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-theme-secondary mt-6">
          <Button
            variante="secundario"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button
            variante="primario"
            type="submit"
            onClick={handleShare}
            disabled={loading || selectedCount === 0 || !shareData.title.trim()}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <PiArrowsClockwise className="w-4 h-4 animate-spin" />
                <span>Compartilhando...</span>
              </>
            ) : (
              <>
                <PiShareNetwork className="w-4 h-4" />
                <span>Compartilhar Relatório</span>
              </>
            )}
          </Button>
        </div>

        {selectedCount === 0 && (
          <div className="text-center text-accent-red text-sm mt-2">
            Selecione pelo menos uma seção para compartilhar
          </div>
        )}
      </div>
    </Modal>
  );
}
