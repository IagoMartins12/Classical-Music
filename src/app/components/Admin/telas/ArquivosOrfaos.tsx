'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  PiArrowSquareOut,
  PiFile,
  PiFilePdf,
  PiMusicNotes,
  PiTrash,
  PiVideoCamera,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import {
  BarraDeSelecao,
  Segmentos,
} from '@/app/components/Admin/painel/Controles';
import {
  FiltroData,
  fimDoDia,
  inicioDoDia,
} from '@/app/components/Admin/painel/Filtros';
import { Elo, useNavegar } from '@/app/components/Admin/painel/Navegador';
import { Numeros } from '@/app/components/Admin/painel/Numeros';
import { NOME_ENTIDADE } from '@/app/components/Admin/painel/acoes';
import {
  bytes,
  dataCurta,
  dataHora,
  numero,
} from '@/app/components/Admin/painel/formatos';
import {
  adminKeys,
  useAdminInfinite,
  useAdminMutation,
} from '@/app/hooks/admin/query';
import {
  listarOrfaos,
  removerOrfaos,
  type ArquivoOrfao,
} from '@/app/requests/admin/maintenance';

/**
 * Arquivos órfãos: o que ficou no armazenamento (pago) depois que o dono —
 * a obra, o anúncio, o artigo, a conta — foi removido.
 *
 * Cada arquivo aparece com a imagem, de onde era (e o nome do registro, quando
 * a remoção passou pela auditoria), quem enviou, quando e quanto pesa; dá
 * para remover um a um ou em lote, sempre com confirmação. Remover confere de
 * novo antes de apagar: se o dono voltou, o arquivo fica.
 *
 * **Dois tipos.** "Dono removido" é órfão de certeza. "Sem dono declarado" é
 * arquivo que nunca disse a quem pertence — pode ser de antes do registro de
 * arquivos e ainda estar em uso —, então fica em recorte próprio.
 *
 * Período: todas as datas por padrão; ou os enviados entre duas datas.
 * Só aparece o que a API registrou: o que o site antigo enviou antes dela
 * existir não está no registro.
 */

type Periodo = 'sempre' | 'datas';

/** Miniatura pequena do Cloudinary: a grade não baixa a imagem inteira. */
const miniatura = (url: string) =>
  url.includes('/upload/')
    ? url.replace('/upload/', '/upload/c_fill,w_320,h_240,q_auto,f_auto/')
    : url;

const NOME_DO_TIPO: Record<string, string> = {
  ...NOME_ENTIDADE,
  'sem-dono': 'Sem dono declarado',
};

function Previa({ a, grande = false }: { a: ArquivoOrfao; grande?: boolean }) {
  if (a.tipoDeArquivo === 'IMAGE' && a.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- arquivo do armazenamento, de qualquer pasta
      <img
        src={grande ? a.url : miniatura(a.url)}
        alt=""
        loading="lazy"
        className={cx(
          'h-full w-full',
          grande ? 'object-contain' : 'object-cover'
        )}
      />
    );
  }
  const icone =
    a.tipoDeArquivo === 'AUDIO'
      ? PiMusicNotes
      : a.tipoDeArquivo === 'VIDEO'
        ? PiVideoCamera
        : a.formato === 'pdf'
          ? PiFilePdf
          : PiFile;
  return (
    <span className="grid h-full place-items-center text-texto-fraco">
      <Icon de={icone} tamanho="g" />
    </span>
  );
}

const origem = (a: ArquivoOrfao) =>
  a.motivo === 'sem-dono'
    ? 'Sem dono declarado'
    : `${NOME_ENTIDADE[a.dono?.tipo ?? ''] ?? a.dono?.tipo ?? 'Registro'} removido${a.dono?.nome ? `: ${a.dono.nome}` : ''}`;

