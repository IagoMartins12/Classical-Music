'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  PiArrowRight,
  PiCaretDown,
  PiCheck,
  PiLightbulb,
  PiQuestion,
  PiWarning,
  PiWarningOctagon,
} from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Segmentos } from '@/app/components/Admin/painel/Controles';
import { Numeros, rolarAte } from '@/app/components/Admin/painel/Numeros';
import { nomeDoCampo } from '@/app/components/Admin/painel/acoes';
import { numero, porcento } from '@/app/components/Admin/painel/formatos';
import { adminKeys, useAdminQuery } from '@/app/hooks/admin/query';
import {
  getMetricsInsights,
  type ApiInsight,
} from '@/app/requests/admin/metrics';

/**
 * Insights: o que os dados mostram agora, e o que fazer.
 *
 * Cada leitura vem da API com **o que foi medido, sobre quantos registros, e
 * o mínimo para valer** — abaixo do mínimo ela se declara "sem base" em vez
 * de afirmar. O painel antigo tinha 35 `Math.random()` nesta tela, inclusive
 * na própria "confiança" das previsões; a tela de 2.620 linhas que o
 * substituía ainda traduzia os insights reais para o formato do legado e
 * perdia a amostra, a ação e os casos no caminho.
 *
 * A ordem é a da urgência: o que pede ação, as oportunidades, o que está em
 * ordem e, fechado no fim, o que ainda não tem base para ler. Cada insight
 * mostra os casos concretos por trás do número — para conferir, não
 * acreditar.
 */

type Area =
  | 'todas'
  | 'catalog'
  | 'learning'
  | 'audience'
  | 'teaching'
  | 'monetization';

const AREAS: { valor: Area; rotulo: string }[] = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'catalog', rotulo: 'Catálogo' },
  { valor: 'audience', rotulo: 'Audiência' },
  { valor: 'learning', rotulo: 'Aprendizado' },
  { valor: 'teaching', rotulo: 'Ensino' },
  { valor: 'monetization', rotulo: 'Receita' },
];

const areaDe = (i: ApiInsight) => i.code.split('.')[0] as Area;

const GRUPOS: {
  id: string;
  titulo: string;
  severidades: ApiInsight['severity'][];
  fechado?: boolean;
}[] = [
  { id: 'acao', titulo: 'Pede ação', severidades: ['critical', 'warning'] },
  { id: 'oportunidade', titulo: 'Oportunidades', severidades: ['opportunity'] },
  { id: 'ordem', titulo: 'Em ordem', severidades: ['healthy'] },
  {
    id: 'sem-base',
    titulo: 'Ainda sem base para ler',
    severidades: ['insufficient_data'],
    fechado: true,
  },
];

function Marcador({ s }: { s: ApiInsight['severity'] }) {
  const mapa = {
    // Crítico em tom de atenção, não vermelho: vermelho é só erro e apagar
    // (Decisões do produto). O octógono é o que o distingue do aviso.
    critical: { de: PiWarningOctagon, cor: 'text-atencao', nome: 'Crítico' },
    warning: { de: PiWarning, cor: 'text-atencao', nome: 'Atenção' },
    opportunity: {
      de: PiLightbulb,
      cor: 'text-ouro-texto',
      nome: 'Oportunidade',
    },
    healthy: { de: PiCheck, cor: 'text-texto-fraco', nome: 'Em ordem' },
    insufficient_data: {
      de: PiQuestion,
      cor: 'text-texto-fraco',
      nome: 'Sem base',
    },
  }[s];
  return (
    <Icon de={mapa.de} tamanho="m" rotulo={mapa.nome} className={mapa.cor} />
  );
}

function medida(i: ApiInsight) {
  const v = i.measurement.value;
  if (v === null || v === undefined) return '—';
  switch (i.measurement.unit) {
    case 'percent':
      return porcento(v);
    case 'days':
      return `${numero(Math.round(v))} dias`;
    case 'ratio':
      return v.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    default:
      return numero(v);
  }
}

