'use client';

// O retrato do período, como o servidor gera (`reportData`): só as seções
// pedidas, e "sem dado" quando não há amostra — nunca um 0% inventado.

import type { ReportData, ReportDetail } from '@/app/requests/portal/api';
import { duration } from '../format';
import { Block, WorkCited } from '../pieces';
import { typeLabel } from '../assignment/assignmentText';

const MONTHS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];
const month = (key: string) =>
  `${MONTHS[Number(key.slice(5, 7)) - 1]} ${key.slice(2, 4)}`;
const pct = (v: number | null | undefined) =>
  v === null || v === undefined ? 'Sem dado' : `${Math.round(v)}%`;
const score = (v: number | null | undefined) =>
  v === null || v === undefined
    ? 'Sem dado'
    : `${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} de 5`;

function Bars({
  items,
}: {
  items: Array<{ label: string; value: number; note?: string }>;
}) {
  const top = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="flex flex-col gap-2">
      {items.map((i) => (
        <li
          key={i.label}
          className="grid grid-cols-[60px_minmax(0,1fr)_72px] items-center gap-3 text-sm"
        >
          <span className="t-dado text-texto-fraco">{i.label}</span>
          <span
            className="relative block h-2 rounded-full bg-sup-2"
            aria-hidden="true"
          >
            <span
              className="portal-cresce absolute inset-y-0 left-0 rounded-full bg-ouro"
              style={{ width: `${(i.value / top) * 100}%` }}
            />
          </span>
          <span className="t-dado text-right text-texto-suave">
            {i.note ?? i.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Ranked({
  items,
  empty,
}: {
  items: Array<{ item: string; count: number }>;
  empty: string;
}) {
  if (!items.length) return <p className="text-sm text-texto-fraco">{empty}</p>;
  return (
    <ul className="flex flex-col gap-1.5">
      {items.slice(0, 6).map((i) => (
        <li
          key={i.item}
          className="flex justify-between gap-3 text-[0.9375rem]"
        >
          <span className="text-texto-suave">{i.item}</span>
          <span className="t-dado text-texto-fraco">{i.count}×</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Evolução por habilidade (Maestro): uma linha por habilidade, uma barra por
 * mês com a nota média do fechamento das aulas. Mês sem nota fica vazio —
 * nunca estimado.
 */
function Skills({ data }: { data: NonNullable<ReportData['skills']> }) {
  const months = [
    ...new Set(data.skills.flatMap((s) => s.months.map((m) => m.month))),
  ].sort();
  return (
    <Block title="Evolução por habilidade">
      <ul className="flex flex-col gap-3">
        {data.skills.map((s) => {
          const byMonth = new Map(s.months.map((m) => [m.month, m]));
          return (
            <li
              key={s.skill}
              className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)_auto] items-end gap-4"
            >
              <span className="pb-0.5 text-[0.9375rem] text-texto">
                {s.label}
              </span>
              <span className="flex h-8 items-end gap-1" aria-hidden="true">
                {months.map((key) => {
                  const m = byMonth.get(key);
                  return (
                    <span
                      key={key}
                      title={`${month(key)}: ${score(m?.rating)}`}
                      className="flex h-full max-w-6 flex-1 items-end"
                    >
                      {m?.rating != null ? (
                        <span
                          className="portal-cresce block w-full rounded-sm bg-ouro"
                          style={{ height: `${(m.rating / 5) * 100}%` }}
                        />
                      ) : (
                        <span className="block h-px w-full bg-linha-forte" />
                      )}
                    </span>
                  );
                })}
              </span>
              <span className="t-dado pb-0.5 text-right text-texto-suave">
                {s.current === null ? 'Sem nota' : score(s.current)}
                {s.change !== null && s.change !== 0 && (
                  <span className="text-texto-fraco">
                    {' '}
                    ({s.change > 0 ? '+' : '−'}
                    {Math.abs(s.change).toLocaleString('pt-BR')})
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="t-legenda">
        {data.rated
          ? `Nota média do fechamento das aulas, mês a mês (${months.map(month).join(', ')}). Tarefas e prática contam como volume.`
          : 'Ainda sem notas: marque as habilidades ao fechar as aulas e a curva aparece aqui.'}
      </p>
    </Block>
  );
}

/** As seções, do formato atual (direto) ou do embrulhado em `report`. */
function sectionsOf(raw: ReportDetail['reportData']): ReportData {
  if (!raw || typeof raw !== 'object') return {};
  const wrapped = (raw as { report?: ReportData }).report;
  return wrapped && typeof wrapped === 'object' ? wrapped : (raw as ReportData);
}

const list = <T,>(v: T[] | null | undefined): T[] =>
  Array.isArray(v) ? v : [];

export function ReportView({
  data,
  period,
  approvedPieces = false,
}: {
  data: ReportDetail['reportData'];
  period: string;
  /** O professor aprovou as próximas peças: a sugestão automática sai. */
  approvedPieces?: boolean;
}) {
  const r = sectionsOf(data);
  const o = r.overview;
  const months = list(r.attendance?.months);
  const evolution = list(r.evolution);
  const byType = list(r.assignments?.byType);
  const learned = list(r.repertoire?.recentlyLearned);
  const composers = list(r.repertoire?.topComposers);
  const pieces = approvedPieces ? [] : list(r.recommendations?.pieces);
  const skills = r.skills?.skills.length ? r.skills : null;
  const empty =
    !o &&
    !months.length &&
    !evolution.length &&
    !r.insights &&
    !byType.length &&
    !learned.length &&
    !pieces.length &&
    !skills;
  if (empty)
    return (
      <p className="text-[0.9375rem] text-texto-suave">
        Nada para mostrar neste período ({period}).
      </p>
    );
  return (
    <div className="flex flex-col gap-12">
      {o && (
        <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            ['Aulas', `${o.completedLessons} de ${o.totalLessons}`],
            ['Presença', pct(o.attendanceRate)],
            ['Tempo de aula', duration(o.lessonMinutes)],
            ['Tarefas', `${o.completedAssignments} de ${o.totalAssignments}`],
            ['Engajamento', score(o.avgEngagement)],
            ['Preparo', score(o.avgPreparation)],
            ['Nota nas tarefas', score(o.avgTeacherRating)],
            ['Obras aprendidas', String(o.worksLearned)],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="t-legenda">{label}</dt>
              <dd className="font-display text-[1.5rem] leading-none text-texto">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {(months.length > 0 || evolution.length > 0) && (
        <div className="grid gap-10 sm:grid-cols-2">
          {months.length > 0 && (
            <Block title="Presença, mês a mês">
              <Bars
                items={months.map((m) => ({
                  label: month(m.month),
                  value: m.attendanceRate ?? 0,
                  note: pct(m.attendanceRate),
                }))}
              />
              {r.attendance?.trend != null && (
                <p className="t-legenda">
                  {r.attendance.trend >= 0 ? 'Subiu' : 'Caiu'}{' '}
                  {Math.abs(Math.round(r.attendance.trend))} pontos no período.
                </p>
              )}
            </Block>
          )}
          {evolution.length > 0 && (
            <Block title="Aulas, mês a mês">
              <Bars
                items={evolution.map((m) => ({
                  label: month(m.month),
                  value: m.minutes,
                  note: duration(m.minutes),
                }))}
              />
            </Block>
          )}
        </div>
      )}

      {skills && <Skills data={skills} />}

      {r.insights && (
        <div className="grid gap-10 sm:grid-cols-3">
          <Block title="Pontos fortes">
            <Ranked
              items={list(r.insights.strengths)}
              empty="Nada registrado nas aulas do período."
            />
          </Block>
          <Block title="Desafios">
            <Ranked
              items={list(r.insights.challenges)}
              empty="Nada registrado nas aulas do período."
            />
          </Block>
          <Block title="O que foi trabalhado">
            <Ranked
              items={list(r.insights.skillsWorked)}
              empty="Nada registrado nas aulas do período."
            />
          </Block>
          {list(r.insights.signals).length > 0 && (
            <Block title="Sinais" className="sm:col-span-3">
              <ul className="flex flex-col gap-1.5">
                {list(r.insights.signals).map((s) => (
                  <li
                    key={s.kind}
                    className="text-[0.9375rem] text-texto-suave"
                  >
                    {s.detail}
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </div>
      )}

      {byType.length > 0 && (
        <Block title="Tarefas por tipo">
          <table className="w-full text-left text-[0.9375rem]">
            <thead className="text-xs text-texto-fraco">
              <tr className="border-b border-linha">
                <th className="py-2 pr-4 font-normal">Tipo</th>
                <th className="py-2 pr-4 font-normal">Feitas</th>
                <th className="py-2 pr-4 font-normal">No prazo</th>
              </tr>
            </thead>
            <tbody>
              {byType.map((t) => (
                <tr
                  key={t.type}
                  className="border-b border-linha last:border-0"
                >
                  <td className="py-2.5 pr-4">{typeLabel(t.type)}</td>
                  <td className="t-dado py-2.5 pr-4 text-texto-suave">
                    {t.completed} de {t.total}
                  </td>
                  <td className="t-dado py-2.5 pr-4 text-texto-suave">
                    {pct(t.onTimeRate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Block>
      )}

      {(learned.length > 0 || composers.length > 0) && (
        <div className="grid gap-10 sm:grid-cols-2">
          {learned.length > 0 && (
            <Block title="Aprendeu no período">
              <ul className="flex flex-col gap-3">
                {learned.map((w) => (
                  <li key={w.workId}>
                    <WorkCited
                      work={{
                        id: w.workId,
                        title: w.title,
                        composer: { name: w.composer },
                      }}
                      compact
                    />
                  </li>
                ))}
              </ul>
            </Block>
          )}
          {composers.length > 0 && (
            <Block title="Compositores">
              <Ranked
                items={composers.map((c) => ({
                  item: c.composer,
                  count: c.count,
                }))}
                empty=""
              />
            </Block>
          )}
        </div>
      )}

      {pieces.length > 0 && (
        <Block title="Para os próximos meses">
          <ul className="flex flex-col gap-3">
            {pieces.slice(0, 5).map((w) => (
              <li key={w.workId}>
                <WorkCited
                  work={{
                    id: w.workId,
                    title: w.title,
                    composer: { name: w.composer },
                  }}
                  compact
                />
              </li>
            ))}
          </ul>
        </Block>
      )}

      <p className="t-legenda">
        Montado pelo servidor com os números de {period}.
      </p>
    </div>
  );
}
