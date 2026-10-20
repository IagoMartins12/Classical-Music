'use client';

// O histórico — esboço B (04/10/2026): a trilha de tudo o que aconteceu,
// por dia, com filtro por assunto e período, e a exportação em CSV.

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiBell,
  PiCalendarBlank,
  PiChartLineUp,
  PiClipboardText,
  PiDownloadSimple,
  PiMusicNotes,
  PiTimer,
  PiUserCircle,
  PiUsers,
} from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { errorText } from '@/app/hooks/portal/query';
import * as api from '@/app/requests/portal/api';
import type { Activity, ActivityEntity, Role } from '@/app/requests/portal/api';
import { addDays, clock, dayOf, longDate, startOfDay, today } from '../format';
import {
  Empty,
  FilterChips,
  PageHeader,
  ScreenError,
  ScreenLoading,
} from '../pieces';
import { usePortal } from '../PortalProvider';

type Filter = 'all' | ActivityEntity;
const PAGE = 50;

const ICON: Record<string, typeof PiBell> = {
  lesson: PiCalendarBlank,
  assignment: PiClipboardText,
  student: PiUsers,
  profile: PiUserCircle,
  report: PiChartLineUp,
  practice: PiTimer,
  work: PiMusicNotes,
  teacher: PiUsers,
  'lesson-request': PiCalendarBlank,
};
const ACTION_ICON: Record<string, typeof PiBell> = {
  PRACTICE_LOGGED: PiTimer,
  WORK_SUGGESTED: PiMusicNotes,
  ANNOUNCEMENT_SENT: PiBell,
};

export function HistoryScreen({ role }: { role: Role }) {
  const { open } = usePortal();
  const [filter, setFilter] = useState<Filter>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [exporting, setExporting] = useState(false);

  // O recorte (assunto e período) vale para a lista e para a exportação.
  const scope = useMemo(
    () => ({
      as: role,
      ...(filter !== 'all' ? { entityType: filter } : {}),
      ...(from ? { from: startOfDay(from).toISOString() } : {}),
      ...(to ? { to: startOfDay(addDays(to, 1)).toISOString() } : {}),
    }),
    [role, filter, from, to]
  );
  const query = useMemo(() => ({ ...scope, limit }), [scope, limit]);
  const list = useQuery({
    queryKey: ['portal', 'history', query],
    queryFn: () => api.listActivities(query),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const groups = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const a of list.data?.activities ?? []) {
      const day = dayOf(a.createdAt);
      map.set(day, [...(map.get(day) ?? []), a]);
    }
    return [...map.entries()];
  }, [list.data]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      await api.exportActivities(scope);
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setExporting(false);
    }
  };

  const openEntity = (a: Activity) => {
    if (!a.entityId || !a.entityExists) return;
    if (a.entityType === 'lesson') open({ type: 'lesson', id: a.entityId });
    else if (a.entityType === 'assignment')
      open({ type: 'assignment', id: a.entityId });
    else if (a.entityType === 'report')
      open({ type: 'report', id: a.entityId });
    else if (a.entityType === 'student' && role === 'teacher')
      open({ type: 'student', studentId: a.entityId });
  };

  const total = list.data?.pagination.total ?? 0;

  return (
    <>
      <PageHeader
        title="Histórico"
        description={
          role === 'teacher'
            ? 'Tudo o que aconteceu nas suas turmas, do mais recente para trás.'
            : 'Tudo o que aconteceu no seu estudo, do mais recente para trás.'
        }
        actions={
          <Button
            icone={PiDownloadSimple}
            carregando={exporting}
            onClick={exportCsv}
          >
            Exportar CSV
          </Button>
        }
      />

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <FilterChips
            value={filter}
            onChange={(f) => (setFilter(f), setLimit(PAGE))}
            label="Assunto"
            options={[
              ['all', 'Tudo'],
              ['lesson', 'Aulas'],
              ['assignment', 'Tarefas'],
              ['report', 'Relatórios'],
              ...(role === 'teacher'
                ? ([['student', 'Alunos']] as Array<[Filter, string]>)
                : ([['practice', 'Prática']] as Array<[Filter, string]>)),
              ['profile', 'Perfil'],
            ]}
          />
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <Field
              label="De"
              type="date"
              max={to || today()}
              value={from}
              onChange={(e) => (setFrom(e.target.value), setLimit(PAGE))}
              className="sm:w-40"
            />
            <Field
              label="Até"
              type="date"
              min={from || undefined}
              max={today()}
              value={to}
              onChange={(e) => (setTo(e.target.value), setLimit(PAGE))}
              className="sm:w-40"
            />
          </div>
        </div>

        {list.isPending ? (
          <ScreenLoading rows={6} label="Carregando o histórico" />
        ) : list.error ? (
          <ScreenError message={errorText(list.error)} />
        ) : groups.length === 0 ? (
          <Empty
            titulo="Nada por aqui"
            descricao={
              filter !== 'all' || from || to
                ? 'Troque o assunto ou o período.'
                : 'O que acontecer nas aulas, tarefas e relatórios aparece aqui.'
            }
          />
        ) : (
          <ol
            data-ajuda="lista"
            className={cx(
              'flex flex-col gap-10 transition-opacity',
              list.isFetching && 'opacity-70'
            )}
          >
            {groups.map(([day, items]) => (
              <li
                key={day}
                className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]"
              >
                <h2
                  className={cx(
                    'font-display text-xl leading-tight first-letter:uppercase',
                    day === today() && 'text-ouro-texto'
                  )}
                >
                  {longDate(day)}
                </h2>
                <ul className="flex flex-col">
                  {items.map((a) => {
                    const clickable = Boolean(
                      a.entityId && a.entityExists && a.entityType !== 'profile'
                    );
                    const body = (
                      <>
                        <Icon
                          de={
                            ACTION_ICON[a.action] ??
                            ICON[a.entityType] ??
                            PiBell
                          }
                          className="mt-0.5 shrink-0 text-texto-fraco"
                        />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="text-[0.9375rem] text-texto">
                            {a.title}
                          </span>
                          {(a.description || a.entityName) && (
                            <span className="line-clamp-2 text-sm text-texto-suave">
                              {a.description || a.entityName}
                              {!a.entityExists && ' · removido'}
                            </span>
                          )}
                        </span>
                        <span className="t-dado shrink-0 text-xs text-texto-fraco">
                          {clock(a.createdAt)}
                        </span>
                      </>
                    );
                    return (
                      <li
                        key={a.id}
                        className="border-b border-linha last:border-0"
                      >
                        {clickable ? (
                          <button
                            type="button"
                            onClick={() => openEntity(a)}
                            className="flex w-full items-start gap-3 py-3 text-left transition-colors hover:bg-sup-2/60"
                          >
                            {body}
                          </button>
                        ) : (
                          <div className="flex items-start gap-3 py-3">
                            {body}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        )}
        {total > (list.data?.activities.length ?? 0) && (
          <Button
            className="self-start"
            carregando={list.isFetching}
            disabled={limit >= 100}
            onClick={() => setLimit((n) => Math.min(100, n + PAGE))}
          >
            {limit >= 100
              ? `Mostrando 100 de ${total}: use o período ou exporte`
              : 'Mostrar mais'}
          </Button>
        )}
      </div>
    </>
  );
}
