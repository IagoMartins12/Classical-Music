'use client';

// O plano do professor — abre ao tocar no cartão do plano. Vagas usadas (o
// convite pendente não ocupa vaga), o que o plano seguinte acrescenta e o
// caminho para a página de planos, onde fica o checkout. O texto dos planos
// é o mesmo da página de preços (`conteudo/planos.ts`).

import Link from 'next/link';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { useTeacherDashboard } from '@/app/hooks/portal/query';
import { PLANOS, type ChavePlano, type Valor } from '@/app/conteudo/planos';
import { ScreenLoading } from '../pieces';
import type { SheetProps } from '../PortalProvider';

const ORDER: ChavePlano[] = ['FREE', 'PLUS', 'MENTOR', 'MAESTRO'];
const content = PLANOS.pt;

const cell = (v: Valor) =>
  v === true
    ? content.comparacao.sim
    : v === false
      ? '—'
      : typeof v === 'string'
        ? v
        : content.emBreve;

export default function UpgradeSheet({ onClose }: SheetProps) {
  const { data, isPending } = useTeacherDashboard();
  const plan = data?.plan;
  const current = (plan?.name ?? 'MENTOR') as ChavePlano;
  // O topo da escada: Mentor sobe para Maestro (os planos de estudo não dão aula).
  const next: ChavePlano = 'MAESTRO';
  const ci = ORDER.indexOf(current);
  const ni = ORDER.indexOf(next);
  const rows = content.comparacao.linhas.filter(
    (l) => JSON.stringify(l.valores[ci]) !== JSON.stringify(l.valores[ni])
  );
  const limit = plan?.maxStudents ?? null;
  const used = plan?.activeStudents ?? 0;
  const left = limit === null ? null : Math.max(0, limit - used);

  return (
    <Sheet
      aberto
      aoFechar={onClose}
      titulo="Seu plano"
      descricao={
        plan
          ? limit === null
            ? `${content.planos[current].nome} · ${used} alunos ativos, sem limite.`
            : `${content.planos[current].nome} · ${used} de ${limit} alunos. ${left === 1 ? 'Sobra 1 vaga' : `Sobram ${left} vagas`}.`
          : undefined
      }
      largura="g"
      rodape={
        <>
          <Link
            href="/pricing"
            className="mr-auto inline-flex min-h-[var(--alvo)] items-center text-sm font-medium text-ouro-texto"
          >
            Ver todos os planos
          </Link>
          <Button variante="fantasma" onClick={onClose}>
            {current === 'MAESTRO'
              ? 'Fechar'
              : `Continuar no ${content.planos[current].nome}`}
          </Button>
          {current !== 'MAESTRO' && (
            <Link href="/pricing" className={classesDeBotao('primario', 'm')}>
              {content.planos.MAESTRO.acao}
            </Link>
          )}
        </>
      }
    >
      {isPending ? (
        <ScreenLoading rows={3} />
      ) : (
        <div className="flex flex-col gap-8">
          {limit !== null && (
            <div className="flex flex-col gap-3">
              <span className="flex justify-between text-sm">
                <span className="text-texto-suave">Vagas usadas</span>
                <span className="t-dado">
                  {used} de {limit}
                </span>
              </span>
              <div
                className="grid gap-1.5"
                style={{
                  gridTemplateColumns: `repeat(${limit}, minmax(0, 1fr))`,
                }}
                aria-hidden="true"
              >
                {Array.from({ length: limit }, (_, i) => (
                  <span
                    key={i}
                    className={cx(
                      'portal-cresce h-2 rounded-full',
                      i < used ? 'bg-ouro' : 'bg-linha'
                    )}
                  />
                ))}
              </div>
              <span className="t-legenda">
                Convite pendente não ocupa vaga: ocupa quando o aluno aceita.
              </span>
            </div>
          )}
          {current !== 'MAESTRO' && rows.length > 0 && (
            <table className="w-full text-left text-[0.9375rem]">
              <thead>
                <tr className="border-b border-linha text-xs text-texto-fraco">
                  <th className="py-2 pr-4 font-normal">
                    <span className="sr-only">
                      {content.comparacao.recurso}
                    </span>
                  </th>
                  <th className="py-2 pr-4 font-normal">
                    {content.planos[current].nome} · o seu
                  </th>
                  <th className="py-2 font-medium text-ouro-texto">
                    {content.planos[next].nome}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.recurso}
                    className="border-b border-linha last:border-0"
                  >
                    <th
                      scope="row"
                      className="py-3 pr-4 font-normal text-texto-suave"
                    >
                      {r.recurso}
                    </th>
                    <td className="py-3 pr-4 text-texto-suave">
                      {cell(r.valores[ci])}
                    </td>
                    <td className="py-3 text-texto">{cell(r.valores[ni])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="t-legenda">
            O preço aparece na página de planos e no checkout. Mudar de plano
            não mexe nos seus alunos, aulas nem no histórico; voltar a um plano
            menor também não remove ninguém.
          </p>
        </div>
      )}
    </Sheet>
  );
}