export default function Insights() {
  const [area, setArea] = useState<Area>('todas');
  // O número clicado abre o grupo dele (mesmo o que vem fechado) e rola até lá.
  const [pedido, setPedido] = useState<{ id: string; vez: number } | null>(
    null
  );
  const irAoGrupo = (id: string) => {
    setArea('todas');
    setPedido({ id, vez: Date.now() });
    setTimeout(() => rolarAte(`ins-${id}`), 50);
  };
  const q = useAdminQuery(
    adminKeys.list('insights', 'todos'),
    getMetricsInsights,
    {
      staleTime: 5 * 60_000,
    }
  );

  const todos = q.data?.insights ?? [];
  const visiveis =
    area === 'todas' ? todos : todos.filter((i) => areaDe(i) === area);

  const contagem = useMemo(() => {
    const c = { acao: 0, oportunidade: 0, ordem: 0, semBase: 0 };
    for (const i of todos) {
      if (i.severity === 'critical' || i.severity === 'warning') c.acao += 1;
      else if (i.severity === 'opportunity') c.oportunidade += 1;
      else if (i.severity === 'healthy') c.ordem += 1;
      else c.semBase += 1;
    }
    return c;
  }, [todos]);

  const pedemAcaoPorArea = (a: Area) =>
    todos.filter(
      (i) =>
        (a === 'todas' || areaDe(i) === a) &&
        (i.severity === 'critical' || i.severity === 'warning')
    ).length;

  return (
    <Stack gap={8}>
      <Cabecalho
        titulo="Insights"
        descricao="O que os dados mostram agora e o que fazer. Todo número diz sobre quantos registros foi medido."
        atualizadoEm={q.updatedAt}
        aoAtualizar={() => q.refetch()}
        atualizando={q.fetching && !q.loading}
      />

      <Numeros
        carregando={q.loading}
        itens={[
          {
            id: 'acao',
            rotulo: 'Pedem ação',
            aoClicar: () => irAoGrupo('acao'),
            valor: numero(contagem.acao),
            tom: contagem.acao ? 'atencao' : undefined,
          },
          {
            id: 'oportunidade',
            rotulo: 'Oportunidades',
            aoClicar: () => irAoGrupo('oportunidade'),
            valor: numero(contagem.oportunidade),
          },
          {
            id: 'ordem',
            rotulo: 'Em ordem',
            valor: numero(contagem.ordem),
            aoClicar: () => irAoGrupo('ordem'),
          },
          {
            id: 'sem-base',
            rotulo: 'Sem amostra suficiente',
            aoClicar: () => irAoGrupo('sem-base'),
            valor: numero(contagem.semBase),
          },
        ]}
      />

      <Segmentos
        rotulo="Área"
        opcoes={AREAS.map((a) => ({
          ...a,
          contagem: q.data ? pedemAcaoPorArea(a.valor) || null : null,
        }))}
        valor={area}
        aoMudar={setArea}
      />

      {q.loading ? (
        <Row.Lista>
          <Row.Skeleton repetir={6} />
        </Row.Lista>
      ) : q.error ? (
        <Text papel="rotulo" tom="erro" as="p">
          Não foi possível ler os insights: {q.error}
        </Text>
      ) : (
        GRUPOS.map((g) => {
          const itens = visiveis.filter((i) =>
            g.severidades.includes(i.severity)
          );
          if (itens.length === 0) return null;
          return (
            <Grupo
              key={g.id}
              id={g.id}
              titulo={g.titulo}
              itens={itens}
              fechado={g.fechado}
              abrirEm={pedido?.id === g.id ? pedido.vez : undefined}
            />
          );
        })
      )}
    </Stack>
  );
}

