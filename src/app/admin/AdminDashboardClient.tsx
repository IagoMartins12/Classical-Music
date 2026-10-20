'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PiCheck, PiWarning } from 'react-icons/pi';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { Cabecalho, Secao } from '@/app/components/Admin/painel/Cabecalho';
import { Selecao } from '@/app/components/ui/Selecao';
import {
  AREAS_DE_ACAO,
  NOME_ENTIDADE,
} from '@/app/components/Admin/painel/acoes';
import { Avatar } from '@/app/components/Admin/painel/Avatar';
import { Segmentos } from '@/app/components/Admin/painel/Controles';
import { Colunas, colunasPorDia } from '@/app/components/Admin/painel/Graficos';
import { useNavegar } from '@/app/components/Admin/painel/Navegador';
import { Numeros } from '@/app/components/Admin/painel/Numeros';
import {
  EventoDaTrilha,
  FraseDaTrilha,
} from '@/app/components/Admin/painel/Trilha';
import {
  bytes,
  moeda,
  numero,
  porcento,
  relativo,
  variacao,
} from '@/app/components/Admin/painel/formatos';
import {
  useAtividade,
  useAuditoria,
  usePanorama,
  usePanoramaAssinaturas,
  usePendencias,
  useUsuarios,
} from '@/app/hooks/admin/usePainel';
import { useEstatisticasEnvios } from '@/app/hooks/admin/useCatalogo';
import {
  temErro,
  type Pendencias,
  type RegistroAuditoria,
  type SerieDeAtividade,
} from '@/app/requests/admin/painel';

/**
 * O painel: uma mesa de trabalho.
 *
 * Em cima, os números da base numa faixa só. Logo abaixo, o que pede alguém
 * hoje — montado das pendências da API, na ordem de urgência — e, ao lado,
 * se a casa está de pé. Embaixo, o movimento do período escolhido (de hoje
 * a um ano, lembrado neste navegador) comparado com o período anterior, o
 * ritmo de cada série, o que aconteceu no painel, as contas novas, quem mais
 * contribuiu e o que mais foi mexido — tudo abre: número leva à tela ou ao
 * gráfico, pessoa e registro abrem a ficha, ação abre o detalhe.
 *
 * Substitui a tela antiga, que abria com um ícone gigante e um título em
 * degradê, mostrava "Sistema Online" com um ponto pulsando sem medir nada, e
 * tinha dois números inventados (`12.8%` e `3.1%` escritos no código).
 */

interface Pendente {
  id: string;
  urgente: boolean;
  titulo: string;
  detalhe: string;
  href: string;
  acao: string;
}

const plural = (n: number, um: string, varios: string) =>
  `${numero(n)} ${n === 1 ? um : varios}`;

