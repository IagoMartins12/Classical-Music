'use client';

// O estudo do aluno — esboço A no computador e B no tablet e no telefone
// (04/10/2026): a prática (a semana, as quatro últimas, para onde foi o tempo
// e o diário) e o repertório, que é a biblioteca do site. Acrescentar ou
// editar uma obra abre o mesmo modal de "quero aprender / já aprendi" da
// página da obra; a busca vai do compositor para a obra.

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PiPlus, PiTimer, PiTrash } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import {
  errorText,
  usePortalMutation,
  usePractice,
  useRepertoire,
} from '@/app/hooks/portal/query';
import { useLearningModalStore } from '@/app/stores/useLearningModalStore';
import * as api from '@/app/requests/portal/api';
import {
  addDays,
  dayOf,
  duration,
  shortDate,
  today,
  weekStart,
  when,
} from '../format';
import { WorkPicker, type PickedWork } from '../catalog/WorkPicker';
import {
  Empty,
  PageHeader,
  PracticeWeek,
  ProgressBar,
  ScreenError,
  ScreenLoading,
  Section,
  WorkCited,
} from '../pieces';
import { usePortal } from '../PortalProvider';
import { useConfirmar } from '@/app/components/ui/useConfirmar';

export function StudyScreen() {
  const { open } = usePortal();
  return (
    <>
      <PageHeader
        title="Estudo"
        description="Sua prática e o seu repertório. É a mesma biblioteca do resto do Opus Atlas, e seus professores veem para planejar as aulas."
        actions={
          <Button
            variante="primario"
            icone={PiTimer}
            onClick={() => open({ type: 'practice' })}
          >
            Registrar prática
          </Button>
        }
      />
      <div className="flex flex-col gap-16">
        <Practice />
        <Repertoire />
      </div>
    </>
  );
}

