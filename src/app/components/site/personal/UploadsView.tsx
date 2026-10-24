'use client';

import { useSaidas } from '@/app/components/ui/useSaida';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import {
  PiCloudArrowDown,
  PiDownloadSimple,
  PiFilePdf,
  PiMagnifyingGlass,
  PiMusicNotes,
  PiPencilSimple,
  PiSealCheck,
  PiTrash,
  PiUploadSimple,
  PiUser,
  PiClockCounterClockwise,
} from 'react-icons/pi';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Aba, Abas } from '@/app/components/ui/Abas';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { LIMITES } from '@/app/conteudo/planos';
import { eraName } from '@/app/conteudo/site/eras';
import { PERSONAL, type PersonalCopy } from '@/app/conteudo/site/personal';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { apiFetch } from '@/app/libs/api/client';
import { useSession } from '@/app/libs/session';
import type { ApiSchema } from '@/app/libs/api/types';
import type { UserUpload } from '@/app/requests/my-uploads';
import {
  deleteUpload,
  getUploadFormLists,
  type UploadFormLists,
} from '@/app/requests/uploads-client';
import { listHref } from '@/app/utils/listParams';
import { Portrait } from '../Portrait';
import { ListResults, ViewToggle } from '../lists/ViewToggle';
import { Pagination } from '../lists/Pagination';
import { LISTS } from '@/app/conteudo/site/lists';

const CreateComposerModal = dynamic(
  () => import('@/app/components/UploadsPage/modals/CreateComposerModal'),
  { ssr: false }
);
const CreateWorkModal = dynamic(
  () => import('@/app/components/UploadsPage/modals/CreateWorkModal'),
  { ssr: false }
);
const CreateScoreModal = dynamic(
  () => import('@/app/components/UploadsPage/modals/CreateScoreModal'),
  { ssr: false }
);
const BulkInsertWorksModal = dynamic(
  () => import('@/app/components/UploadsPage/modals/BulkInsertWorksModal'),
  { ssr: false }
);
const ConfirmDeleteUploadModal = dynamic(
  () => import('@/app/components/ConfirmDeleteUploadModal'),
  { ssr: false }
);

type Kind = UserUpload['type'];
type Tab = 'all' | Kind;
const PATH = '/upload';
/** In "All", each kind shows a few and a link to its own tab. */
const PREVIEW = 6;

export interface UploadsData {
  items: UserUpload[];
  counts: Record<Kind | 'total', number>;
  page: number;
  pages: number;
}

/**
 * "Your uploads": what you published, its state and what you can do next.
 * Tab, search and page live in the URL (the list comes from the server);
 * creating and editing reuse the upload forms.
 */