function montarPendentes(p: Pendencias): Pendente[] {
  const itens: Pendente[] = [];

  if (!temErro(p.filas)) {
    for (const f of p.filas.paradas) {
      itens.push({
        id: `parada-${f.fila}`,
        urgente: true,
        titulo: `Fila "${f.fila}" parada, sem worker`,
        detalhe: `${plural(f.esperando, 'trabalho esperando', 'trabalhos esperando')} — nada está sendo processado`,
        href: '/admin/system',
        acao: 'Ver saúde',
      });
    }
    if (p.filas.falhas24h > 0) {
      const ultima = p.filas.porFila[0]?.ultima;
      itens.push({
        id: 'falhas',
        urgente: true,
        titulo: `${plural(p.filas.falhas24h, 'falha', 'falhas')} nas filas em 24 h`,
        detalhe: ultima
          ? `${p.filas.porFila[0].fila}: ${ultima.motivo ?? ultima.job} · ${relativo(ultima.em)}`
          : p.filas.porFila.map((f) => f.fila).join(', '),
        href: '/admin/system',
        acao: 'Ver falhas',
      });
    }
  }

  if (!temErro(p.denuncias) && p.denuncias.abertas > 0) {
    const d = p.denuncias;
    itens.push({
      id: 'denuncias',
      urgente: d.atrasadas > 0,
      titulo: plural(d.abertas, 'denúncia aberta', 'denúncias abertas'),
      detalhe:
        d.atrasadas > 0
          ? `${plural(d.atrasadas, 'passou', 'passaram')} do prazo · a mais antiga chegou ${relativo(d.maisAntigaEm)}`
          : `A mais antiga chegou ${relativo(d.maisAntigaEm)}${d.urgentes ? ` · ${plural(d.urgentes, 'de prioridade alta', 'de prioridade alta')}` : ''}`,
      href: '/admin/moderation',
      acao: 'Abrir denúncias',
    });
  }

  if (!temErro(p.backup) && p.backup.velho) {
    itens.push({
      id: 'backup',
      urgente: true,
      titulo: p.backup.verificadoEm
        ? `Último backup verificado ${relativo(p.backup.verificadoEm)}`
        : 'Nenhum backup verificado ainda',
      detalhe: p.backup.ultimo?.error
        ? `A última execução falhou: ${p.backup.ultimo.error}`
        : 'O backup roda de madrugada; mais de 48 h sem verificação pede atenção.',
      href: '/admin/backup',
      acao: 'Ver backup',
    });
  }

  if (!temErro(p.blog)) {
    const esperando = p.blog.comentarios + p.blog.sinalizados;
    if (esperando > 0) {
      const topo = p.blog.artigoComMaisPendentes;
      itens.push({
        id: 'comentarios',
        urgente: false,
        titulo: `${plural(esperando, 'comentário', 'comentários')} do blog para decidir`,
        detalhe: topo
          ? `${numero(topo.pendentes)} em “${topo.titulo}”${p.blog.sinalizados ? ` · ${numero(p.blog.sinalizados)} sinalizados` : ''}`
          : `${numero(p.blog.sinalizados)} sinalizados por leitores`,
        href: '/blog/admin/moderation',
        acao: 'Ver comentários',
      });
    }
    if (p.blog.emRevisao > 0) {
      itens.push({
        id: 'revisao',
        urgente: false,
        titulo: `${plural(p.blog.emRevisao, 'artigo', 'artigos')} em revisão`,
        detalhe: 'Esperando aprovação para publicar',
        href: '/blog/admin/articles',
        acao: 'Ver artigos',
      });
    }
  }

  if (!temErro(p.cobranca) && p.cobranca.emAtraso > 0) {
    itens.push({
      id: 'atraso',
      urgente: false,
      titulo: `${plural(p.cobranca.emAtraso, 'assinatura', 'assinaturas')} com pagamento em atraso`,
      detalhe: 'O Stripe ainda está tentando cobrar',
      href: '/admin/plans/subscribers?estado=atraso',
      acao: 'Ver assinaturas',
    });
  }

  if (!temErro(p.newsletter) && p.newsletter.falhadas7Dias > 0) {
    itens.push({
      id: 'campanhas',
      urgente: true,
      titulo: `${plural(p.newsletter.falhadas7Dias, 'campanha falhou', 'campanhas falharam')} nesta semana`,
      detalhe: 'O envio parou antes de chegar a todos',
      href: '/admin/newsletter/campaigns',
      acao: 'Ver campanhas',
    });
  }

  const areas: [keyof Pendencias, string][] = [
    ['denuncias', 'denúncias'],
    ['blog', 'blog'],
    ['filas', 'filas'],
    ['backup', 'backup'],
    ['cobranca', 'cobrança'],
    ['newsletter', 'newsletter'],
  ];
  for (const [chave, nome] of areas) {
    if (temErro(p[chave] as object)) {
      itens.push({
        id: `erro-${chave}`,
        urgente: false,
        titulo: `Não foi possível ler ${nome} agora`,
        detalhe:
          'O resto do painel segue funcionando; tente atualizar em instantes.',
        href: '/admin/system',
        acao: 'Ver saúde',
      });
    }
  }

  return itens.sort((a, b) => Number(b.urgente) - Number(a.urgente));
}

