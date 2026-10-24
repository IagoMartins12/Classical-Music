'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { PiCheck, PiDownloadSimple } from 'react-icons/pi';
import { ScorePage } from '@/app/components/site/work/ScorePreview';
import { Aba, Abas } from '@/app/components/ui/Abas';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { scoreSource } from '@/app/conteudo/site/scoreSources';
import { STUDY } from '@/app/conteudo/site/study';
import { useWorkScores, type WorkScore } from '@/app/hooks/useWorkScores';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import type { SelectedWorkScore } from '@/app/stores/useLearningModalStore';

const TYPES = ['scores', 'parts', 'arrangements', 'uploads', 'others'] as const;
type ScoreType = (typeof TYPES)[number];

/** The tab a score belongs to: sent by people, else by its IMSLP type. */
function typeOf(score: WorkScore): ScoreType {
  if (score.source === 'UPLOAD' || score.source === 'CUSTOM') return 'uploads';
  const type = score.type.toLowerCase();
  if (type.includes('score')) return 'scores';
  if (type.includes('part')) return 'parts';
  if (type.includes('arrangement')) return 'arrangements';
  return 'others';
}

const meta = (score: WorkScore, pages: (n: string) => string) =>
  [
    score.fileFormat?.toUpperCase() || 'PDF',
    score.pageCount && pages(score.pageCount),
    score.fileSize,
  ]
    .filter(Boolean)
    .join(' · ');

interface ScoreSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workId: string;
  workTitle: string;
  composerName: string;
  currentSelectedScore?: SelectedWorkScore | null;
  onScoreSelected: (workScore: WorkScore | null) => void;
  isEditing?: boolean;
}

/**
 * Choosing the score of a study, as a sheet stacked on the study one: the
 * work's scores by type (scores, parts, arrangements, sent here, others),
 * each with its first page, more on demand, and the chosen one beside the
 * list on wide screens.
 */
