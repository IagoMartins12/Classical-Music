// app/components/UploadsPage/modals/CreateScoreModal/GroupingSuggestions/GroupingSuggestions.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  PiArrowsClockwise,
  PiCheck,
  PiInfo,
  PiLock,
  PiMusicNotes,
  PiPlus,
  PiStar,
  PiUsers,
} from 'react-icons/pi';
import { getScoreGroups } from '@/app/requests/uploads-client';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface ScoreGroup {
  groupIndex: number;
  groupTitle: string;
  scoresCount: number;
  scores: Array<{
    id: string;
    title: string;
    source: string;
    fileFormat: string;
    fileSize?: string;
    pageCount?: string;
  }>;
  source: 'IMSLP' | 'CUSTOM' | 'UPLOAD';
  isUserUploaded: boolean;
  uploadedBy?: string;
}

interface GroupSuggestion {
  suggestedTitle: string;
  suggestedIndex: number;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  source: 'IMSLP' | 'USER_UPLOADED';
}

interface GroupingSuggestionsProps {
  workId: string;
  onGroupSelect: (groupIndex: number, groupTitle: string) => void;
  currentGroupIndex: string;
  currentGroupTitle: string;
  visible: boolean;
}

export default function GroupingSuggestions({
  workId,
  onGroupSelect,
  currentGroupIndex,
  currentGroupTitle,
  visible,
}: GroupingSuggestionsProps) {
  const [imslpGroups, setImslpGroups] = useState<ScoreGroup[]>([]);
  const [userGroups, setUserGroups] = useState<ScoreGroup[]>([]);
  const [suggestions, setSuggestions] = useState<GroupSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingScores, setHasExistingScores] = useState(false);

  // Carregar grupos existentes quando workId muda
  useEffect(() => {
    if (workId && visible) {
      loadExistingGroups();
    }
  }, [workId, visible]);

  const loadExistingGroups = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 [GROUPING] Carregando grupos para obra: ${workId}`);

      const response = await getScoreGroups(workId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = response.data;

      if (data.success) {
        setImslpGroups(data.groups || []); // Grupos IMSLP (apenas referência)
        setUserGroups(data.userGroups || []); // Grupos do usuário (editáveis)
        setSuggestions(data.suggestions || []);
        setHasExistingScores(data.hasExistingScores || false);

        // Auto-selecionar primeira sugestão de alta confiança para USER_UPLOADED
        const highConfidenceSuggestion = data.suggestions?.find(
          (s: GroupSuggestion) =>
            s.confidence === 'high' && s.source === 'USER_UPLOADED'
        );

        if (highConfidenceSuggestion && !currentGroupTitle) {
          onGroupSelect(
            highConfidenceSuggestion.suggestedIndex,
            highConfidenceSuggestion.suggestedTitle
          );
        }

        console.log(`✅ [GROUPING] Grupos carregados:`, {
          imslp: data.groups?.length || 0,
          user: data.userGroups?.length || 0,
          suggestions: data.suggestions?.length || 0,
        });
      }
    } catch (error) {
      console.error('❌ [GROUPING] Erro ao carregar grupos:', error);
      setError('Erro ao carregar grupos existentes');
    } finally {
      setLoading(false);
    }
  };

  const handleUserGroupSelect = (group: ScoreGroup) => {
    console.log(
      `🎯 [GROUPING] Selecionando grupo do usuário:`,
      group.groupTitle
    );
    onGroupSelect(group.groupIndex, group.groupTitle);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'UPLOAD':
        return PiUsers;
      case 'CUSTOM':
        return PiStar;
      case 'IMSLP':
        return PiMusicNotes;
      default:
        return PiMusicNotes;
    }
  };

  if (!visible) return null;

  if (loading) {
    return (
      <div className="bg-theme-secondary/10 rounded-xl p-4 border border-theme-primary/20">
        <Inline gap={3} className="justify-center py-4">
          <div className="w-5 h-5 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
          <Text papel="rotulo" tom="suave">
            Analisando grupos existentes...
          </Text>
        </Inline>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <Inline gap={2} className="text-red-800">
          <PiArrowsClockwise className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </Inline>
      </div>
    );
  }

  return (
    <Stack>
      {hasExistingScores && (
        <>
          {/* Grupos do Usuário (EDITÁVEIS) */}
          {userGroups.length > 0 && (
            <div>
              <Inline
                as="h4"
                gap={2}
                className="text-sm font-semibold text-theme-primary mb-3"
              >
                <PiUsers className="w-4 h-4 text-accent-green" />
                <span>Seus Grupos Existentes</span>
                <span className="px-2 py-0.5 bg-accent-green/20 text-accent-green rounded-full text-xs">
                  {userGroups.length}
                </span>
              </Inline>

              <div className="grid grid-cols-1 gap-2 mb-4">
                {userGroups.map((group) => {
                  const Icon = getSourceIcon(group.source);
                  const isSelected =
                    parseInt(currentGroupIndex) === group.groupIndex &&
                    currentGroupTitle === group.groupTitle;

                  return (
                    <button
                      key={`${group.groupIndex}-${group.groupTitle}`}
                      onClick={() => handleUserGroupSelect(group)}
                      className={`
                        p-3 rounded-lg border-2 transition-all duration-200 text-left
                        ${
                          isSelected
                            ? 'border-accent-green bg-accent-green/10 text-accent-green'
                            : 'border-theme-secondary bg-theme-elevated hover:border-accent-green hover:bg-accent-green/5'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <Inline gap={3}>
                          <div
                            className={`
                            w-8 h-8 rounded-lg flex items-center justify-center
                            ${
                              isSelected
                                ? 'bg-accent-green text-theme-primary'
                                : 'bg-theme-secondary text-theme-tertiary'
                            }
                          `}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-medium text-sm">
                              {group.groupTitle}
                            </h5>
                            <Text papel="legenda" tom="fraco" as="p">
                              {group.scoresCount} partitura
                              {group.scoresCount !== 1 ? 's' : ''} • Índice{' '}
                              {group.groupIndex} • Editável
                            </Text>
                          </div>
                        </Inline>

                        {isSelected && (
                          <PiCheck className="w-5 h-5 text-accent-green" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grupos IMSLP (APENAS REFERÊNCIA) */}
          {imslpGroups.length > 0 && (
            <div>
              <Inline
                as="h4"
                gap={2}
                className="text-sm font-semibold text-theme-primary mb-3"
              >
                <PiMusicNotes className="w-4 h-4 text-accent-blue" />
                <span>Grupos Existentes (IMSLP)</span>
                <Text
                  papel="legenda"
                  tom="fraco"
                  className="px-2 py-0.5 bg-theme-tertiary/20 rounded-full"
                >
                  Apenas referência
                </Text>
              </Inline>

              <div className="grid grid-cols-1 gap-2 mb-4">
                {imslpGroups.slice(0, 3).map((group) => {
                  const Icon = getSourceIcon(group.source);

                  return (
                    <div
                      key={`${group.groupIndex}-${group.groupTitle}`}
                      className="p-3 rounded-lg border-2 border-theme-secondary bg-theme-elevated opacity-75 cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <Inline gap={3}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-theme-secondary text-theme-tertiary">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-medium text-sm text-theme-tertiary">
                              {group.groupTitle}
                            </h5>
                            <Text papel="legenda" tom="fraco" as="p">
                              {group.scoresCount} partitura
                              {group.scoresCount !== 1 ? 's' : ''} • Índice{' '}
                              {group.groupIndex}
                            </Text>
                          </div>
                        </Inline>

                        <PiLock className="w-4 h-4 text-theme-tertiary" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <PiInfo className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <Stack gap={1} className="text-xs text-blue-800">
                    <p className="font-medium">
                      💡 Grupos IMSLP são apenas referência
                    </p>
                    <p>
                      Você não pode adicionar suas partituras aos grupos do
                      IMSLP. Suas partituras ficam organizadas em grupos
                      separados.
                    </p>
                  </Stack>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Opção para Novo Grupo */}
      <div>
        <Inline
          as="h4"
          gap={2}
          className="text-sm font-semibold text-theme-primary mb-3"
        >
          <PiPlus className="w-4 h-4 text-brand-primary" />
          <span>Criar Novo Grupo</span>
        </Inline>

        <button
          onClick={(e) => {
            e.preventDefault();
            const nextIndex =
              Math.max(
                0,
                ...userGroups.map((g) => g.groupIndex),
                ...suggestions
                  .filter((s) => s.source === 'USER_UPLOADED')
                  .map((s) => s.suggestedIndex)
              ) + 1;
            onGroupSelect(nextIndex, '');
          }}
          className="w-full p-3 rounded-lg border-2 border-dashed border-brand-primary text-brand-primary hover:bg-brand-primary/5 transition-all duration-200 text-left"
        >
          <Inline gap={3}>
            <div className="w-8 h-8 bg-brand-primary/20 rounded-lg flex items-center justify-center">
              <PiPlus className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <h5 className="font-medium text-sm">
                Definir Título Personalizado
              </h5>
              <Text papel="legenda" tom="fraco" as="p">
                Criar um novo grupo com título próprio
              </Text>
            </div>
          </Inline>
        </button>
      </div>

      {/* Info Helper Atualizado */}
      <div className="bg-theme-secondary/10 rounded-lg p-3 border border-theme-primary/20">
        <div className="flex items-start space-x-2">
          <PiInfo className="w-4 h-4 text-theme-tertiary mt-0.5 flex-shrink-0" />
          <Text papel="legenda" tom="fraco" as="div">
            <p className="font-medium mb-1">
              💡 Como funciona o novo agrupamento:
            </p>
            <Stack gap={1}>
              <p>
                • <strong>Grupos IMSLP:</strong> Apenas referência, você não
                pode editá-los
              </p>
              <p>
                • <strong>Seus grupos:</strong> Apenas você pode adicionar
                partituras aos seus grupos
              </p>
              <p>
                • <strong>Outros usuários:</strong> Cada usuário tem seus
                próprios grupos
              </p>
            </Stack>
          </Text>
        </div>
      </div>
    </Stack>
  );
}
