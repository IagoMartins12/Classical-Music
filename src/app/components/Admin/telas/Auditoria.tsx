'use client';

import { useMemo, useState } from 'react';
import { PiDownloadSimple, PiTrash, PiX } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import toast from 'react-hot-toast';
import { Chip } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Icon } from '@/app/components/ui/Icon';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Selecao } from '@/app/components/ui/Selecao';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import {
  FiltroData,
  FiltroSelecao,
  FiltroTexto,
  MaisFiltros,
  fimDoDia,
  inicioDoDia,
  useAtrasado,
} from '@/app/components/Admin/painel/Filtros';
import { Numeros, rolarAte } from '@/app/components/Admin/painel/Numeros';
import { BarraDeSelecao } from '@/app/components/Admin/painel/Controles';
import { useAdminMutation } from '@/app/hooks/admin/query';
import {
  EventoDaTrilha,
  FraseDaTrilha,
} from '@/app/components/Admin/painel/Trilha';
import {
  AREAS_DE_ACAO,
  NOME_ENTIDADE,
  fraseDaAcao,
} from '@/app/components/Admin/painel/acoes';
import { numero, porcento } from '@/app/components/Admin/painel/formatos';
import {
  useAuditoria,
  useFacetasAuditoria,
  useResumoAuditoria,
} from '@/app/hooks/admin/usePainel';
import {
  apagarDaAuditoria,
  exportarAuditoria,
  type FiltrosAuditoria,
  type RegistroAuditoria,
} from '@/app/requests/admin/painel';

/**
 * Auditoria: toda ação feita no painel — quem, o quê, em qual registro,
 * quando, e o que mudou.
 *
 * Substitui "Logs & Auditoria", que lia arquivos de log do disco do Next (a
 * API não grava log em arquivo) e mostrava a trilha como códigos
 * (`work.update`) sem dizer o que tinha mudado. Desde 29/09/2026 a API
 * fotografa o registro antes e depois de cada escrita, e a tela mostra a
 * diferença campo a campo.
 *
 * A lista vem agrupada por dia, a hora em mono à esquerda, a frase à direita.
 * Clicar abre o detalhe: o antes e depois, a origem (rede e navegador), e
 * dois atalhos que são a investigação de verdade — "tudo o que aconteceu com
 * este registro" e "tudo o que esta pessoa fez".
 */

const FUSO = 'America/Sao_Paulo';

const JANELAS = [
  { value: '1', label: 'Últimas 24 horas' },
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
  { value: '', label: 'Tudo' },
];

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: FUSO,
  });

function nomeDoDia(iso: string) {
  const dia = new Date(iso).toLocaleDateString('sv-SE', { timeZone: FUSO });
  const hoje = new Date().toLocaleDateString('sv-SE', { timeZone: FUSO });
  const ontem = new Date(Date.now() - 86_400_000).toLocaleDateString('sv-SE', {
    timeZone: FUSO,
  });
  if (dia === hoje) return 'Hoje';
  if (dia === ontem) return 'Ontem';
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: FUSO,
  });
}

