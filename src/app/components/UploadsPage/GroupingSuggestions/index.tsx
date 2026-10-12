// app/components/UploadsPage/modals/CreateScoreModal/GroupingSuggestions/GroupingSuggestions.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  PiCheck,
  PiLock,
  PiMusicNotes,
  PiPlus,
  PiStar,
  PiUsers,
} from 'react-icons/pi';
import { getScoreGroups } from '@/app/requests/uploads-client';
import { Icon } from '@/app/components/ui/Icon';
import { Aviso } from '@/app/components/site/edit/FormSheet';
import { cx } from '@/app/components/ui/cx';

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
    return <Aviso tom="carregando">Analisando os grupos existentes…</Aviso>;
  }

  if (error) {
    return <Aviso tom="erro">{error}</Aviso>;
  }

  const opcao = (ativo: boolean, travado = false) =>
    cx(
      'flex w-full items-center gap-3 rounded-controle px-4 py-3 text-left transition-colors duration-[var(--t-toque)]',
      travado
        ? 'cursor-not-allowed bg-sup-2 opacity-70'
        : ativo
          ? 'tint-ouro text-ouro-na-tinta'
          : 'bg-sup-2 text-texto hover:bg-[var(--interactive-hover)]'
    );
  const partituras = (n: number) => `${n} partitura${n !== 1 ? 's' : ''}`;

  return (
    <div className="flex flex-col gap-5">
      {hasExistingScores && userGroups.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="t-rotulo font-medium text-texto">
            Seus grupos ({userGroups.length})
          </span>
          {userGroups.map((group) => {
            const isSelected =
              parseInt(currentGroupIndex) === group.groupIndex &&
              currentGroupTitle === group.groupTitle;
            return (
              <button
                key={`${group.groupIndex}-${group.groupTitle}`}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleUserGroupSelect(group)}
                className={opcao(isSelected)}
              >
                <Icon de={getSourceIcon(group.source)} tamanho="p" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">
                    {group.groupTitle}
                  </span>
                  <span className="t-legenda">
                    {partituras(group.scoresCount)} · índice {group.groupIndex}
                  </span>
                </span>
                {isSelected && <Icon de={PiCheck} tamanho="p" />}
              </button>
            );
          })}
        </div>
      )}

      {hasExistingScores && imslpGroups.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="t-rotulo font-medium text-texto">
            Grupos do IMSLP{' '}
            <span className="font-normal text-texto-fraco">
              · só referência
            </span>
          </span>
          {imslpGroups.slice(0, 3).map((group) => (
            <div
              key={`${group.groupIndex}-${group.groupTitle}`}
              className={opcao(false, true)}
            >
              <Icon de={getSourceIcon(group.source)} tamanho="p" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">{group.groupTitle}</span>
                <span className="t-legenda">
                  {partituras(group.scoresCount)} · índice {group.groupIndex}
                </span>
              </span>
              <Icon de={PiLock} tamanho="p" className="text-texto-fraco" />
            </div>
          ))}
          <span className="t-legenda">
            Suas partituras não entram nos grupos do IMSLP: ficam em grupos
            seus, separados.
          </span>
        </div>
      )}

      <button
        type="button"
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
        className="flex w-full items-center gap-3 rounded-controle border border-dashed border-[var(--linha-forte)] px-4 py-3 text-left hover:bg-[var(--interactive-hover)]"
      >
        <Icon de={PiPlus} tamanho="p" className="text-ouro-texto" />
        <span className="flex flex-col">
          <span className="font-medium text-texto">Criar um grupo novo</span>
          <span className="t-legenda">Com um título seu</span>
        </span>
      </button>

      <ul className="t-legenda flex list-disc flex-col gap-1 pl-4">
        <li>Grupos do IMSLP são só referência; não dá para editá-los.</li>
        <li>Só você acrescenta partituras aos seus grupos.</li>
        <li>Cada pessoa tem os próprios grupos.</li>
      </ul>
    </div>
  );
}