type Serie = SerieDeAtividade;
const SERIES: { valor: Serie; rotulo: string; minusculo: string }[] = [
  { valor: 'cadastros', rotulo: 'Cadastros', minusculo: 'cadastros' },
  { valor: 'anotacoes', rotulo: 'Anotações', minusculo: 'anotações' },
  { valor: 'envios', rotulo: 'Envios', minusculo: 'envios ao catálogo' },
  { valor: 'favoritos', rotulo: 'Favoritos', minusculo: 'obras favoritadas' },
  {
    valor: 'querem',
    rotulo: 'Querem aprender',
    minusculo: 'obras marcadas para aprender',
  },
  { valor: 'aprendidas', rotulo: 'Aprendidas', minusculo: 'obras aprendidas' },
  {
    valor: 'comentarios',
    rotulo: 'Comentários',
    minusculo: 'comentários no blog',
  },
  { valor: 'partituras', rotulo: 'Partituras', minusculo: 'partituras novas' },
];

const PERIODOS_DO_PAINEL = [
  { valor: 1, rotulo: 'Hoje', nome: 'hoje', comparado: 'ontem' },
  {
    valor: 7,
    rotulo: '7 dias',
    nome: 'em 7 dias',
    comparado: 'os 7 anteriores',
  },
  {
    valor: 30,
    rotulo: '30 dias',
    nome: 'em 30 dias',
    comparado: 'os 30 anteriores',
  },
  {
    valor: 90,
    rotulo: '3 meses',
    nome: 'em 3 meses',
    comparado: 'os 3 meses anteriores',
  },
  {
    valor: 180,
    rotulo: '6 meses',
    nome: 'em 6 meses',
    comparado: 'os 6 meses anteriores',
  },
  {
    valor: 365,
    rotulo: '1 ano',
    nome: 'em 1 ano',
    comparado: 'o ano anterior',
  },
] as const;
type DiasDoPainel = (typeof PERIODOS_DO_PAINEL)[number]['valor'];

const CHAVE_DO_PERIODO = 'painel:inicio-periodo';

/** Diferença sobre a janela anterior, em texto curto. */
function comparacao(atual: number, antes: number, contra: string) {
  if (atual === antes) return 'igual ao período anterior';
  const v = variacao(atual, antes);
  // Sem base para porcentagem (antes era zero): diz de onde saiu.
  if (v === null) {
    return contra === 'ontem'
      ? 'contra nenhum ontem'
      : `contra nenhum n${contra}`;
  }
  return `${v >= 0 ? '+' : ''}${porcento(v, 0)} sobre ${contra}`;
}

const ABRIR_REGISTRO: Record<
  string,
  (n: ReturnType<typeof useNavegar>, id: string) => void
> = {
  composer: (n, id) => n.compositor(id),
  work: (n, id) => n.obra(id),
  score: (n, id) => n.partitura(id),
  workScore: (n, id) => n.partitura(id),
};