const ScoreSelectionModal = ({
  isOpen,
  onClose,
  workId,
  workTitle,
  composerName,
  currentSelectedScore,
  onScoreSelected,
  isEditing = false,
}: ScoreSelectionModalProps) => {
  const { language } = useRouteLanguage();
  const study = STUDY[language];
  const copy = study.picker;
  const [activeTab, setActiveTab] = useState<ScoreType>('scores');
  const [selected, setSelected] = useState<WorkScore | null>(null);

  const { workScores, loading, error, loadMoreForType, refetch, pagination } =
    useWorkScores({ workId, limitPerType: 20, enabled: isOpen && !!workId });

  const byType = useMemo(() => {
    const groups = Object.fromEntries(
      TYPES.map((type) => [type, [] as WorkScore[]])
    ) as Record<ScoreType, WorkScore[]>;
    for (const score of workScores ?? []) groups[typeOf(score)].push(score);
    return groups;
  }, [workScores]);

  const stat = (type: ScoreType) => {
    const loaded = pagination?.loadedByType?.[type] ?? 0;
    const total = pagination?.totalByType?.[type] ?? 0;
    return { loaded, total, remaining: Math.max(0, total - loaded) };
  };
  const visibleTabs = TYPES.filter((type) => stat(type).total > 0);

  // On opening: the current score, already chosen, in its tab — else the
  // first tab that has scores.
  useEffect(() => {
    if (!isOpen || !workScores?.length || selected) return;
    const current = currentSelectedScore
      ? workScores.find(
          (s) =>
            s.id === currentSelectedScore.id ||
            s.sourceId === currentSelectedScore.sourceId
        )
      : undefined;
    if (current) {
      setSelected(current);
      setActiveTab(typeOf(current));
    } else if (visibleTabs.length && !visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0]);
    }
  }, [isOpen, workScores?.length]);

  useEffect(() => {
    if (!isOpen) setSelected(null);
  }, [isOpen]);

  const confirm = () => {
    try {
      onScoreSelected(selected);
      toast.success(selected ? copy.chosen : copy.removed);
      onClose();
    } catch {
      toast.error(copy.failed);
    }
  };

  const loadMore = async () => {
    try {
      await loadMoreForType(activeTab);
    } catch {
      toast.error(copy.loadError);
    }
  };

  const list = byType[activeTab];
  const tab = stat(activeTab);
  const unchanged =
    !!selected && selected.id === currentSelectedScore?.id && isEditing;

  return (
    <Sheet
      aberto={isOpen}
      aoFechar={onClose}
      titulo={isEditing ? copy.titleEdit : copy.title}
      descricao={`${workTitle} · ${composerName}`}
      largura="gg"
      rodape={
        <div className="flex w-full flex-wrap items-center gap-3">
          <span className="t-rotulo min-w-0 flex-1 truncate text-texto-suave">
            {currentSelectedScore
              ? copy.current(currentSelectedScore.title)
              : copy.noCurrent}
          </span>
          <div className="ml-auto flex gap-2">
            <Button variante="fantasma" onClick={onClose}>
              {isEditing ? copy.keep : copy.cancel}
            </Button>
            <Button
              variante="primario"
              onClick={confirm}
              disabled={unchanged}
              icone={selected ? PiCheck : undefined}
            >
              {selected ? copy.confirm : isEditing ? copy.remove : copy.skip}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {visibleTabs.length > 1 && (
          <Abas rotulo={copy.tabs} className="self-start max-w-full">
            {visibleTabs.map((type) => {
              const s = stat(type);
              return (
                <Aba
                  key={type}
                  ativa={activeTab === type}
                  onClick={() => setActiveTab(type)}
                >
                  {copy.types[type]}
                  <span className="t-dado ml-1.5 text-[0.75rem] text-texto-fraco">
                    {copy.count(s.loaded, s.total)}
                  </span>
                </Aba>
              );
            })}
          </Abas>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="flex min-w-0 flex-col gap-3">
            {loading && !list.length ? (
              <ul aria-busy="true" className="flex flex-col gap-2">
                {[0, 1, 2].map((n) => (
                  <li
                    key={n}
                    aria-hidden="true"
                    className="loading-skeleton h-[5.5rem] rounded-card"
                  />
                ))}
                <li className="sr-only">{copy.loading}</li>
              </ul>
            ) : error ? (
              <div className="flex flex-col items-start gap-3 rounded-card bg-sup-2 p-5">
                <p className="t-rotulo text-texto-suave">{copy.loadError}</p>
                <Button tamanho="p" onClick={() => void refetch()}>
                  {copy.retry}
                </Button>
              </div>
            ) : !list.length ? (
              <p className="t-rotulo rounded-card bg-sup-2 p-5 text-texto-suave">
                {copy.empty}
              </p>
            ) : (
              <ul key={activeTab} className="cascata flex flex-col gap-2">
                {list.map((score, i) => {
                  const chosen = selected?.id === score.id;
                  return (
                    <li
                      key={score.id}
                      className="item-entra"
                      style={{ ['--i' as string]: i % 10 }}
                    >
                      <button
                        type="button"
                        aria-pressed={chosen}
                        onClick={() => setSelected(chosen ? null : score)}
                        className={cx(
                          'flex w-full items-center gap-4 rounded-card p-3 text-left transition-colors duration-[var(--t-toque)]',
                          chosen
                            ? 'tint-ouro shadow-[inset_0_0_0_1px_var(--ouro)]'
                            : 'bg-sup-2 hover:bg-[var(--interactive-hover)]'
                        )}
                      >
                        <span className="relative block aspect-[1/1.3] w-14 shrink-0 overflow-hidden rounded-[6px] bg-sobre-foto shadow-[var(--sombra-1)]">
                          <ScorePage file={score} sizes="56px" small />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <span
                            className={cx(
                              'truncate font-display text-[1.0625rem] leading-snug',
                              chosen && 'text-ouro-na-tinta'
                            )}
                          >
                            {score.title}
                          </span>
                          <span className="t-dado truncate text-[0.75rem] text-texto-suave">
                            {[
                              scoreSource(score.source).label,
                              meta(score, study.score.pages),
                            ].join(' · ')}
                          </span>
                          {(score.publisher || score.editor) && (
                            <span className="t-legenda truncate">
                              {[score.publisher, score.editor]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          )}
                        </span>
                        <span
                          aria-hidden="true"
                          className={cx(
                            'grid h-7 w-7 shrink-0 place-items-center rounded-full transition-opacity',
                            chosen ? 'fill-ouro text-sobre-ouro' : 'opacity-0'
                          )}
                        >
                          <Icon de={PiCheck} tamanho="pp" />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {tab.remaining > 0 && list.length > 0 && (
              <div className="flex flex-col items-center gap-2 pt-2">
                <span className="t-legenda">
                  {copy.showing(tab.loaded, tab.total)}
                </span>
                <Button carregando={loading} onClick={() => void loadMore()}>
                  {copy.loadMore(Math.min(20, tab.remaining))}
                </Button>
              </div>
            )}
          </div>

          <aside
            aria-label={copy.preview}
            className="flex flex-col gap-3 lg:sticky lg:top-0 lg:self-start"
          >
            <span className="t-legenda">{copy.preview}</span>
            {selected ? (
              <div
                key={selected.id}
                className="item-entra flex flex-col gap-3 rounded-card bg-sup-2 p-4"
              >
                <span className="relative mx-auto block aspect-[1/1.3] w-full max-w-[14rem] overflow-hidden rounded-[6px] bg-sobre-foto shadow-[var(--sombra-2)]">
                  <ScorePage file={selected} sizes="224px" />
                </span>
                <span className="font-display text-[1.125rem] leading-snug">
                  {selected.title}
                </span>
                <span className="t-dado text-[0.75rem] text-texto-suave">
                  {meta(selected, study.score.pages)}
                </span>
                {selected.downloadUrl && (
                  <a
                    href={selected.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classesDeBotao('secundario', 'p')}
                  >
                    <Icon de={PiDownloadSimple} tamanho="pp" />
                    {copy.download}
                  </a>
                )}
              </div>
            ) : (
              <p className="t-rotulo rounded-card border border-dashed border-[var(--linha-forte)] p-5 text-center text-texto-fraco">
                {copy.previewEmpty}
              </p>
            )}
          </aside>
        </div>
      </div>
    </Sheet>
  );
};

export default ScoreSelectionModal;