function Practice() {
  const from = useMemo(() => addDays(weekStart(today()), -21), []);
  const practice = usePractice({ from });
  const { confirmar, modal } = useConfirmar();
  const remove = usePortalMutation((id: string) => api.removePractice(id), {
    success: 'Registro apagado.',
    invalidate: [
      ['portal', 'practice'],
      ['portal', 'dashboard'],
    ],
  });

  if (practice.isPending)
    return <ScreenLoading rows={3} label="Carregando a prática" />;
  if (practice.error)
    return <ScreenError message={errorText(practice.error)} />;
  const p = practice.data!;
  const weekAgo = addDays(today(), -6);
  const last7 = p.entries.filter((e) => dayOf(e.practicedAt) >= weekAgo);
  const total7 = last7.reduce((s, e) => s + e.minutes, 0);
  const daysWith = new Set(last7.map((e) => dayOf(e.practicedAt))).size;
  const weeks = [0, 1, 2, 3].map((i) => {
    const start = addDays(from, i * 7);
    const end = addDays(start, 7);
    return {
      start,
      minutes: p.entries
        .filter(
          (e) => dayOf(e.practicedAt) >= start && dayOf(e.practicedAt) < end
        )
        .reduce((s, e) => s + e.minutes, 0),
    };
  });
  const top = Math.max(
    ...weeks.map((w) => w.minutes),
    p.weeklyGoalMinutes ?? 0,
    1
  );
  const subjects = new Map<string, number>();
  for (const e of last7) {
    const key = e.work?.title ?? e.topic ?? 'Outros';
    subjects.set(key, (subjects.get(key) ?? 0) + e.minutes);
  }

  if (!p.entries.length)
    return (
      <Section title="Prática" help="pratica">
        <Empty
          icone={PiTimer}
          titulo="Nenhuma prática registrada ainda"
          descricao="Registre quanto estudou, ou use o cronômetro. A meta da semana você define no Perfil do portal."
        />
      </Section>
    );

  return (
    <div data-ajuda="pratica" className="flex flex-col gap-14">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Section
          title="Esta semana"
          detail={`${duration(total7)}${p.weeklyGoalMinutes ? ` de ${duration(p.weeklyGoalMinutes)}` : ''} · estudou em ${daysWith} de 7 dias`}
        >
          <PracticeWeek days={p.days} goal={p.weeklyGoalMinutes} height={120} />
        </Section>
        <Section title="Para onde foi o tempo">
          {subjects.size === 0 ? (
            <p className="text-sm text-texto-fraco">Nada nos últimos 7 dias.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {[...subjects.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([what, minutes]) => (
                  <li key={what} className="flex flex-col gap-1.5">
                    <span className="flex justify-between gap-3 text-[0.9375rem]">
                      <span className="truncate">{what}</span>
                      <span className="t-dado shrink-0 text-texto-suave">
                        {duration(minutes)}
                      </span>
                    </span>
                    <ProgressBar
                      value={(minutes / total7) * 100}
                      label={`${what}: ${duration(minutes)}`}
                    />
                  </li>
                ))}
            </ul>
          )}
        </Section>
      </div>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Section title="Últimas quatro semanas">
          <div
            className="flex h-36 items-end gap-4"
            aria-label={weeks
              .map(
                (w) => `semana de ${shortDate(w.start)}: ${duration(w.minutes)}`
              )
              .join('; ')}
          >
            {weeks.map((w, i) => (
              <span
                key={w.start}
                aria-hidden="true"
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="t-dado text-xs text-texto-suave">
                  {duration(w.minutes)}
                </span>
                <span
                  className={
                    i === 3
                      ? 'portal-sobe w-full rounded-t-[4px] bg-ouro'
                      : 'portal-sobe w-full rounded-t-[4px] bg-linha-forte'
                  }
                  style={{ height: `${Math.max(2, (w.minutes / top) * 75)}%` }}
                />
                <span className="text-xs text-texto-fraco">
                  {i === 3 ? 'esta' : shortDate(w.start)}
                </span>
              </span>
            ))}
          </div>
        </Section>
        <Section title="Diário">
          <ul>
            {p.entries.slice(0, 20).map((e) => (
              <li
                key={e.id}
                className="group/diario grid grid-cols-[96px_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-linha py-2.5"
              >
                <span className="t-dado text-sm text-texto-suave first-letter:uppercase">
                  {when(dayOf(e.practicedAt))}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[0.9375rem]">
                    {e.work?.title ?? e.topic ?? 'Prática'}
                  </span>
                  {e.note && (
                    <span className="t-legenda truncate">{e.note}</span>
                  )}
                </span>
                <span className="t-dado text-sm text-texto">
                  {duration(e.minutes)}
                </span>
                <Button
                  variante="fantasma"
                  tamanho="p"
                  icone={PiTrash}
                  rotulo="Apagar o registro"
                  className="opacity-60 group-hover/diario:opacity-100"
                  onClick={() =>
                    confirmar({
                      titulo: 'Apagar este registro de estudo?',
                      texto:
                        'Os minutos saem da sua semana e do que o professor vê.',
                      botao: 'Apagar o registro',
                      acao: () => remove.mutate(e.id),
                    })
                  }
                />
              </li>
            ))}
          </ul>
        </Section>
      </div>
      {modal}
    </div>
  );
}