export default function AdminDashboardClient() {
  const router = useRouter();
  const navegar = useNavegar();
  const [dias, setDiasEstado] = useState<DiasDoPainel>(30);
  useEffect(() => {
    try {
      const v = Number(localStorage.getItem(CHAVE_DO_PERIODO));
      if (PERIODOS_DO_PAINEL.some((p) => p.valor === v)) {
        setDiasEstado(v as DiasDoPainel);
      }
    } catch {
      // Sem armazenamento: fica 30 dias.
    }
  }, []);
  const setDias = (v: DiasDoPainel) => {
    setDiasEstado(v);
    try {
      localStorage.setItem(CHAVE_DO_PERIODO, String(v));
    } catch {
      // idem
    }
  };
  const periodo = PERIODOS_DO_PAINEL.find((p) => p.valor === dias)!;
  // Meia-noite do primeiro dia; fixa enquanto o período não muda (a data
  // na chave da consulta não pode andar a cada render).
  const desde = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (dias - 1));
    return d.toISOString();
  }, [dias]);

  const pendencias = usePendencias();
  const panorama = usePanorama();
  const receita = usePanoramaAssinaturas(dias);
  const atividade = useAtividade(dias);
  const envios = useEstatisticasEnvios(
    useMemo(() => ({ de: desde, ate: null }), [desde])
  );
  const [area, setArea] = useState('');
  const trilha = useAuditoria(
    { actionPrefix: area || undefined, from: desde },
    8
  );
  const novos = useUsuarios({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    createdFrom: desde,
  });
  const [serie, setSerie] = useState<Serie>('cadastros');
  const [evento, setEvento] = useState<RegistroAuditoria | null>(null);

  const o = panorama.data;
  const r = receita.data;
  const at = atividade.data;
  const e = envios.data;
  const pendentes = pendencias.data ? montarPendentes(pendencias.data) : [];
  const deltaReceita = r
    ? variacao(r.receita.periodo, r.receita.periodoAnterior)
    : null;
  const nomeDaSerie = SERIES.find((x) => x.valor === serie)!;

  const verSerie = (s: Serie) => {
    setSerie(s);
    document
      .getElementById('painel-ritmo')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <Stack gap={8}>
      <Cabecalho
        titulo="Painel"
        atualizadoEm={pendencias.updatedAt}
        acoes={
          <>
            <Segmentos
              rotulo="Período do painel"
              className="max-lg:hidden"
              opcoes={PERIODOS_DO_PAINEL.map((p) => ({
                valor: p.valor,
                rotulo: p.rotulo,
              }))}
              valor={dias}
              aoMudar={setDias}
            />
            <label className="w-40 lg:hidden">
              <span className="sr-only">Período do painel</span>
              <Selecao
                valor={String(dias)}
                aoMudar={(v) => setDias(Number(v) as DiasDoPainel)}
                opcoes={PERIODOS_DO_PAINEL.map((p) => ({
                  value: String(p.valor),
                  label: p.rotulo,
                }))}
              />
            </label>
          </>
        }
      />

      <Numeros
        carregando={panorama.loading || receita.loading}
        itens={[
          {
            id: 'usuarios',
            rotulo: 'Usuários',
            valor: numero(o?.usuarios.total),
            nota: at
              ? `+${numero(at.totais.cadastros)} ${periodo.nome}`
              : undefined,
            aoClicar: () => router.push('/admin/users'),
          },
          {
            id: 'ativos',
            rotulo: 'Ativos em 30 dias',
            valor: numero(o?.usuarios.ativosUltimos30Dias),
            nota: o
              ? `${porcento(o.usuarios.total ? (o.usuarios.ativosUltimos30Dias / o.usuarios.total) * 100 : null, 0)} da base`
              : undefined,
            aoClicar: () => router.push('/admin/users?atividade=30d'),
          },
          {
            id: 'assinantes',
            rotulo: 'Assinantes pagos',
            valor: numero(r?.assinantes.vivas),
            nota: r ? `${moeda(r.recorrente.mensal, 0)} por mês` : undefined,
            aoClicar: () => router.push('/admin/plans/subscribers'),
          },
          {
            id: 'receita',
            rotulo: `Receita ${periodo.nome}`,
            valor: moeda(r?.receita.periodo, 0),
            nota:
              deltaReceita === null
                ? 'sem período anterior para comparar'
                : `${deltaReceita >= 0 ? '+' : ''}${porcento(deltaReceita)} sobre ${periodo.comparado}`,
            aoClicar: () => router.push('/admin/plans/subscribers'),
          },
          {
            id: 'obras',
            rotulo: 'Obras',
            valor: numero(o?.catalogo.obras),
            nota: o
              ? `${numero(o.catalogo.obrasVerificadas)} verificadas`
              : undefined,
            aoClicar: () => router.push('/admin/works'),
          },
          {
            id: 'anotacoes',
            rotulo: 'Anotações',
            valor: numero(o?.biblioteca.anotacoes),
            nota: at
              ? `+${numero(at.totais.anotacoes)} ${periodo.nome}`
              : undefined,
            aoClicar: () => verSerie('anotacoes'),
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Secao titulo="Pede atenção" id="painel-atencao">
          {pendencias.loading ? (
            <Row.Lista>
              <Row.Skeleton repetir={3} />
            </Row.Lista>
          ) : pendencias.error ? (
            <Text papel="rotulo" tom="erro" as="p">
              Não foi possível ler as pendências: {pendencias.error}
            </Text>
          ) : pendentes.length === 0 ? (
            <div className="flex items-start gap-3 rounded-card bg-sup-2 p-5">
              <Icon
                de={PiCheck}
                tamanho="m"
                className="mt-0.5 text-texto-fraco"
              />
              <Stack gap={1}>
                <Text papel="corpo" as="p">
                  Nada esperando por alguém.
                </Text>
                <Text papel="rotulo" tom="suave" as="p">
                  Denúncias, comentários, filas, backup e cobrança estão em dia.
                </Text>
              </Stack>
            </div>
          ) : (
            <Row.Lista>
              {pendentes.map((p) => (
                <Row
                  key={p.id}
                  className="min-w-0"
                  antes={
                    <span className="grid h-8 w-8 shrink-0 place-items-center">
                      {p.urgente ? (
                        <Icon
                          de={PiWarning}
                          tamanho="m"
                          className="text-atencao"
                          rotulo="Urgente"
                        />
                      ) : (
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-texto-fraco"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  }
                  titulo={p.titulo}
                  detalhe={p.detalhe}
                  depois={
                    <Link
                      href={p.href}
                      className={cx(classesDeBotao('texto', 'p'), 'shrink-0')}
                    >
                      {p.acao}
                    </Link>
                  }
                />
              ))}
            </Row.Lista>
          )}
        </Secao>

        <Secao
          titulo="Sistema"
          id="painel-sistema"
          atalho={
            <Link href="/admin/system" className={classesDeBotao('texto', 'p')}>
              Ver saúde
            </Link>
          }
        >
          <Sistema p={pendencias.data} carregando={pendencias.loading} />
        </Secao>
      </div>

      <Secao
        titulo={`O movimento ${periodo.nome}`}
        id="painel-movimento"
        detalhe={`comparado com ${periodo.comparado}`}
      >
        <Numeros
          carregando={atividade.loading}
          colunas={4}
          itens={SERIES.map((x) => ({
            id: x.valor,
            rotulo: x.rotulo,
            valor: numero(at?.totais[x.valor]),
            nota: at
              ? comparacao(
                  at.totais[x.valor],
                  at.totaisAnteriores[x.valor],
                  periodo.comparado
                )
              : undefined,
            aoClicar: () => verSerie(x.valor),
          }))}
        />
      </Secao>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section
          aria-labelledby="painel-ritmo"
          className="sup-1 flex min-w-0 flex-col gap-4 self-start p-5 md:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Stack gap={1}>
              <Text papel="secao" as="h2" id="painel-ritmo">
                {nomeDaSerie.rotulo} {periodo.nome}
              </Text>
              <Text papel="legenda" as="p">
                {at
                  ? `${numero(at.totais[serie])} ${nomeDaSerie.minusculo}${dias > 90 ? ', por semana' : dias > 1 ? ', por dia' : ''}`
                  : ' '}
              </Text>
            </Stack>
            <label className="w-44">
              <span className="sr-only">Série do gráfico</span>
              <Selecao
                valor={serie}
                aoMudar={(v) => setSerie(v as Serie)}
                opcoes={SERIES.map((x) => ({
                  value: x.valor,
                  label: x.rotulo,
                }))}
              />
            </label>
          </div>
          {atividade.loading ? (
            <Skeleton forma="bloco" className="h-46 w-full" />
          ) : at ? (
            dias === 1 ? (
              <Text papel="rotulo" tom="suave" as="p">
                Hoje, até agora: {numero(at.totais[serie])}{' '}
                {nomeDaSerie.minusculo}. Escolha 7 dias ou mais para ver o
                ritmo.
              </Text>
            ) : (
              <Colunas
                titulo={`${nomeDaSerie.rotulo} ${periodo.nome}`}
                dados={colunasPorDia(at.serie, (d) => d[serie])}
                linhaMedia
              />
            )
          ) : (
            <Text papel="rotulo" tom="erro" as="p">
              {atividade.error ?? 'Sem dados.'}
            </Text>
          )}
        </section>

        <Secao
          titulo="O que aconteceu"
          id="painel-trilha"
          atalho={
            <Link href="/admin/logs" className={classesDeBotao('texto', 'p')}>
              Auditoria completa
            </Link>
          }
        >
          <label className="w-full sm:w-56">
            <span className="sr-only">Tipo de ação</span>
            <Selecao
              valor={area}
              aoMudar={setArea}
              opcoes={[
                { value: '', label: 'Tudo' },
                ...AREAS_DE_ACAO.map((x) => ({
                  value: x.prefixo,
                  label: x.rotulo,
                })),
              ]}
            />
          </label>
          {trilha.loading ? (
            <Stack gap={3}>
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="w-[85%]" />
              ))}
            </Stack>
          ) : trilha.items.length === 0 ? (
            <Text papel="rotulo" tom="suave" as="p">
              Nenhuma ação registrada {periodo.nome}
              {area ? ' nessa área' : ''}.
            </Text>
          ) : (
            <ul className="flex flex-col">
              {trilha.items.slice(0, 8).map((x) => (
                <li key={x.id} className="border-b border-linha last:border-0">
                  <button
                    type="button"
                    onClick={() => setEvento(x)}
                    className="-mx-2 flex w-[calc(100%+1rem)] gap-3 rounded-controle px-2 py-2.5 text-left transition-colors hover:bg-[var(--interactive-hover)]"
                  >
                    <FraseDaTrilha registro={x} className="min-w-0 flex-1" />
                    <span className="t-legenda t-dado shrink-0 pt-0.5">
                      {relativo(x.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Secao>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Secao
          titulo="Contas novas"
          id="painel-novos"
          detalhe={novos.total !== null ? numero(novos.total) : undefined}
        >
          {novos.loading ? (
            <Row.Skeleton repetir={4} />
          ) : novos.items.length === 0 ? (
            <Text papel="rotulo" tom="suave" as="p">
              Ninguém se cadastrou {periodo.nome}.
            </Text>
          ) : (
            <ul className="flex flex-col">
              {novos.items.slice(0, 6).map((u) => (
                <li key={u.id} className="border-b border-linha last:border-0">
                  <button
                    type="button"
                    onClick={() => navegar.usuario(u.id)}
                    className="-mx-2 flex min-h-11 w-[calc(100%+1rem)] items-center gap-3 rounded-controle px-2 py-2 text-left transition-colors hover:bg-[var(--interactive-hover)]"
                  >
                    <Avatar nome={u.name} imagem={u.image} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[0.9375rem] text-texto">
                        {u.name}
                      </span>
                      <span className="t-legenda truncate">{u.email}</span>
                    </span>
                    <span className="t-legenda t-dado shrink-0">
                      {relativo(u.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Secao>

        <Secao
          titulo="Quem mais contribuiu"
          id="painel-contribuintes"
          detalhe={e ? plural(e.total, 'envio', 'envios') : undefined}
        >
          {envios.loading ? (
            <Row.Skeleton repetir={4} />
          ) : !e || e.topContribuintes.length === 0 ? (
            <Text papel="rotulo" tom="suave" as="p">
              Nenhum envio ao catálogo {periodo.nome}.
            </Text>
          ) : (
            <ul className="flex flex-col">
              {e.topContribuintes.slice(0, 6).map((c) => (
                <li
                  key={c.userId}
                  className="border-b border-linha last:border-0"
                >
                  <button
                    type="button"
                    onClick={() => navegar.usuario(c.userId)}
                    className="-mx-2 flex min-h-11 w-[calc(100%+1rem)] items-center gap-3 rounded-controle px-2 py-2 text-left transition-colors hover:bg-[var(--interactive-hover)]"
                  >
                    <Avatar nome={c.name ?? '?'} imagem={c.image} />
                    <span className="min-w-0 flex-1 truncate text-[0.9375rem] text-texto">
                      {c.name ?? 'Conta sem nome'}
                    </span>
                    <span className="t-legenda t-dado shrink-0">
                      {numero(c.contributions)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Secao>

        <Secao titulo="Mais mexidos no catálogo" id="painel-editados">
          {envios.loading ? (
            <Row.Skeleton repetir={4} />
          ) : !e || e.maisEditados.length === 0 ? (
            <Text papel="rotulo" tom="suave" as="p">
              Nada foi editado {periodo.nome}.
            </Text>
          ) : (
            <ul className="flex flex-col">
              {e.maisEditados.slice(0, 6).map((m) => {
                const abrir = ABRIR_REGISTRO[m.entityType];
                return (
                  <li
                    key={`${m.entityType}-${m.entityId}`}
                    className="border-b border-linha last:border-0"
                  >
                    <button
                      type="button"
                      disabled={!abrir}
                      onClick={() => abrir?.(navegar, m.entityId)}
                      className="-mx-2 flex min-h-11 w-[calc(100%+1rem)] items-center gap-3 rounded-controle px-2 py-2 text-left transition-colors enabled:hover:bg-[var(--interactive-hover)]"
                    >
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[0.9375rem] text-texto">
                          {m.nome ?? 'Sem nome'}
                        </span>
                        <span className="t-legenda">
                          {NOME_ENTIDADE[m.entityType] ?? m.entityType}
                        </span>
                      </span>
                      <span className="t-legenda t-dado shrink-0">
                        {plural(m.edicoes, 'edição', 'edições')}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Secao>
      </div>

      <EventoDaTrilha registro={evento} aoFechar={() => setEvento(null)} />
    </Stack>
  );
}

function Sistema({
  p,
  carregando,
}: {
  p: Pendencias | undefined;
  carregando: boolean;
}) {
  if (carregando || !p) {
    return (
      <Row.Lista>
        <Row.Skeleton repetir={4} />
      </Row.Lista>
    );
  }

  const linhas: {
    id: string;
    ok: boolean | null;
    titulo: string;
    detalhe: string;
    valor: string;
  }[] = [];

  if (temErro(p.backup)) {
    linhas.push({
      id: 'backup',
      ok: null,
      titulo: 'Backup',
      detalhe: p.backup.erro,
      valor: '—',
    });
  } else {
    const u = p.backup.ultimo;
    linhas.push({
      id: 'backup',
      ok: !p.backup.velho,
      titulo: 'Backup',
      detalhe: u
        ? `${u.status === 'failed' ? 'última execução falhou' : 'verificado'} · ${bytes(u.sizeBytes)}`
        : 'nenhuma execução ainda',
      valor: p.backup.verificadoEm ? relativo(p.backup.verificadoEm) : '—',
    });
  }

  if (temErro(p.filas)) {
    linhas.push({
      id: 'filas',
      ok: null,
      titulo: 'Filas',
      detalhe: p.filas.erro,
      valor: '—',
    });
  } else {
    const problema = p.filas.falhas24h > 0 || p.filas.paradas.length > 0;
    linhas.push({
      id: 'filas',
      ok: !problema,
      titulo: 'Filas',
      detalhe: p.filas.paradas.length
        ? `${p.filas.paradas.map((f) => f.fila).join(', ')} sem worker`
        : p.filas.pausadas.length
          ? `pausadas: ${p.filas.pausadas.join(', ')}`
          : 'trabalhos em segundo plano',
      valor: p.filas.falhas24h ? `${p.filas.falhas24h} falhas` : 'sem falhas',
    });
  }

  if (!temErro(p.newsletter)) {
    const n = p.newsletter.proxima;
    linhas.push({
      id: 'newsletter',
      ok: true,
      titulo: 'Próxima campanha',
      detalhe: n
        ? `${n.name} · ${numero(n.totalSubscribers)} destinatários`
        : 'nenhuma agendada',
      valor: n ? relativo(n.scheduledAt) : '—',
    });
  }

  if (!temErro(p.cobranca)) {
    linhas.push({
      id: 'cobranca',
      ok: p.cobranca.emAtraso === 0,
      titulo: 'Cobrança',
      detalhe: p.cobranca.testesVencendo3Dias
        ? `${numero(p.cobranca.testesVencendo3Dias)} testes terminam em 3 dias`
        : 'nenhum teste terminando',
      valor: p.cobranca.emAtraso
        ? `${p.cobranca.emAtraso} em atraso`
        : 'em dia',
    });
  }

  return (
    <Row.Lista>
      {linhas.map((l) => (
        <Row
          key={l.id}
          antes={
            <span className="grid h-8 w-8 place-items-center">
              {l.ok === false ? (
                <Icon
                  de={PiWarning}
                  rotulo="Pede atenção"
                  className="text-atencao"
                />
              ) : (
                <Icon
                  de={PiCheck}
                  rotulo={l.ok ? 'Normal' : 'Sem leitura'}
                  className="text-texto-fraco"
                />
              )}
            </span>
          }
          titulo={l.titulo}
          detalhe={l.detalhe}
          valor={
            <span className={l.ok === false ? 'text-atencao' : undefined}>
              {l.valor}
            </span>
          }
        />
      ))}
    </Row.Lista>
  );
}
