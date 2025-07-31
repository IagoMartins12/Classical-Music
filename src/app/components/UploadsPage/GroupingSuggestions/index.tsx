// app/components/UploadsPage/modals/CreateScoreModal/GroupingSuggestions/GroupingSuggestions.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiLayers,
  FiMusic,
  FiUsers,
  FiStar,
  FiTrendingUp,
  FiRefreshCw,
  FiCheck,
  FiPlus,
  FiInfo,
  FiTarget,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';

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
}

interface GroupSuggestion {
  suggestedTitle: string;
  suggestedIndex: number;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
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
  const [groups, setGroups] = useState<ScoreGroup[]>([]);
  const [userGroups, setUserGroups] = useState<ScoreGroup[]>([]);
  const [suggestions, setSuggestions] = useState<GroupSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingScores, setHasExistingScores] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<GroupSuggestion | null>(null);

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

      const response = await fetch(`/api/work-scores/groups?workId=${workId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setGroups(data.groups || []);
        setUserGroups(data.userGroups || []);
        setSuggestions(data.suggestions || []);
        setHasExistingScores(data.hasExistingScores || false);

        // Auto-selecionar primeira sugestão de alta confiança
        const highConfidenceSuggestion = data.suggestions?.find(
          (s: GroupSuggestion) => s.confidence === 'high'
        );

        if (highConfidenceSuggestion && !currentGroupTitle) {
          setSelectedSuggestion(highConfidenceSuggestion);
          onGroupSelect(
            highConfidenceSuggestion.suggestedIndex,
            highConfidenceSuggestion.suggestedTitle
          );
        }

        console.log(`✅ [GROUPING] Grupos carregados:`, {
          total: data.groups?.length || 0,
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

  const handleGroupSelect = (group: ScoreGroup) => {
    console.log(
      `🎯 [GROUPING] Selecionando grupo existente:`,
      group.groupTitle
    );
    onGroupSelect(group.groupIndex, group.groupTitle);
    setSelectedSuggestion(null);
  };

  const handleSuggestionSelect = (suggestion: GroupSuggestion) => {
    console.log(
      `💡 [GROUPING] Selecionando sugestão:`,
      suggestion.suggestedTitle
    );
    setSelectedSuggestion(suggestion);
    onGroupSelect(suggestion.suggestedIndex, suggestion.suggestedTitle);
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'from-accent-green to-accent-blue';
      case 'medium':
        return 'from-accent-blue to-accent-purple';
      case 'low':
        return 'from-accent-purple to-accent-red';
      default:
        return 'from-theme-primary to-theme-secondary';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return FiTarget;
      case 'medium':
        return FiTrendingUp;
      case 'low':
        return FiInfo;
      default:
        return FiInfo;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'UPLOAD':
        return FiUsers;
      case 'CUSTOM':
        return FiStar;
      case 'IMSLP':
        return GiMusicalNotes;
      default:
        return FiMusic;
    }
  };

  if (!visible) return null;

  if (loading) {
    return (
      <div className="bg-theme-secondary/10 rounded-xl p-4 border border-theme-primary/20">
        <div className="flex items-center justify-center space-x-3 py-4">
          <div className="w-5 h-5 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
          <span className="text-theme-secondary text-sm">
            Analisando grupos existentes...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center space-x-2 text-red-800">
          <FiRefreshCw className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasExistingScores && (
        <>
          {/* Grupos do Usuário */}
          {userGroups.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-theme-primary mb-3 flex items-center space-x-2">
                <FiUsers className="w-4 h-4 text-accent-purple" />
                <span>Seus Grupos Existentes para esta partitura</span>
                <span className="px-2 py-0.5 bg-accent-purple/20 text-accent-purple rounded-full text-xs">
                  {userGroups.length}
                </span>
              </h4>

              <div className="grid grid-cols-1 gap-2 mb-4">
                {userGroups.map((group) => {
                  const Icon = getSourceIcon(group.source);
                  const isSelected =
                    parseInt(currentGroupIndex) === group.groupIndex &&
                    currentGroupTitle === group.groupTitle;

                  return (
                    <button
                      key={`${group.groupIndex}-${group.groupTitle}`}
                      onClick={() => handleGroupSelect(group)}
                      className={`
                        p-3 rounded-lg border-2 transition-all duration-200 text-left
                        ${
                          isSelected
                            ? 'border-accent-purple bg-accent-purple/10 text-accent-purple'
                            : 'border-theme-secondary bg-theme-elevated hover:border-accent-purple hover:bg-accent-purple/5'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`
                            w-8 h-8 rounded-lg flex items-center justify-center
                            ${
                              isSelected
                                ? 'bg-accent-purple text-theme-primary'
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
                            <p className="text-xs text-theme-tertiary">
                              {group.scoresCount} partitura
                              {group.scoresCount !== 1 ? 's' : ''} • Índice{' '}
                              {group.groupIndex}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <FiCheck className="w-5 h-5 text-accent-purple" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Outros Grupos (IMSLP/Geral) */}
          {groups.filter((g) => !g.isUserUploaded).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-theme-primary mb-3 flex items-center space-x-2">
                <GiMusicalNotes className="w-4 h-4 text-accent-blue" />
                <span>Grupos Disponíveis (IMSLP)</span>
              </h4>

              <div className="grid grid-cols-1 gap-2 mb-4">
                {groups
                  .filter((g) => !g.isUserUploaded)
                  .slice(0, 3)
                  .map((group) => {
                    const Icon = getSourceIcon(group.source);
                    const isSelected =
                      parseInt(currentGroupIndex) === group.groupIndex &&
                      currentGroupTitle === group.groupTitle;

                    return (
                      <button
                        key={`${group.groupIndex}-${group.groupTitle}`}
                        onClick={() => handleGroupSelect(group)}
                        className={`
                        p-3 rounded-lg border-2 transition-all duration-200 text-left
                        ${
                          isSelected
                            ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                            : 'border-theme-secondary bg-theme-elevated hover:border-accent-blue hover:bg-accent-blue/5'
                        }
                      `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`
                            w-8 h-8 rounded-lg flex items-center justify-center
                            ${
                              isSelected
                                ? 'bg-accent-blue text-theme-primary'
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
                              <p className="text-xs text-theme-tertiary">
                                {group.scoresCount} partitura
                                {group.scoresCount !== 1 ? 's' : ''} • Índice{' '}
                                {group.groupIndex}
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <FiCheck className="w-5 h-5 text-accent-blue" />
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Sugestões Inteligentes
      {suggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-theme-primary mb-3 flex items-center space-x-2">
            <FiTarget className="w-4 h-4 text-accent-green" />
            <span>Sugestões Inteligentes</span>
          </h4>

          <div className="grid grid-cols-1 gap-2">
            {suggestions.map((suggestion, index) => {
              const ConfidenceIcon = getConfidenceIcon(suggestion.confidence);
              const isSelected =
                selectedSuggestion?.suggestedTitle ===
                suggestion.suggestedTitle;

              return (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(suggestion)}
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
                    <div className="flex items-center space-x-3">
                      <div
                        className={`
                        w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${getConfidenceColor(
                          suggestion.confidence
                        )}
                        ${isSelected ? 'shadow-theme-glow' : ''}
                      `}
                      >
                        <ConfidenceIcon className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">
                          {suggestion.suggestedTitle}
                        </h5>
                        <p className="text-xs text-theme-tertiary">
                          {suggestion.reason} • Índice{' '}
                          {suggestion.suggestedIndex}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${
                          suggestion.confidence === 'high'
                            ? 'bg-accent-green/20 text-accent-green'
                            : suggestion.confidence === 'medium'
                            ? 'bg-accent-blue/20 text-accent-blue'
                            : 'bg-accent-purple/20 text-accent-purple'
                        }
                      `}
                      >
                        {suggestion.confidence === 'high'
                          ? 'Alta'
                          : suggestion.confidence === 'medium'
                          ? 'Média'
                          : 'Baixa'}
                        % confiança
                      </span>

                      {isSelected && (
                        <FiCheck className="w-5 h-5 text-accent-green" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )} */}

      {/* Opção para Novo Grupo */}
      <div>
        <h4 className="text-sm font-semibold text-theme-primary mb-3 flex items-center space-x-2">
          <FiPlus className="w-4 h-4 text-brand-primary" />
          <span>Criar Novo Grupo</span>
        </h4>

        <button
          onClick={() => {
            const nextIndex =
              Math.max(
                0,
                ...groups.map((g) => g.groupIndex),
                ...suggestions.map((s) => s.suggestedIndex)
              ) + 1;
            onGroupSelect(nextIndex, '');
            setSelectedSuggestion(null);
          }}
          className="w-full p-3 rounded-lg border-2 border-dashed border-brand-primary text-brand-primary hover:bg-brand-primary/5 transition-all duration-200 text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-brand-primary/20 rounded-lg flex items-center justify-center">
              <FiPlus className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <h5 className="font-medium text-sm">
                Definir Título Personalizado
              </h5>
              <p className="text-xs text-theme-tertiary">
                Criar um novo grupo com título próprio
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Info Helper */}
      {hasExistingScores && (
        <div className="bg-theme-secondary/10 rounded-lg p-3 border border-theme-primary/20">
          <div className="flex items-start space-x-2">
            <FiInfo className="w-4 h-4 text-theme-tertiary mt-0.5 flex-shrink-0" />
            <div className="text-xs text-theme-tertiary">
              <p className="font-medium mb-1">
                💡 Como funciona o agrupamento:
              </p>
              <p>
                Partituras do mesmo grupo ficam organizadas juntas, seguindo o
                padrão do IMSLP. Por exemplo: "Partitura Completa" (índice 0) e
                "Partes Individuais" (índice 1).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
