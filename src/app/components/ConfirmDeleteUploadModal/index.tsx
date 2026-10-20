import { ENVIOS } from '@/app/conteudo/textos/envios';
import { useTextos } from '@/app/hooks/useTextos';
import { useEffect, useState } from 'react';
import {
  PiFileText,
  PiMusicNotes,
  PiSpinnerGap,
  PiTreeStructure,
  PiWarning,
} from 'react-icons/pi';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { Icon } from '@/app/components/ui/Icon';
import { getCascadeInfo } from '@/app/requests/uploads-client';
import ConfirmModal from '@/app/components/ConfirmModal';

interface CascadeInfo {
  works?: { id: string; title: string; scoresCount: number }[];
  scores?: { id: string; title: string; source?: string }[];
  childWorks?: { id: string; title: string; scoresCount: number }[];
  totalWorks?: number;
  totalScores?: number;
  totalChildWorks?: number;
  directScores?: number;
  childWorksScores?: number;
}

interface ConfirmDeleteUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  itemTitle: string;
  itemType: 'composer' | 'work' | 'score';
  itemId?: string;
}

export default function ConfirmDeleteUploadModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  itemTitle,
  itemType,
  itemId,
}: ConfirmDeleteUploadModalProps) {
  const { t } = useTextos(ENVIOS);
  const [cascadeInfo, setCascadeInfo] = useState<CascadeInfo | null>(null);
  const [loadingCascadeInfo, setLoadingCascadeInfo] = useState(false);

  const loadCascadeInfo = async () => {
    if (!itemId) return;

    setLoadingCascadeInfo(true);
    try {
      setCascadeInfo(await getCascadeInfo(itemType, itemId));
    } catch (error) {
      console.error('Erro ao carregar informações de cascata:', error);
    } finally {
      setLoadingCascadeInfo(false);
    }
  };

  useEffect(() => {
    // Carregar informações de cascata se necessário
    if (isOpen && itemId && (itemType === 'composer' || itemType === 'work')) {
      loadCascadeInfo();
    }
  }, [isOpen, itemId, itemType]);

  // Corrigido para garantir que sempre retorna boolean
  const hasCascadeItems = Boolean(
    cascadeInfo &&
    ((cascadeInfo.totalWorks ?? 0) > 0 || (cascadeInfo.totalScores ?? 0) > 0)
  );

  const typeLabel = t(`item_type_${itemType}`);
  const scoreWord = (count: number) =>
    count === 1 ? t('item_score_singular') : t('item_score_plural');
  // Old list texts end in ":" and start with "..."; the layout draws its own.
  const plain = (text: string) =>
    text.replace(/^\.\.\.\s*/, '').replace(/:\s*$/, '');

  const works = itemType === 'composer' ? (cascadeInfo?.works ?? []) : [];
  const scores = itemType === 'work' ? (cascadeInfo?.scores ?? []) : [];
  const childWorks = cascadeInfo?.childWorks ?? [];
  const totals =
    cascadeInfo?.totalScores !== undefined && cascadeInfo.totalScores >= 0
      ? (cascadeInfo.totalWorks && cascadeInfo.totalWorks > 0
          ? t('delete_modal_total_summary_with_works', {
              scores: cascadeInfo.totalScores,
              works: cascadeInfo.totalWorks,
            })
          : t('delete_modal_total_summary', {
              scores: cascadeInfo.totalScores,
            })
        )
          .replace(/^Total:\s*/, '')
          .split(/\s*•\s*/)
      : [];

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      confirmarBloqueado={loadingCascadeInfo}
      type="danger"
      title={t('delete_modal_title')}
      cancelText={t('delete_modal_cancel')}
      confirmText={t('delete_modal_delete_button', { type: typeLabel })}
      message={t('delete_modal_confirm_text', {
        article: t(`item_type_article_${itemType}`),
        type: typeLabel,
        title: itemTitle,
      })}
    >
      {loadingCascadeInfo && (
        <div role="status" className="flex flex-col gap-2">
          {[0, 1, 2].map((n) => (
            <span
              key={n}
              aria-hidden="true"
              className="loading-skeleton block h-7 rounded-controle"
            />
          ))}
          <span className="t-legenda inline-flex items-center gap-2">
            <Icon de={PiSpinnerGap} tamanho="pp" className="animate-spin" />
            {t('delete_modal_checking_related')}
          </span>
        </div>
      )}

      {!loadingCascadeInfo && hasCascadeItems && (
        <section className="entra flex flex-col gap-4 border-t border-linha pt-5">
          <div className="flex flex-col gap-1">
            <h3 className="flex items-center gap-2 font-display text-[1.25rem] leading-tight">
              <Icon
                de={PiTreeStructure}
                tamanho="p"
                className="text-ouro-texto"
              />
              {t('delete_modal_cascade_warning')}
            </h3>
            <p className="t-rotulo text-texto-suave">
              {plain(t('delete_modal_cascade_description'))}
            </p>
          </div>

          {/* The cascade, drawn: the item at the top, a rule falling from it
              to everything that goes with it. */}
          <div className="flex flex-col">
            <p className="flex items-center gap-2.5 font-display text-[1.125rem] leading-snug">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full bg-[var(--erro)]"
              />
              <span className="min-w-0 truncate">{itemTitle}</span>
            </p>
            <div className="ml-[3px] flex flex-col gap-4 border-l border-[var(--linha-forte)] pb-1 pl-5 pt-3">
              {works.length > 0 && (
                <Ramo
                  icone={PiMusicNotes}
                  titulo={plain(
                    t('delete_modal_works_count', { count: works.length })
                  )}
                  itens={works.slice(0, 4).map((w) => ({
                    id: w.id,
                    nome: w.title,
                    extra:
                      w.scoresCount > 0
                        ? `${w.scoresCount} ${scoreWord(w.scoresCount)}`
                        : undefined,
                  }))}
                  mais={
                    works.length > 4
                      ? plain(
                          t('delete_modal_and_more_works', {
                            count: works.length - 4,
                          })
                        )
                      : undefined
                  }
                />
              )}
              {scores.length > 0 && (
                <Ramo
                  icone={PiFileText}
                  titulo={plain(
                    t('delete_modal_scores_count', { count: scores.length })
                  )}
                  itens={scores.slice(0, 4).map((sc) => ({
                    id: sc.id,
                    nome: sc.title,
                  }))}
                  mais={
                    scores.length > 4
                      ? plain(
                          t('delete_modal_and_more_scores', {
                            count: scores.length - 4,
                          })
                        )
                      : undefined
                  }
                />
              )}
              {childWorks.length > 0 && (
                <Ramo
                  icone={PiTreeStructure}
                  titulo={plain(
                    t('delete_modal_child_works_count', {
                      count: childWorks.length,
                    })
                  )}
                  itens={childWorks.slice(0, 3).map((c) => ({
                    id: c.id,
                    nome: c.title,
                    extra:
                      c.scoresCount > 0
                        ? `${c.scoresCount} ${scoreWord(c.scoresCount)}`
                        : undefined,
                  }))}
                />
              )}
            </div>
          </div>

          {totals.length > 0 && (
            <ul className="flex flex-col gap-1 border-t-[3px] border-double border-[var(--linha-forte)] pt-3">
              {totals.map((line) => (
                <li key={line} className="t-rotulo font-medium tabular-nums">
                  {line}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {!loadingCascadeInfo &&
        !hasCascadeItems &&
        (itemType === 'composer' || itemType === 'work') && (
          <p className="t-rotulo border-t border-linha pt-4 text-texto-suave">
            {t('delete_modal_no_related_items')}
          </p>
        )}

      {itemType === 'score' && (
        <Aviso>
          <p className="font-medium">
            {plain(t('delete_modal_score_warning_title'))}
          </p>
          <p className="t-rotulo text-texto-suave">
            {t('delete_modal_score_warning_text')}
          </p>
        </Aviso>
      )}
    </ConfirmModal>
  );
}

/** One branch of the cascade: what it holds, then up to a few names. */
function Ramo({
  icone,
  titulo,
  itens,
  mais,
}: {
  icone: ComponentType<SVGProps<SVGSVGElement>>;
  titulo: string;
  itens: { id: string; nome: string; extra?: string }[];
  mais?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="t-rotulo flex items-center gap-2 font-medium">
        <Icon de={icone} tamanho="pp" className="text-texto-fraco" />
        {titulo}
      </p>
      <ul className="flex flex-col">
        {itens.map((item) => (
          <li
            key={item.id}
            className="flex items-baseline gap-3 py-1 text-[0.875rem]"
          >
            <span className="min-w-0 truncate text-texto-suave">
              {item.nome}
            </span>
            {item.extra && (
              <>
                <span
                  aria-hidden="true"
                  className="min-w-4 flex-1 translate-y-[-0.25em] border-b border-dotted border-[var(--linha-forte)]"
                />
                <span className="t-legenda shrink-0 tabular-nums">
                  {item.extra}
                </span>
              </>
            )}
          </li>
        ))}
        {mais && <li className="t-legenda py-1 italic">{mais}</li>}
      </ul>
    </div>
  );
}

function Aviso({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-t border-linha pt-4">
      <Icon de={PiWarning} tamanho="p" className="mt-0.5 text-[var(--erro)]" />
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}