export default function Auditoria() {
  const [janela, setJanela] = useState('30');
  const [quem, setQuem] = useState('');
  const [area, setArea] = useState('');
  const [tipo, setTipo] = useState('');
  const [soFalhas, setSoFalhas] = useState(false);
  const [registro, setRegistro] = useState<{
    id: string;
    tipo: string | null;
    alvo?: string;
  } | null>(null);
  const [aberto, setAberto] = useState<RegistroAuditoria | null>(null);
  const [exportando, setExportando] = useState(false);
  // Apagar: marcar registros (ou usar os filtros) e confirmar.
  const [selecionando, setSelecionando] = useState(false);
  const [marcados, setMarcados] = useState<string[]>([]);
  const [apagando, setApagando] = useState<'marcados' | 'filtrados' | null>(
    null
  );
  const apagar = useAdminMutation(
    (c: { ids?: string[]; filtros?: FiltrosAuditoria }) => apagarDaAuditoria(c),
    ['auditoria']
  );
  // Filtros avançados
  const [operacao, setOperacao] = useState('');
  const [papel, setPapel] = useState('');
  const [acao, setAcao] = useState('');
  const [alvo, setAlvo] = useState('');
  const [campo, setCampo] = useState('');
  const [rede, setRede] = useState('');
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');
  const alvoAtrasado = useAtrasado(alvo);
  const campoAtrasado = useAtrasado(campo);
  const redeAtrasada = useAtrasado(rede);
  const avancados = [operacao, papel, acao, alvo, campo, rede, de, ate];
  const limparAvancados = () =>
    [
      setOperacao,
      setPapel,
      setAcao,
      setAlvo,
      setCampo,
      setRede,
      setDe,
      setAte,
    ].forEach((f) => f(''));

  // O início da janela fica fixo enquanto a janela não muda: recalcular a
  // cada render trocaria a chave do cache e refaria a busca sem parar.
  const from = useMemo(
    () =>
      janela
        ? new Date(Date.now() - Number(janela) * 86_400_000).toISOString()
        : undefined,
    [janela]
  );

  const filtros: FiltrosAuditoria = {
    // Datas escolhidas valem mais que a janela.
    from: inicioDoDia(de) ?? (de || ate ? undefined : from),
    to: fimDoDia(ate),
    actorId: quem || undefined,
    action: acao || undefined,
    actionPrefix: area && !acao ? `${area}.` : undefined,
    verb: (operacao || undefined) as FiltrosAuditoria['verb'],
    actorRole: papel === '' ? undefined : Number(papel),
    target: alvoAtrasado || undefined,
    field: campoAtrasado || undefined,
    ip: redeAtrasada || undefined,
    entityType: registro ? undefined : tipo || undefined,
    entityId: registro?.id,
    onlyFailures: soFalhas || undefined,
  };

  const lista = useAuditoria(filtros);
  const facetas = useFacetasAuditoria();
  const resumo = useResumoAuditoria(Number(janela) || 365);

  const grupos = useMemo(() => {
    const porDia = new Map<string, RegistroAuditoria[]>();
    for (const r of lista.items) {
      const dia = nomeDoDia(r.createdAt);
      porDia.set(dia, [...(porDia.get(dia) ?? []), r]);
    }
    return [...porDia.entries()];
  }, [lista.items]);

  const filtrando = !!(
    quem ||
    area ||
    tipo ||
    soFalhas ||
    registro ||
    avancados.some(Boolean)
  );
  const limpar = () => {
    setQuem('');
    setArea('');
    setTipo('');
    setSoFalhas(false);
    setRegistro(null);
    limparAvancados();
  };

  const exportar = async () => {
    setExportando(true);
    try {
      await exportarAuditoria(filtros);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível exportar.'
      );
    } finally {
      setExportando(false);
    }
  };

  const r = resumo.data;
  const maisComum = r?.byAction[0];

  return (
    <Stack gap={8}>
      <Cabecalho
        titulo="Auditoria"
        descricao="Toda ação feita no painel: quem, o quê, em qual registro e o que mudou."
        acoes={
          <Button
            tamanho="p"
            icone={PiDownloadSimple}
            onClick={exportar}
            carregando={exportando}
          >
            Exportar CSV
          </Button>
        }
      />

      <Numeros
        carregando={resumo.loading}
        itens={[
          {
            id: 'total',
            rotulo: 'Ações no período',
            valor: numero(r?.total),
            aoClicar: () => {
              setSoFalhas(false);
              limparAvancados();
              rolarAte('aud-lista');
            },
          },
          {
            id: 'falhas',
            rotulo: 'Tentativas que falharam',
            aoClicar: () => {
              setSoFalhas(true);
              rolarAte('aud-lista');
            },
            valor: numero(r?.failures),
            nota:
              r?.failureRate !== null && r
                ? porcento(r.failureRate)
                : 'sem base',
            tom: r && r.failures > 0 ? 'atencao' : undefined,
          },
          {
            id: 'pessoas',
            rotulo: 'Pessoas que agiram',
            aoClicar: () => rolarAte('aud-quem'),
            valor: numero(r?.topActors.filter((a) => a.actorId).length),
          },
          {
            id: 'comum',
            rotulo: 'Ação mais comum',
            aoClicar: () => {
              if (maisComum) setAcao(maisComum.action);
              rolarAte('aud-lista');
            },
            valor: maisComum ? numero(maisComum.count) : '—',
            nota: maisComum ? fraseDaAcao(maisComum.action, null) : undefined,
          },
        ]}
      />

      <Stack gap={3}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Filtro rotulo="Período" id="aud-janela">
            <Selecao
              id="aud-janela"
              opcoes={JANELAS}
              valor={janela}
              aoMudar={setJanela}
            />
          </Filtro>
          <Filtro rotulo="Quem" id="aud-quem">
            <Selecao
              id="aud-quem"
              valor={quem}
              aoMudar={setQuem}
              opcoes={[
                { value: '', label: 'Todas as pessoas' },
                ...(facetas.data?.actors ?? [])
                  .filter((a) => a.actorId)
                  .map((a) => ({
                    value: a.actorId as string,
                    label: `${a.name ?? 'Conta removida'} (${numero(a.count)})`,
                  })),
              ]}
            />
          </Filtro>
          <Filtro rotulo="Área" id="aud-area">
            <Selecao
              id="aud-area"
              valor={area}
              aoMudar={setArea}
              opcoes={[
                { value: '', label: 'Todas as áreas' },
                ...AREAS_DE_ACAO.map((a) => ({
                  value: a.prefixo,
                  label: a.rotulo,
                })),
              ]}
            />
          </Filtro>
          <Filtro rotulo="Tipo de registro" id="aud-tipo">
            <Selecao
              id="aud-tipo"
              valor={tipo}
              aoMudar={setTipo}
              disabled={!!registro}
              opcoes={[
                { value: '', label: 'Todos os tipos' },
                ...(facetas.data?.entityTypes ?? []).map((t) => ({
                  value: t.entityType,
                  label: `${NOME_ENTIDADE[t.entityType] ?? t.entityType} (${numero(t.count)})`,
                })),
              ]}
            />
          </Filtro>
        </div>
        <MaisFiltros
          ativos={avancados.filter(Boolean).length}
          aoLimpar={limparAvancados}
        >
          <FiltroSelecao
            rotulo="Operação"
            valor={operacao}
            aoMudar={setOperacao}
            todos="Qualquer"
            opcoes={[
              { value: 'create', label: 'Criou' },
              { value: 'update', label: 'Alterou ou verificou' },
              { value: 'delete', label: 'Apagou' },
              { value: 'other', label: 'Outras (enviou, rodou, exportou…)' },
            ]}
          />
          <FiltroSelecao
            rotulo="Ação exata"
            valor={acao}
            aoMudar={setAcao}
            todos="Qualquer"
            opcoes={(facetas.data?.actions ?? []).map((a) => ({
              value: a.action,
              label: `${fraseDaAcao(a.action, null)} (${numero(a.count)})`,
            }))}
          />
          <FiltroSelecao
            rotulo="Papel de quem agiu"
            valor={papel}
            aoMudar={setPapel}
            todos="Qualquer"
            opcoes={[
              { value: '2', label: 'Administrador' },
              { value: '1', label: 'Professor (legado)' },
              { value: '0', label: 'Pessoa' },
            ]}
          />
          <FiltroTexto
            rotulo="Registro afetado"
            valor={alvo}
            aoMudar={setAlvo}
            placeholder="Nome da obra, conta, cupom…"
          />
          <FiltroTexto
            rotulo="Campo alterado"
            valor={campo}
            aoMudar={setCampo}
            placeholder="Ex.: role, isVerified, price"
          />
          <FiltroTexto
            rotulo="Rede de origem"
            valor={rede}
            aoMudar={setRede}
            placeholder="Ex.: 189.40."
          />
          <FiltroData rotulo="De" valor={de} aoMudar={setDe} />
          <FiltroData rotulo="Até" valor={ate} aoMudar={setAte} />
        </MaisFiltros>
        <Inline gap={2} quebra>
          <Chip selecionado={soFalhas} onClick={() => setSoFalhas((f) => !f)}>
            Só o que falhou
          </Chip>
          {registro && (
            <Chip selecionado onClick={() => setRegistro(null)}>
              {registro.alvo ??
                NOME_ENTIDADE[registro.tipo ?? ''] ??
                'Registro'}
              : só este
              <Icon de={PiX} tamanho="pp" className="ml-1.5" />
            </Chip>
          )}
          {filtrando && (
            <Button variante="texto" tamanho="p" onClick={limpar}>
              Limpar filtros
            </Button>
          )}
          <Text papel="legenda" as="span" className="ml-auto t-dado">
            {lista.total !== null ? `${numero(lista.total)} registros` : ''}
          </Text>
          <Button
            variante={selecionando ? 'secundario' : 'texto'}
            tamanho="p"
            icone={PiTrash}
            onClick={() => {
              setSelecionando((v) => !v);
              setMarcados([]);
            }}
          >
            {selecionando ? 'Parar de selecionar' : 'Apagar registros'}
          </Button>
        </Inline>
        {selecionando && (
          <Inline
            gap={3}
            quebra
            className="rounded-controle bg-sup-2 px-4 py-3"
          >
            <Text papel="rotulo" tom="suave" as="p" className="medida-texto">
              Marque os registros na lista, ou apague todos os{' '}
              {lista.total !== null ? numero(lista.total) : ''} que os filtros
              mostram. Cada limpeza fica registrada, e esse registro não se
              apaga.
            </Text>
            <Button
              tamanho="p"
              variante="perigo"
              disabled={!lista.total}
              onClick={() => setApagando('filtrados')}
            >
              Apagar os filtrados
            </Button>
          </Inline>
        )}
        <BarraDeSelecao
          quantidade={marcados.length}
          singular="registro marcado"
          plural="registros marcados"
          aoLimpar={() => setMarcados([])}
        >
          <Button
            tamanho="p"
            variante="perigo"
            icone={PiTrash}
            onClick={() => setApagando('marcados')}
          >
            Apagar
          </Button>
        </BarraDeSelecao>
      </Stack>

      <span id="aud-lista" className="-mb-6 block scroll-mt-6" aria-hidden />
      {lista.loading ? (
        <Row.Lista>
          <Row.Skeleton repetir={8} />
        </Row.Lista>
      ) : lista.error ? (
        <Vazio
          titulo="Não foi possível ler a trilha"
          descricao={lista.error}
          acao={
            <Button tamanho="p" onClick={() => void lista.refetch()}>
              Tentar de novo
            </Button>
          }
        />
      ) : lista.items.length === 0 ? (
        <Vazio
          titulo={
            filtrando
              ? 'Nada com esses filtros'
              : 'Nenhuma ação registrada no período'
          }
          descricao={
            filtrando
              ? 'Os filtros continuam aplicados; tire algum ou amplie o período.'
              : 'Toda escrita feita no painel aparece aqui assim que acontece.'
          }
          acao={
            filtrando ? (
              <Button tamanho="p" onClick={limpar}>
                Limpar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Stack gap={6}>
          {grupos.map(([dia, itens]) => (
            <section key={dia} aria-label={dia} className="flex flex-col gap-2">
              <Text
                papel="rotulo"
                tom="fraco"
                as="h2"
                className="first-letter:uppercase"
              >
                {dia}
              </Text>
              <ul className="sup-1 flex flex-col !p-2">
                {itens.map((item) => (
                  <li key={item.id} className="flex items-center gap-1">
                    {selecionando && item.action !== 'audit.purge' && (
                      <input
                        type="checkbox"
                        aria-label="Marcar para apagar"
                        className="ml-3 h-4 w-4 shrink-0 accent-[var(--ouro)]"
                        checked={marcados.includes(item.id)}
                        onChange={() =>
                          setMarcados((m) =>
                            m.includes(item.id)
                              ? m.filter((x) => x !== item.id)
                              : [...m, item.id]
                          )
                        }
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setAberto(item)}
                      className="grid w-full grid-cols-[3.25rem_minmax(0,1fr)] items-baseline gap-3 rounded-controle px-3 py-2.5 text-left transition-colors duration-[var(--t-resposta)] ease-saida hover:bg-[var(--interactive-hover)] sm:grid-cols-[3.5rem_minmax(0,1fr)_auto]"
                    >
                      <span className="t-dado text-sm text-texto-fraco">
                        {hora(item.createdAt)}
                      </span>
                      <FraseDaTrilha registro={item} />
                      <span className="t-legenda max-sm:col-start-2">
                        {item.entityType
                          ? (NOME_ENTIDADE[item.entityType] ?? item.entityType)
                          : ''}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {lista.hasMore && (
            <Button
              variante="secundario"
              tamanho="p"
              carregando={lista.loadingMore}
              onClick={lista.loadMore}
              className="self-center"
            >
              Carregar mais
            </Button>
          )}
        </Stack>
      )}

      <EventoDaTrilha
        registro={aberto}
        aoFechar={() => setAberto(null)}
        acoes={
          aberto && (
            <Inline gap={2} quebra>
              {aberto.entityId && (
                <Button
                  tamanho="p"
                  onClick={() => {
                    setRegistro({
                      id: aberto.entityId!,
                      tipo: aberto.entityType,
                      alvo: aberto.metadata?.alvo,
                    });
                    setJanela('');
                    setAberto(null);
                  }}
                >
                  Tudo o que aconteceu com este registro
                </Button>
              )}
              {aberto.actorId && (
                <Button
                  tamanho="p"
                  variante="fantasma"
                  onClick={() => {
                    setQuem(aberto.actorId!);
                    setAberto(null);
                  }}
                >
                  Tudo o que esta pessoa fez
                </Button>
              )}
            </Inline>
          )
        }
      />

      <ConfirmModal
        isOpen={!!apagando}
        onClose={() => setApagando(null)}
        onConfirm={async () => {
          try {
            const r = await apagar.mutateAsync([
              apagando === 'marcados' ? { ids: marcados } : { filtros },
            ]);
            toast.success(
              `${numero(r.apagados)} ${r.apagados === 1 ? 'registro apagado' : 'registros apagados'}. A limpeza ficou registrada.`
            );
            setMarcados([]);
            setSelecionando(false);
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : 'Não foi possível apagar.'
            );
          }
          setApagando(null);
        }}
        type="danger"
        title="Apagar da auditoria?"
        message={
          apagando === 'marcados'
            ? `${numero(marcados.length)} ${marcados.length === 1 ? 'registro sai' : 'registros saem'} da trilha para sempre. Fica um registro dizendo quem apagou e quantos.`
            : `Todos os ${lista.total !== null ? numero(lista.total) : ''} registros que os filtros mostram saem da trilha para sempre — não só os que aparecem na tela. Fica um registro dizendo quem apagou, quantos e com que filtro.`
        }
        confirmText="Apagar"
        isLoading={apagar.isPending}
      />
    </Stack>
  );
}

function Filtro({
  rotulo,
  id,
  children,
}: {
  rotulo: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="t-legenda">
        {rotulo}
      </label>
      {children}
    </div>
  );
}