function Grupo({
  id: grupo,
  titulo,
  itens,
  fechado = false,
  abrirEm,
}: {
  id: string;
  titulo: string;
  itens: ApiInsight[];
  fechado?: boolean;
  /** Muda quando um número pede este grupo aberto. */
  abrirEm?: number;
}) {
  const [aberto, setAberto] = useState(!fechado);
  const id = `ins-${grupo}`;
  useEffect(() => {
    if (abrirEm) setAberto(true);
  }, [abrirEm]);

  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => setAberto((a) => !a)}
        className="flex items-center gap-2 self-start text-left"
      >
        <Text papel="secao" as="h2" id={id}>
          {titulo}
        </Text>
        <span className="t-dado text-sm text-texto-fraco">{itens.length}</span>
        <Icon
          de={PiCaretDown}
          tamanho="pp"
          className={cx(
            'text-texto-fraco transition-transform duration-[var(--t-resposta)] ease-saida',
            !aberto && '-rotate-90'
          )}
        />
      </button>
      {aberto && (
        <ul className="sup-1 flex flex-col !p-0">
          {itens.map((i) => (
            <Leitura key={`${i.code}-${i.title}`} insight={i} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Leitura({ insight: i }: { insight: ApiInsight }) {
  const [casos, setCasos] = useState(false);
  const evidencias = (i.evidence ?? []) as Record<string, unknown>[];
  const semBase = i.severity === 'insufficient_data';

  return (
    <li className="flex flex-col gap-3 border-t border-linha px-5 py-5 first:border-0 md:px-6">
      <div className="flex gap-4">
        <span className="pt-0.5">
          <Marcador s={i.severity} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <Text papel="corpo" as="h3" className="font-medium">
              {i.title}
            </Text>
            {!semBase && (
              <span className="t-dado text-[1.375rem] leading-none text-texto">
                {medida(i)}
              </span>
            )}
          </div>
          <Text papel="rotulo" tom="suave" as="p" className="medida-texto">
            {i.detail}
          </Text>
          {i.action && (
            <p className="t-rotulo flex items-start gap-2 text-texto">
              <Icon
                de={PiArrowRight}
                tamanho="pp"
                className="mt-1 text-ouro-texto"
              />
              <span className="medida-texto">{i.action}</span>
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
            <span className="t-legenda">
              Medido sobre {numero(i.measurement.sampleSize)} registro
              {i.measurement.sampleSize === 1 ? '' : 's'}
              {' · '}mínimo de {numero(i.minimumSample)}
            </span>
            {evidencias.length > 0 && (
              <button
                type="button"
                aria-expanded={casos}
                onClick={() => setCasos((c) => !c)}
                className="t-legenda inline-flex items-center gap-1 text-ouro-texto hover:underline underline-offset-4"
              >
                {casos
                  ? 'Esconder'
                  : `Ver ${evidencias.length === 1 ? 'o caso' : `os ${evidencias.length} casos`}`}
                <Icon
                  de={PiCaretDown}
                  tamanho="pp"
                  className={cx(!casos && '-rotate-90')}
                />
              </button>
            )}
          </div>
        </div>
      </div>
      {casos && <Casos linhas={evidencias} />}
    </li>
  );
}

/**
 * Os casos por trás do número, numa tabela montada das chaves que vierem.
 * Cada insight manda o formato que faz sentido para ele (obras, contas,
 * assinaturas); a tela não precisa conhecer cada um.
 */
function Casos({ linhas }: { linhas: Record<string, unknown>[] }) {
  const colunas = [...new Set(linhas.flatMap((l) => Object.keys(l ?? {})))]
    .filter((c) => !/^(_id|id)$/.test(c))
    .slice(0, 6);

  const valor = (v: unknown): string => {
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'number') return numero(v);
    if (typeof v === 'boolean') return v ? 'sim' : 'não';
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
      return new Date(v).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    if (typeof v === 'object') {
      const o = v as Record<string, unknown>;
      return String(o.title ?? o.name ?? o.nome ?? JSON.stringify(o));
    }
    return String(v);
  };

  if (colunas.length === 0) return null;

  return (
    <div className="relative ml-10 overflow-x-auto rounded-controle bg-sup-2">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="t-legenda">
            {colunas.map((c) => (
              <th key={c} scope="col" className="px-4 py-2 font-normal">
                {nomeDoCampo(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l, n) => (
            <tr key={n} className="border-t border-linha">
              {colunas.map((c) => (
                <td
                  key={c}
                  className={cx(
                    'px-4 py-2',
                    typeof l?.[c] === 'number' && 't-dado'
                  )}
                >
                  {valor(l?.[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
