'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiDownloadSimple,
  PiFileCsv,
  PiFileXls,
  PiTrash,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { Cabecalho, Secao } from '@/app/components/Admin/painel/Cabecalho';
import { Segmentos } from '@/app/components/Admin/painel/Controles';
import { dataHora } from '@/app/components/Admin/painel/formatos';
import {
  adminKeys,
  useAdminMutation,
  useAdminQuery,
} from '@/app/hooks/admin/query';
import {
  deleteReportRequest,
  downloadReportRequest,
  generateReportRequest,
  listReports,
  type ApiReportResult,
} from '@/app/requests/admin/operations';

/**
 * Relatórios: planilhas para levar a quem não abre o painel.
 *
 * Nove relatórios, cada um em Excel (uma aba de resumo e uma por tabela) ou
 * CSV, com a acentuação que o Excel abre direito.
 * Nada vai para disco: o registro guarda os números do momento e a
 * planilha é montada no download. A tela antiga tinha "Ctrl+P → Salvar como
 * PDF" e oito cards de números repetidos do painel; ficou a escolha do que
 * gerar e a lista do que foi gerado.
 */

const TIPOS: { valor: string; rotulo: string; conteudo: string }[] = [
  {
    valor: 'users-overview',
    rotulo: 'Usuários',
    conteudo:
      'Cadastros e ativos no período, os novos usuários, perfis e quem mais contribui.',
  },
  {
    valor: 'content-analysis',
    rotulo: 'Conteúdo',
    conteudo:
      'Catálogo, obras e compositores novos, os mais favoritados e as épocas.',
  },
  {
    valor: 'engagement-metrics',
    rotulo: 'Engajamento',
    conteudo:
      'Anotações públicas, por categoria, e usuários ativos no período.',
  },
  {
    valor: 'revenue-subscriptions',
    rotulo: 'Receita e assinaturas',
    conteudo:
      'MRR, receita bruta e líquida, taxa do Stripe, reembolsos, testes, cancelamentos, atrasos e cupons.',
  },
  {
    valor: 'acquisition-retention',
    rotulo: 'Aquisição e retenção',
    conteudo:
      'Cadastros por dia, ativos em 1, 7 e 30 dias, perfis, planos e retenção por semana de cadastro.',
  },
  {
    valor: 'catalog-usage',
    rotulo: 'Qualidade e uso do acervo',
    conteudo:
      'Preenchimento do cadastro, épocas, nacionalidades, partituras sem edição e as mais baixadas.',
  },
  {
    valor: 'teaching-portal',
    rotulo: 'Professores e alunos',
    conteudo:
      'Professores por plano e limite de alunos, aulas, comparecimento e conclusão das tarefas.',
  },
  {
    valor: 'learning-community',
    rotulo: 'Aprendizado e comunidade',
    conteudo:
      'Quero aprender e já aprendi, obras mais desejadas, conquistas e contribuições.',
  },
  {
    valor: 'newsletter-email',
    rotulo: 'Newsletter e e-mail',
    conteudo:
      'Inscritos, descadastros, campanhas com abertura e clique, e eventos de e-mail.',
  },
];

const PERIODOS = [
  { valor: '7d', rotulo: '7 dias' },
  { valor: '30d', rotulo: '30 dias' },
  { valor: '90d', rotulo: '90 dias' },
  { valor: '180d', rotulo: '6 meses' },
  { valor: '1y', rotulo: '1 ano' },
  { valor: 'all', rotulo: 'Tudo' },
];

const TOCA = ['relatorios', 'auditoria'];