function Repertoire() {
  const repertoire = useRepertoire();
  const openLearning = useLearningModalStore((s) => s.openModal);
  const [adding, setAdding] = useState(false);
  const [picked, setPicked] = useState<PickedWork | null>(null);

  const learn = (
    work: api.WorkRef,
    type: 'want-to-learn' | 'learned',
    active = false
  ) =>
    openLearning({
      workId: work.id,
      workTitle: work.title,
      composerName: work.composer?.name ?? '',
      type,
      isCurrentlyActive: active,
    });

  if (repertoire.isPending)
    return <ScreenLoading rows={3} label="Carregando o repertório" />;
  if (repertoire.error)
    return <ScreenError message={errorText(repertoire.error)} />;
  const r = repertoire.data!;
  const known = [
    ...r.wantToLearn.map((w) => w.work.id),
    ...r.learned.map((l) => l.work.id),
  ];

  return (
    <Section
      title="Repertório"
      help="repertorio"
      action={
        <span className="flex items-center gap-4">
          <Link
            href="/learning"
            className="text-sm font-medium text-ouro-texto"
          >
            Abrir a biblioteca
          </Link>
          {!adding && (
            <Button icone={PiPlus} onClick={() => setAdding(true)}>
              Acrescentar obra
            </Button>
          )}
        </span>
      }
    >
      {adding && (
        <div className="flex flex-col gap-4 rounded-card bg-sup-2 p-5">
          {picked ? (
            <div className="flex flex-col gap-4">
              <WorkCited work={picked.work} />
              <span className="flex flex-wrap gap-2">
                <Button
                  variante="primario"
                  onClick={() => (
                    learn(picked.work, 'want-to-learn'),
                    setPicked(null),
                    setAdding(false)
                  )}
                >
                  Quero aprender
                </Button>
                <Button
                  onClick={() => (
                    learn(picked.work, 'learned'),
                    setPicked(null),
                    setAdding(false)
                  )}
                >
                  Já aprendi
                </Button>
                <Button variante="fantasma" onClick={() => setPicked(null)}>
                  Outra obra
                </Button>
              </span>
            </div>
          ) : (
            <>
              <span className="flex items-center justify-between">
                <span className="t-rotulo font-medium text-texto">
                  Procure o compositor, depois a obra
                </span>
                <Button variante="texto" onClick={() => setAdding(false)}>
                  Fechar
                </Button>
              </span>
              <WorkPicker onPick={setPicked} selectedIds={known} />
            </>
          )}
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-3">
        <Column
          title="Estudando"
          detail="Das aulas e tarefas"
          empty="Quando um professor ligar uma obra a uma aula ou tarefa, ela aparece aqui."
        >
          {r.studying.map((s) => (
            <li key={s.work.id} className="flex flex-col gap-1.5">
              <WorkCited work={s.work} compact />
              {!known.includes(s.work.id) && (
                <span className="flex gap-3">
                  <Button
                    variante="texto"
                    onClick={() => learn(s.work, 'want-to-learn')}
                  >
                    Quero aprender
                  </Button>
                  <Button
                    variante="texto"
                    onClick={() => learn(s.work, 'learned')}
                  >
                    Já aprendi
                  </Button>
                </span>
              )}
            </li>
          ))}
        </Column>
        <Column title="Quero aprender" empty="Vazio por enquanto.">
          {r.wantToLearn.map((w) => (
            <li key={w.id} className="flex flex-col gap-1">
              <WorkCited work={w.work} compact />
              <span className="t-legenda">
                {w.suggestedBy
                  ? `Sugerida por ${w.suggestedBy}`
                  : `Desde ${shortDate(dayOf(w.addedAt))}`}
              </span>
              <span className="flex gap-3">
                <Button
                  variante="texto"
                  onClick={() => learn(w.work, 'want-to-learn', true)}
                >
                  Editar
                </Button>
                <Button
                  variante="texto"
                  onClick={() => learn(w.work, 'learned')}
                >
                  Já aprendi
                </Button>
              </span>
            </li>
          ))}
        </Column>
        <Column title="Já aprendi" empty="Vazio por enquanto.">
          {r.learned.map((l) => (
            <li key={l.id} className="flex flex-col gap-1">
              <WorkCited work={l.work} compact />
              <span className="t-legenda">
                Em {shortDate(dayOf(l.learnedAt))}
              </span>
              <Button
                variante="texto"
                className="self-start"
                onClick={() => learn(l.work, 'learned', true)}
              >
                Editar
              </Button>
            </li>
          ))}
        </Column>
      </div>
    </Section>
  );
}

function Column({
  title,
  detail,
  empty,
  children,
}: {
  title: string;
  detail?: string;
  empty: string;
  children: React.ReactNode[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <span className="flex flex-col gap-0.5">
        <h3 className="font-display text-xl leading-tight">{title}</h3>
        {detail && <span className="t-legenda">{detail}</span>}
      </span>
      {children.length === 0 ? (
        <p className="text-sm text-texto-fraco">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-5">{children}</ul>
      )}
    </div>
  );
}