export default function ArquivosOrfaos() {
  const navegar = useNavegar();
  const [periodo, setPeriodo] = useState<Periodo>('sempre');
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');
  const [tipo, setTipo] = useState('');
  const [marcados, setMarcados] = useState<string[]>([]);
  const [aberto, setAberto] = useState<ArquivoOrfao | null>(null);
  const [removendo, setRemovendo] = useState<string[] | null>(null);

  const filtro = {
    de: periodo === 'datas' ? inicioDoDia(de) : undefined,
    ate: periodo === 'datas' ? fimDoDia(ate) : undefined,
    tipo: tipo || undefined,
  };
  const lista = useAdminInfinite<ArquivoOrfao>(
    adminKeys.list('maintenance', { orfaos: filtro }),
    async (cursor) => {
      const pagina = cursor ? Number(cursor) : 1;
      const r = await listarOrfaos(filtro, pagina);
      return {
        items: r.items,
        total: r.pagination.total,
        extra: r.resumo,
        nextCursor:
          pagina < r.pagination.totalPages ? String(pagina + 1) : null,
      };
    }
  );
  const resumo = (lista.extra ?? null) as {
    total: number;
    bytes: number;
    porTipo: Record<string, number>;
  } | null;
  const remover = useAdminMutation(
    (ids: string[]) => removerOrfaos(ids),
    ['maintenance', 'auditoria']
  );

  const porTipo = Object.entries(resumo?.porTipo ?? {}).sort(
    (a, b) => b[1] - a[1]
  );
  const orfaosDeCerteza = porTipo
    .filter(([t]) => t !== 'sem-dono')
    .reduce((s, [, n]) => s + n, 0);

  const alternar = (id: string) =>
    setMarcados((m) =>
      m.includes(id) ? m.filter((x) => x !== id) : [...m, id]
    );

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Arquivos órfãos"
        descricao="O que ficou no armazenamento depois que o dono foi removido"
        aoAtualizar={() => lista.refetch()}
        acoes={
          <Link href="/admin/cron" className={classesDeBotao('fantasma', 'p')}>
            Varredura agendada
          </Link>
        }
      />

      <Numeros
        carregando={lista.loading && !resumo}
        colunas={3}
        itens={[
          {
            id: 'orfaos',
            rotulo: 'Dono removido',
            valor: numero(orfaosDeCerteza),
            nota: 'órfãos de certeza',
            tom: orfaosDeCerteza ? 'atencao' : undefined,
            aoClicar: () => setTipo(''),
          },
          {
            id: 'espaco',
            rotulo: 'Espaço ocupado',
            valor: bytes(resumo?.bytes ?? 0),
            nota: tipo ? NOME_DO_TIPO[tipo] : 'no recorte',
            aoClicar: () => setTipo(''),
          },
          {
            id: 'sem-dono',
            rotulo: 'Sem dono declarado',
            valor: numero(resumo?.porTipo['sem-dono'] ?? 0),
            nota: 'podem estar em uso',
            aoClicar: () => setTipo('sem-dono'),
          },
        ]}
      />

      <Stack gap={3}>
        <Segmentos
          rotulo="Período do envio"
          valor={periodo}
          aoMudar={setPeriodo}
          opcoes={[
            { valor: 'sempre', rotulo: 'Todas as datas' },
            { valor: 'datas', rotulo: 'Escolher datas' },
          ]}
        />
        {periodo === 'datas' && (
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            <FiltroData rotulo="Enviados de" valor={de} aoMudar={setDe} />
            <FiltroData rotulo="Até" valor={ate} aoMudar={setAte} />
          </div>
        )}
        <Segmentos
          rotulo="De onde"
          valor={tipo}
          aoMudar={(v) => {
            setTipo(v);
            setMarcados([]);
          }}
          opcoes={[
            { valor: '', rotulo: 'Todos', contagem: resumo?.total ?? null },
            ...porTipo.map(([t, n]) => ({
              valor: t,
              rotulo: NOME_DO_TIPO[t] ?? t,
              contagem: n,
            })),
          ]}
        />
      </Stack>

      <BarraDeSelecao
        quantidade={marcados.length}
        singular="arquivo marcado"
        plural="arquivos marcados"
        aoLimpar={() => setMarcados([])}
      >
        <Button
          tamanho="p"
          variante="texto"
          onClick={() =>
            setMarcados(
              marcados.length === lista.items.length
                ? []
                : lista.items.map((a) => a.id)
            )
          }
        >
          {marcados.length === lista.items.length
            ? 'Desmarcar todos'
            : 'Marcar os carregados'}
        </Button>
        <Button
          tamanho="p"
          variante="perigo"
          icone={PiTrash}
          onClick={() => setRemovendo(marcados)}
        >
          Remover
        </Button>
      </BarraDeSelecao>

      {lista.loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} forma="bloco" className="aspect-[4/3] w-full" />
          ))}
        </div>
      ) : lista.error ? (
        <Text papel="rotulo" tom="erro" as="p">
          {lista.error}
        </Text>
      ) : lista.items.length === 0 ? (
        <Vazio
          titulo="Nenhum arquivo órfão"
          descricao={
            periodo === 'datas'
              ? 'Nada no período escolhido. Tente "Todas as datas".'
              : 'Todo arquivo registrado tem dono.'
          }
        />
      ) : (
        <Stack gap={3}>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {lista.items.map((a) => {
              const marcado = marcados.includes(a.id);
              return (
                <li
                  key={a.id}
                  className={cx(
                    'relative flex flex-col overflow-hidden rounded-card bg-sup-2',
                    marcado && 'ring-2 ring-ouro'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setAberto(a)}
                    className="block aspect-[4/3] w-full overflow-hidden bg-[var(--linha)]"
                    aria-label={`Ver ${a.publicId}`}
                  >
                    <Previa a={a} />
                  </button>
                  <div className="flex items-start gap-2 px-3 py-2">
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="t-legenda truncate text-texto">
                        {origem(a)}
                      </span>
                      <span className="t-legenda truncate">
                        {a.enviadoPor?.nome ?? 'sistema'} ·{' '}
                        {dataCurta(a.criadoEm)}
                      </span>
                      <span className="t-legenda t-dado">
                        {a.bytes ? bytes(a.bytes) : '—'}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => alternar(a.id)}
                      aria-label="Marcar para remover"
                      className="mt-0.5 h-4 w-4 accent-[var(--ouro)]"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          {lista.hasMore && (
            <Button
              tamanho="p"
              variante="texto"
              className="self-center"
              onClick={lista.loadMore}
              carregando={lista.loadingMore}
            >
              Carregar mais
            </Button>
          )}
        </Stack>
      )}

      <Sheet
        aberto={!!aberto}
        aoFechar={() => setAberto(null)}
        titulo={aberto ? origem(aberto) : ''}
        descricao={aberto?.publicId}
        largura="m"
        rodape={
          aberto && (
            <>
              {aberto.url && (
                <a
                  href={aberto.url}
                  target="_blank"
                  rel="noreferrer"
                  className={cx(classesDeBotao('fantasma', 'p'), 'mr-auto')}
                >
                  <Icon de={PiArrowSquareOut} tamanho="pp" /> Abrir o arquivo
                </a>
              )}
              <Button
                tamanho="p"
                variante="perigo"
                icone={PiTrash}
                onClick={() => setRemovendo([aberto.id])}
              >
                Remover
              </Button>
            </>
          )
        }
      >
        {aberto && (
          <Stack gap={6}>
            <div className="aspect-[4/3] w-full overflow-hidden rounded-card bg-sup-2">
              <Previa a={aberto} grande />
            </div>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Info rotulo="De onde era">
                {aberto.motivo === 'sem-dono'
                  ? 'Nunca declarou dono — pode estar em uso por algo antigo'
                  : `${NOME_ENTIDADE[aberto.dono?.tipo ?? ''] ?? aberto.dono?.tipo}${aberto.dono?.nome ? ` “${aberto.dono.nome}”` : ''}, que não existe mais`}
              </Info>
              <Info rotulo="Registro removido em">
                {aberto.dono?.removidoEm
                  ? dataHora(aberto.dono.removidoEm)
                  : '—'}
              </Info>
              <Info rotulo="Enviado por">
                {aberto.enviadoPor ? (
                  <Elo onClick={() => navegar.usuario(aberto.enviadoPor!.id)}>
                    {aberto.enviadoPor.nome ?? 'Conta removida'}
                  </Elo>
                ) : (
                  'Sistema'
                )}
              </Info>
              <Info rotulo="Enviado em">{dataHora(aberto.criadoEm)}</Info>
              <Info rotulo="Tamanho">
                {aberto.bytes ? bytes(aberto.bytes) : '—'}
                {aberto.largura && aberto.altura
                  ? ` · ${aberto.largura}×${aberto.altura}`
                  : ''}
              </Info>
              <Info rotulo="Formato">
                {[aberto.formato, aberto.tipoDeArquivo.toLowerCase()]
                  .filter(Boolean)
                  .join(' · ')}
              </Info>
              <Info rotulo="Pasta">{aberto.pasta}</Info>
              <Info rotulo="Id do dono">{aberto.dono?.id ?? '—'}</Info>
            </dl>
          </Stack>
        )}
      </Sheet>

      <ConfirmModal
        isOpen={!!removendo}
        onClose={() => setRemovendo(null)}
        onConfirm={async () => {
          if (!removendo) return;
          try {
            const r = await remover.mutateAsync([removendo]);
            if (r.removidos) {
              toast.success(
                `${numero(r.removidos)} ${r.removidos === 1 ? 'arquivo removido' : 'arquivos removidos'} do armazenamento.`
              );
            }
            if (r.recusados.length) {
              toast.error(
                `${numero(r.recusados.length)} não ${r.recusados.length === 1 ? 'saiu' : 'saíram'}: ${r.recusados[0].motivo}.`
              );
            }
            setMarcados((m) => m.filter((id) => !r.ids.includes(id)));
            setAberto(null);
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : 'Não foi possível remover.'
            );
          }
          setRemovendo(null);
        }}
        type="danger"
        title={
          removendo && removendo.length > 1
            ? `Remover ${numero(removendo.length)} arquivos?`
            : 'Remover este arquivo?'
        }
        message="O arquivo sai do armazenamento para sempre. Antes de apagar, cada um é conferido de novo: se o dono voltou a existir, ele fica."
        confirmText="Remover"
        isLoading={remover.isPending}
      />
    </Stack>
  );
}

function Info({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="t-legenda">{rotulo}</dt>
      <dd className="text-sm text-texto">{children}</dd>
    </div>
  );
}