export default function Relatorios() {
  const [tipo, setTipo] = useState('users-overview');
  const [periodo, setPeriodo] = useState('30d');
  const [apagando, setApagando] = useState<ApiReportResult | null>(null);
  const [baixando, setBaixando] = useState<string | null>(null);

  const lista = useAdminQuery(
    adminKeys.list('relatorios', 'todos'),
    listReports
  );
  const gerar = useAdminMutation(
    (t: string, p: string) => generateReportRequest(t, p),
    TOCA
  );
  const apagar = useAdminMutation(
    (id: string) => deleteReportRequest(id),
    TOCA
  );

  const relatorios = lista.data?.results ?? [];

  const baixar = async (r: ApiReportResult, formato: 'csv' | 'xlsx') => {
    setBaixando(`${r.id}:${formato}`);
    try {
      await downloadReportRequest(r, formato);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível baixar.');
    } finally {
      setBaixando(null);
    }
  };

  return (
    <Stack gap={8}>
      <Cabecalho
        titulo="Relatórios"
        descricao="Planilhas (Excel ou CSV) para levar a quem não abre o painel"
      />

      <section
        aria-labelledby="rel-gerar"
        className="sup-1 flex flex-col gap-5 p-5 md:p-6"
      >
        <Text papel="secao" as="h2" id="rel-gerar">
          Gerar
        </Text>
        <div
          role="radiogroup"
          aria-label="Tipo de relatório"
          className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3"
        >
          {TIPOS.map((t) => (
            <button
              key={t.valor}
              type="button"
              role="radio"
              aria-checked={tipo === t.valor}
              onClick={() => setTipo(t.valor)}
              className={cx(
                'flex flex-col gap-1 rounded-controle border px-4 py-3 text-left transition-colors duration-[var(--t-toque)] ease-saida',
                tipo === t.valor
                  ? 'border-ouro/50 tint-ouro'
                  : 'border-linha hover:border-linha-forte'
              )}
            >
              <span
                className={cx(
                  'text-[0.9375rem] font-medium',
                  tipo === t.valor ? 'text-ouro-na-tinta' : 'text-texto'
                )}
              >
                {t.rotulo}
              </span>
              <span className="t-legenda">{t.conteudo}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Segmentos
            rotulo="Período do relatório"
            opcoes={PERIODOS}
            valor={periodo}
            aoMudar={setPeriodo}
          />
          <Button
            tamanho="p"
            variante="primario"
            icone={PiFileXls}
            carregando={gerar.isPending}
            onClick={async () => {
              try {
                await gerar.mutateAsync([tipo, periodo]);
                toast.success('Relatório gerado. Já dá para baixar.');
              } catch (e) {
                toast.error(
                  e instanceof Error ? e.message : 'Não foi possível gerar.'
                );
              }
            }}
            className="ml-auto"
          >
            Gerar relatório
          </Button>
        </div>
      </section>

      <Secao
        titulo="Gerados"
        id="rel-lista"
        detalhe="cada pessoa apaga só os seus"
      >
        {lista.loading ? (
          <Row.Lista>
            <Row.Skeleton repetir={3} />
          </Row.Lista>
        ) : lista.error ? (
          <Text papel="rotulo" tom="erro" as="p">
            {lista.error}
          </Text>
        ) : relatorios.length === 0 ? (
          <Vazio
            titulo="Nenhum relatório ainda"
            descricao="O que você gerar aparece aqui para baixar de novo quando quiser."
          />
        ) : (
          <Row.Lista>
            {relatorios.map((r) => (
              <Row
                key={r.id}
                titulo={
                  <span className="flex items-center gap-2">
                    {r.name}
                    {r.status === 'failed' && (
                      <Badge estado="erro">Falhou</Badge>
                    )}
                    {r.status === 'generating' && (
                      <Badge estado="ouro">Gerando</Badge>
                    )}
                  </span>
                }
                detalhe={
                  r.status === 'failed'
                    ? (r.error ?? 'A geração falhou.')
                    : `${PERIODOS.find((p) => p.valor === r.period)?.rotulo ?? r.period} · gerado ${dataHora(r.generatedAt)}${r.size ? ` · ${r.size}` : ''}`
                }
                depois={
                  <span className="flex gap-1">
                    {r.status === 'ready' && (
                      <>
                        <Button
                          tamanho="p"
                          icone={PiDownloadSimple}
                          carregando={baixando === `${r.id}:xlsx`}
                          onClick={() => baixar(r, 'xlsx')}
                        >
                          Excel
                        </Button>
                        <Button
                          tamanho="p"
                          variante="fantasma"
                          icone={PiFileCsv}
                          carregando={baixando === `${r.id}:csv`}
                          onClick={() => baixar(r, 'csv')}
                        >
                          CSV
                        </Button>
                      </>
                    )}
                    <Button
                      tamanho="p"
                      variante="fantasma"
                      icone={PiTrash}
                      rotulo={`Apagar ${r.name}`}
                      onClick={() => setApagando(r)}
                    />
                  </span>
                }
              />
            ))}
          </Row.Lista>
        )}
      </Secao>

      <ConfirmModal
        isOpen={!!apagando}
        onClose={() => setApagando(null)}
        onConfirm={async () => {
          if (!apagando) return;
          try {
            await apagar.mutateAsync([apagando.id]);
            toast.success('Relatório apagado.');
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : 'Não foi possível apagar.'
            );
          }
          setApagando(null);
        }}
        type="danger"
        acaoPerigosa
        title="Apagar este relatório?"
        message="Ele sai da lista; gerar de novo produz os números do dia em que for gerado."
        confirmText="Apagar"
        cancelText="Voltar"
        isLoading={apagar.isPending}
      />
    </Stack>
  );
}