export function UploadsView({
  data,
  tab,
  search,
}: {
  data: UploadsData;
  tab: Tab;
  search: string;
}) {
  const { language } = useRouteLanguage();
  const copy = PERSONAL[language].uploads;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(search);
  const [creating, setCreating] = useState<Kind | null>(null);
  const [bulk, setBulk] = useState<UserUpload | null>(null);
  const [removing, setRemoving] = useState<UserUpload | null>(null);
  const [forms, setForms] = useState<UploadFormLists | null>(null);
  const { data: session } = useSession();

  const totals = useQuery({
    queryKey: ['uploads', 'stats'],
    queryFn: () =>
      apiFetch<ApiSchema<'ContributionTotalsDto'>>('/uploads/stats'),
    staleTime: 30_000,
  });

  const go = (patch: Record<string, string | undefined>) =>
    startTransition(() =>
      router.push(
        listHref(
          PATH,
          {
            type: tab === 'all' ? undefined : tab,
            search: search || undefined,
          },
          patch
        ),
        { scroll: false }
      )
    );
  const refresh = () => startTransition(() => router.refresh());

  // Typed but not searched: the search runs by itself after a pause.
  useEffect(() => {
    const next = query.trim();
    if (next === search) return;
    const timer = setTimeout(() => go({ search: next || undefined }), 3000);
    return () => clearTimeout(timer);
  }, [query, search]);

  const openForm = async (kind: Kind) => {
    setCreating(kind);
    if (!forms) setForms(await getUploadFormLists().catch(() => null));
  };
  const openBulk = async (composer: UserUpload) => {
    setBulk(composer);
    if (!forms) setForms(await getUploadFormLists().catch(() => null));
  };
  const remove = async () => {
    if (!removing) return;
    // The confirmation closes and the card leaves while the API removes it;
    // a failure brings it back.
    const item = removing;
    setRemoving(null);
    const exit = leaving.sair(item.id);
    const result = await deleteUpload(item.type, item.id).catch(() => null);
    await exit;
    if (result?.ok) {
      toast.success(copy.removed);
      refresh();
    } else {
      leaving.voltar(item.id);
      toast.error(copy.removeFailed);
    }
  };
  const leaving = useSaidas();

  // O teto vem da API (o plano que vale, inclusive o Plus pelo professor);
  // enquanto ela não responde, vale o plano da sessão.
  const sessionPlan = session?.user.currentPlan ?? 'FREE';
  const used = totals.data?.total ?? 0;
  const limit = totals.data
    ? totals.data.limit
    : sessionPlan === 'FREE'
      ? LIMITES.FREE.acervo
      : null;
  const plan = limit === null ? 'PAID' : 'FREE';
  // No teto: os botões param e a tela diz por quê, antes do formulário.
  const full = limit !== null && used >= limit;
  const tabs: [Tab, string, number][] = [
    ['all', copy.tabs.all, data.counts.total],
    ['composer', copy.tabs.composer, data.counts.composer],
    ['work', copy.tabs.work, data.counts.work],
    ['score', copy.tabs.score, data.counts.score],
  ];

  const section = (kind: Kind) => {
    const items = data.items.filter((item) => item.type === kind);
    if (!items.length) return null;
    const visible = tab === 'all' ? items.slice(0, PREVIEW) : items;
    return (
      <section key={kind} className="flex flex-col gap-3">
        {tab === 'all' && (
          <div className="flex items-end justify-between gap-3">
            <h2 className="t-subtitulo">{copy.tabs[kind]}</h2>
            {data.counts[kind] > PREVIEW && (
              <Button
                variante="texto"
                tamanho="p"
                onClick={() => go({ type: kind })}
              >
                {copy.seeAll(data.counts[kind])}
              </Button>
            )}
          </div>
        )}
        <ListResults className="cascata grid grid-cols-1 gap-3 divide-[var(--linha)] xl:grid-cols-2 max-sm:gap-0 max-sm:divide-y data-[view=list]:grid-cols-1! data-[view=list]:gap-0 data-[view=list]:divide-y">
          {visible.map((item) => (
            <UploadRow
              key={item.id}
              item={item}
              copy={copy}
              language={language}
              onRemove={() => setRemoving(item)}
              itemRef={leaving.refDe(item.id)}
              onBulk={() => openBulk(item)}
              onScore={() => openForm('score')}
            />
          ))}
        </ListResults>
      </section>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2">
        <Button
          variante="primario"
          icone={PiUploadSimple}
          onClick={() => openForm('score')}
          disabled={full}
        >
          {copy.newScore}
        </Button>
        <Button
          icone={PiMusicNotes}
          onClick={() => openForm('work')}
          disabled={full}
        >
          {copy.newWork}
        </Button>
        <Button
          icone={PiUser}
          onClick={() => openForm('composer')}
          disabled={full}
        >
          {copy.newComposer}
        </Button>
      </div>
      {full && limit !== null && (
        <p className="t-rotulo -mt-4 text-texto-suave">
          {copy.full(limit)}{' '}
          <Link
            href="/pricing"
            className="text-ouro-texto underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]"
          >
            {copy.upgrade}
          </Link>
        </p>
      )}

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-2 rounded-card bg-sup-2 p-4">
          <dt className="t-legenda">
            {limit !== null ? copy.plan(used, limit) : copy.unlimited}
          </dt>
          <dd className="font-display text-[1.75rem] leading-none">
            {limit !== null ? `${used} / ${limit}` : used}
          </dd>
          {limit !== null && (
            <span className="block h-1.5 overflow-hidden rounded-full bg-[var(--linha)]">
              <span
                className="block h-full rounded-full fill-ouro"
                style={{ width: `${Math.min(100, (used / limit) * 100)}%` }}
              />
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2 rounded-card bg-sup-2 p-4">
          <dt className="t-legenda">{copy.live}</dt>
          <dd className="t-rotulo">
            {[
              [copy.tabs.composer, totals.data?.composers],
              [copy.tabs.work, totals.data?.works],
              [copy.tabs.score, totals.data?.scores],
            ]
              .map(([label, n]) => `${n ?? '·'} ${String(label).toLowerCase()}`)
              .join(' · ')}
          </dd>
        </div>
        <div className="flex flex-col gap-2 rounded-card bg-sup-2 p-4">
          <dt className="t-legenda">{copy.reports}</dt>
          <dd className="font-display text-[1.75rem] leading-none">
            {totals.data?.pendingReports ?? '·'}
          </dd>
        </div>
      </dl>
      {plan === 'FREE' && !full && (
        <p className="t-rotulo -mt-4 text-texto-suave">
          <Link
            href="/pricing"
            className="text-ouro-texto underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]"
          >
            {copy.upgrade}
          </Link>
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Abas rotulo={copy.title}>
          {tabs.map(([key, label, n]) => (
            <Aba
              key={key}
              ativa={tab === key}
              onClick={() => go({ type: key === 'all' ? undefined : key })}
            >
              {label} · {n}
            </Aba>
          ))}
        </Abas>
        <div className="flex items-center gap-2">
          <Link
            href="/upload/history"
            className={classesDeBotao('fantasma', 'p')}
          >
            <Icon de={PiClockCounterClockwise} tamanho="pp" /> {copy.history}
          </Link>
          <ViewToggle />
        </div>
      </div>

      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go({ search: query.trim() || undefined });
        }}
        className="search-field flex min-h-12 items-center gap-3 rounded-full bg-sup-2 pl-5 pr-1.5"
      >
        <Icon de={PiMagnifyingGlass} className="text-texto-fraco" />
        <label className="sr-only" htmlFor="uploads-search">
          {copy.search}
        </label>
        <input
          id="uploads-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={copy.search}
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-texto-fraco"
        />
        <Button
          type="submit"
          variante="primario"
          tamanho="p"
          carregando={pending && query.trim() !== search}
          className="rounded-full"
        >
          {copy.searchAction}
        </Button>
      </form>

      <div
        aria-busy={pending}
        className={cx(
          'flex flex-col gap-10 transition-opacity',
          pending && 'opacity-60'
        )}
      >
        {data.counts.total === 0 && !search ? (
          <div className="flex flex-col items-start gap-3 rounded-card bg-sup-2 p-8">
            <p className="font-display text-[1.5rem]">{copy.empty}</p>
            <p className="t-rotulo text-texto-suave">{copy.emptyText}</p>
            <Button
              variante="primario"
              icone={PiUploadSimple}
              onClick={() => openForm('score')}
            >
              {copy.newScore}
            </Button>
          </div>
        ) : data.items.length === 0 ? (
          <p className="t-rotulo text-texto-suave">{copy.noResults}</p>
        ) : tab === 'all' ? (
          (['composer', 'work', 'score'] as const).map(section)
        ) : (
          section(tab)
        )}
      </div>

      {tab !== 'all' && (
        <Pagination
          path={PATH}
          query={{ type: tab, search: search || undefined }}
          page={data.page}
          pages={data.pages}
          copy={LISTS[language].common}
        />
      )}

      {creating === 'composer' && forms && (
        <CreateComposerModal
          isOpen
          onClose={() => (setCreating(null), refresh())}
          epochs={forms.epochs}
          roles={forms.roles}
        />
      )}
      {creating === 'work' && forms && (
        <CreateWorkModal
          isOpen
          onClose={() => (setCreating(null), refresh())}
          composers={forms.composers}
          instruments={forms.instruments}
          epochs={forms.epochs}
        />
      )}
      {creating === 'score' && forms && (
        <CreateScoreModal
          isOpen
          onClose={() => (setCreating(null), refresh())}
          works={forms.works}
        />
      )}
      {bulk && forms && (
        <BulkInsertWorksModal
          isOpen
          onClose={() => (setBulk(null), refresh())}
          composer={{
            id: bulk.id,
            name: bulk.title,
            fullName: bulk.title,
            imslpId: bulk.imslpId,
            permLinkImslp: bulk.imslpPermlink,
          }}
          instruments={forms.instruments}
          epochs={forms.epochs}
        />
      )}
      {removing && (
        <ConfirmDeleteUploadModal
          isOpen
          itemTitle={removing.title}
          itemType={removing.type}
          itemId={removing.id}
          onClose={() => setRemoving(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}

function UploadRow({
  item,
  copy,
  language,
  onRemove,
  itemRef,
  onBulk,
  onScore,
}: {
  item: UserUpload;
  copy: PersonalCopy['uploads'];
  language: 'pt' | 'en';
  onRemove: () => void;
  /** The list's exit (`useSaidas`) reaches the card through this. */
  itemRef: (el: HTMLElement | null) => void;
  onBulk: () => void;
  onScore: () => void;
}) {
  const href =
    item.type === 'composer'
      ? `/composer/${item.id}`
      : item.type === 'work'
        ? `/works/${item.id}`
        : item.workId
          ? `/works/${item.workId}#scores`
          : undefined;
  const date = new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(item.updatedAt || item.createdAt));
  const detail =
    item.type === 'composer'
      ? [
          eraName(item.epochName, language),
          !item.portraitUrl && copy.missingPortrait,
        ]
      : item.type === 'work'
        ? [item.composerName, item.instrumentName]
        : [
            item.workTitle,
            item.composerName,
            item.pageCount && `${item.pageCount} p.`,
            item.fileSize,
          ];
  const verified = item.verificationStatus === 'verified' || item.isVerified;
  const quality = item.dataQuality ? copy.quality[item.dataQuality] : null;

  return (
    <li
      ref={itemRef}
      className="flex items-start gap-3 rounded-card bg-sup-2 p-4 row:items-center row:gap-4 row:rounded-none row:bg-transparent! row:bg-none! row:px-0 row:py-3"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {item.type === 'composer' ? (
          <Portrait
            name={item.title}
            src={item.portraitUrl}
            sizes="48px"
            className="h-12 w-12 shrink-0 rounded-full text-[0.875rem]"
          />
        ) : (
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-controle bg-[var(--fundo)] text-texto-fraco row:bg-sup-2">
            <Icon
              de={item.type === 'work' ? PiMusicNotes : PiFilePdf}
              tamanho="m"
            />
          </span>
        )}
        <span className="flex min-w-0 flex-col gap-0.5">
          {href ? (
            <Link
              href={href}
              className="truncate font-display text-[1.1875rem] hover:text-ouro-texto"
            >
              {item.title}
            </Link>
          ) : (
            <span className="truncate font-display text-[1.1875rem]">
              {item.title}
            </span>
          )}
          <span className="t-rotulo truncate text-texto-suave">
            {detail.filter(Boolean).join(' · ')}
          </span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 t-legenda">
            <span>{item.isIMSLP ? copy.imslp : copy.yours}</span>
            <span aria-hidden="true">·</span>
            <span
              className={cx(
                'inline-flex items-center gap-1',
                verified && 'text-verificado'
              )}
            >
              {verified && <Icon de={PiSealCheck} tamanho="pp" />}
              {verified ? copy.verified : copy.pending}
            </span>
            {quality && (
              <>
                <span aria-hidden="true">·</span>
                <span>{quality}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{date}</span>
          </span>
        </span>
      </div>
      {/* On a card, the actions sit in its top-right corner. */}
      <div className="-mr-2 -mt-2 flex shrink-0 gap-0.5 row:m-0 row:gap-1">
        {item.type === 'composer' && item.imslpPermlink && (
          <Button
            tamanho="p"
            variante="fantasma"
            icone={PiCloudArrowDown}
            rotulo={copy.importWorks}
            onClick={onBulk}
          />
        )}
        {item.type === 'work' && (
          <Button
            tamanho="p"
            variante="fantasma"
            icone={PiUploadSimple}
            rotulo={copy.addScore}
            onClick={onScore}
          />
        )}
        {item.type === 'score' && item.downloadUrl && (
          <a
            href={item.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={copy.download}
            className={classesDeBotao('fantasma', 'p', true)}
          >
            <Icon de={PiDownloadSimple} tamanho="pp" />
          </a>
        )}
        <Link
          href={`/upload/${item.type}/${item.id}/edit`}
          aria-label={copy.edit}
          className={classesDeBotao('fantasma', 'p', true)}
        >
          <Icon de={PiPencilSimple} tamanho="pp" />
        </Link>
        <Button
          tamanho="p"
          variante="fantasma"
          icone={PiTrash}
          rotulo={copy.remove}
          onClick={onRemove}
        />
      </div>
    </li>
  );
}
