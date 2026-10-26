'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  PiArrowSquareOut,
  PiCopy,
  PiPencilSimple,
  PiPlus,
  PiStar,
  PiTrash,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Badge } from '@/app/components/ui/Badge';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Icon } from '@/app/components/ui/Icon';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Selecao } from '@/app/components/ui/Selecao';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { Busca, Segmentos } from '@/app/components/Admin/painel/Controles';
import { Numeros } from '@/app/components/Admin/painel/Numeros';
import { Tabela, type Coluna } from '@/app/components/Admin/painel/Tabela';
import { HistoricoDoRegistro } from '@/app/components/Admin/painel/Trilha';
import {
  data,
  dataCurta,
  numero,
} from '@/app/components/Admin/painel/formatos';
import {
  useApagarArtigo,
  useAprovarArtigo,
  useArtigos,
  useCategoriasDoBlog,
  useDestacarArtigo,
  useDuplicarArtigo,
  usePanoramaArtigos,
  usePublicarArtigo,
} from '@/app/hooks/admin/useBlogAdmin';
import {
  TIPOS_DE_ARTIGO,
  type ArtigoAdmin,
  type EstadoArtigo,
} from '@/app/requests/admin/blog';

/**
 * Artigos do blog: o que está no ar, em revisão, agendado ou em rascunho.
 *
 * Os números vêm de um agregado da API (29/09/2026). A tela antiga pedia
 * quatro listas só para contar e varria até 2.000 artigos — com o conteúdo
 * inteiro de cada um — para somar visualizações e montar o filtro de autor.
 *
 * Escrever e editar continuam no editor do blog (`/blog/admin/articles/…`);
 * aqui se decide o que vai ao ar.
 */

type Filtro = 'todos' | EstadoArtigo;

const ESTADOS: Record<EstadoArtigo, string> = {
  DRAFT: 'Rascunho',
  REVIEW: 'Em revisão',
  SCHEDULED: 'Agendado',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Arquivado',
};

const nomeCategoria = (a: ArtigoAdmin) => {
  const c = a.categories[0];
  return c ? (c.name ?? c.category?.name ?? '') : '';
};

const autor = (a: ArtigoAdmin) =>
  a.author
    ? [a.author.firstName, a.author.lastName].filter(Boolean).join(' ') ||
      'Sem nome'
    : 'Autor desconhecido';

function Estado({ a }: { a: ArtigoAdmin }) {
  if (a.status === 'PUBLISHED')
    return <span className="text-sm">Publicado</span>;
  if (a.status === 'REVIEW') return <Badge estado="atencao">Em revisão</Badge>;
  if (a.status === 'SCHEDULED')
    return <Badge estado="ouro">Agendado · {dataCurta(a.scheduledFor)}</Badge>;
  return <Badge>{ESTADOS[a.status]}</Badge>;
}

export default function Artigos() {
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tipo, setTipo] = useState('');
  const [autorId, setAutorId] = useState('');
  const [aberto, setAberto] = useState<ArtigoAdmin | null>(null);

  const panorama = usePanoramaArtigos();
  const categorias = useCategoriasDoBlog();
  const lista = useArtigos({
    status: filtro === 'todos' ? undefined : filtro,
    search: busca,
    category: categoria || undefined,
    type: tipo || undefined,
    authorId: autorId || undefined,
  });
  const p = panorama.data;

  const colunas: Coluna<ArtigoAdmin>[] = [
    {
      id: 'titulo',
      titulo: 'Artigo',
      principal: true,
      celula: (a) => (
        <span className="flex min-w-0 items-center gap-3">
          <Capa src={a.coverImage} />
          <span className="flex min-w-0 flex-col">
            <span className="flex min-w-0 items-center gap-1.5 font-display text-[1.0625rem] leading-snug text-texto">
              <span className="truncate">{a.title}</span>
              {a.isFeatured && (
                <Icon
                  de={PiStar}
                  tamanho="pp"
                  rotulo="Em destaque"
                  className="shrink-0 text-ouro-texto"
                />
              )}
            </span>
            <span className="t-legenda truncate">
              {autor(a)}
              {nomeCategoria(a) ? ` · ${nomeCategoria(a)}` : ''}
            </span>
          </span>
        </span>
      ),
    },
    { id: 'estado', titulo: 'Estado', celula: (a) => <Estado a={a} /> },
    {
      id: 'publicado',
      titulo: 'Publicado em',
      soNoComputador: true,
      celula: (a) => (
        <span className="t-dado text-sm">{dataCurta(a.publishedAt)}</span>
      ),
    },
    {
      id: 'leituras',
      titulo: 'Visualizações',
      alinhar: 'fim',
      celula: (a) => numero(a.viewCount),
    },
    {
      id: 'comentarios',
      titulo: 'Comentários',
      alinhar: 'fim',
      soNoComputador: true,
      celula: (a) => numero(a._count?.comments ?? 0),
    },
  ];

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Artigos"
        descricao="O que está no ar, em revisão, agendado e em rascunho"
        acoes={
          <Link
            href="/blog/admin/articles/create"
            className={classesDeBotao('primario', 'p')}
          >
            <Icon de={PiPlus} tamanho="pp" /> Novo artigo
          </Link>
        }
      />

      <Numeros
        carregando={panorama.loading}
        itens={[
          {
            id: 'publicados',
            rotulo: 'Publicados',
            aoClicar: () => setFiltro('PUBLISHED'),
            valor: numero(p?.porEstado.PUBLISHED ?? 0),
          },
          {
            id: 'revisao',
            rotulo: 'Em revisão',
            aoClicar: () => setFiltro('REVIEW'),
            valor: numero(p?.porEstado.REVIEW ?? 0),
            tom: p?.porEstado.REVIEW ? 'atencao' : undefined,
          },
          {
            id: 'rascunhos',
            rotulo: 'Rascunhos e agendados',
            aoClicar: () => setFiltro('DRAFT'),
            valor: numero(
              (p?.porEstado.DRAFT ?? 0) + (p?.porEstado.SCHEDULED ?? 0)
            ),
          },
          {
            id: 'views',
            rotulo: 'Visualizações',
            aoClicar: () => setFiltro('PUBLISHED'),
            valor: numero(p?.visualizacoes),
            nota: 'dos publicados, desde o início',
          },
        ]}
      />

      <Stack gap={3}>
        <Segmentos<Filtro>
          rotulo="Estado"
          valor={filtro}
          aoMudar={setFiltro}
          opcoes={[
            { valor: 'todos', rotulo: 'Todos', contagem: p?.total ?? null },
            { valor: 'PUBLISHED', rotulo: 'Publicados' },
            {
              valor: 'REVIEW',
              rotulo: 'Em revisão',
              contagem: p?.porEstado.REVIEW || null,
            },
            { valor: 'SCHEDULED', rotulo: 'Agendados' },
            { valor: 'DRAFT', rotulo: 'Rascunhos' },
            { valor: 'ARCHIVED', rotulo: 'Arquivados' },
          ]}
        />
        <div className="flex flex-wrap items-end gap-2">
          <Busca
            valor={busca}
            aoMudar={setBusca}
            rotulo="Buscar artigo"
            placeholder="Título ou descrição"
          />
          <div className="w-48">
            <label htmlFor="art-cat" className="sr-only">
              Categoria
            </label>
            <Selecao
              id="art-cat"
              valor={categoria}
              aoMudar={setCategoria}
              opcoes={[
                { value: '', label: 'Todas as categorias' },
                ...(categorias.data ?? []).map((c) => ({
                  value: c.slug,
                  label: c.name,
                })),
              ]}
            />
          </div>
          <div className="w-48">
            <label htmlFor="art-tipo" className="sr-only">
              Tipo
            </label>
            <Selecao
              id="art-tipo"
              valor={tipo}
              aoMudar={setTipo}
              opcoes={[
                { value: '', label: 'Todos os tipos' },
                ...Object.entries(TIPOS_DE_ARTIGO).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
            />
          </div>
          <div className="w-48">
            <label htmlFor="art-autor" className="sr-only">
              Autor
            </label>
            <Selecao
              id="art-autor"
              valor={autorId}
              aoMudar={setAutorId}
              opcoes={[
                { value: '', label: 'Quem escreveu' },
                ...(p?.autores ?? []).map((a) => ({
                  value: a.id,
                  label: `${a.nome} (${a.artigos})`,
                })),
              ]}
            />
          </div>
        </div>
      </Stack>

      <Tabela
        rotulo="Artigos"
        colunas={colunas}
        linhas={lista.items}
        chave={(a) => a.id}
        carregando={lista.loading}
        aoClicar={setAberto}
        erro={
          lista.error ? (
            <Text papel="rotulo" tom="erro" as="p">
              {lista.error}
            </Text>
          ) : undefined
        }
        vazio={
          <Vazio
            titulo="Nenhum artigo aqui"
            descricao="Troque o filtro ou escreva um novo."
          />
        }
        rodape={
          lista.total !== null
            ? `${numero(lista.items.length)} de ${numero(lista.total)}`
            : undefined
        }
        maisItens={lista.hasMore}
        carregandoMais={lista.loadingMore}
        aoCarregarMais={lista.loadMore}
      />

      <AcoesDoArtigo artigo={aberto} aoFechar={() => setAberto(null)} />
    </Stack>
  );
}

function AcoesDoArtigo({
  artigo: a,
  aoFechar,
}: {
  artigo: ArtigoAdmin | null;
  aoFechar: () => void;
}) {
  const router = useRouter();
  const [apagando, setApagando] = useState(false);
  const publicar = usePublicarArtigo();
  const aprovar = useAprovarArtigo();
  const destacar = useDestacarArtigo();
  const duplicar = useDuplicarArtigo();
  const apagar = useApagarArtigo();

  if (!a)
    return (
      <Sheet aberto={false} aoFechar={aoFechar} titulo="">
        {null}
      </Sheet>
    );

  const rodar = async (acao: () => Promise<unknown>, ok: string) => {
    try {
      await acao();
      toast.success(ok);
      aoFechar();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível concluir.'
      );
    }
  };

  return (
    <>
      <Sheet
        aberto
        aoFechar={aoFechar}
        titulo={a.title}
        descricao={`${autor(a)} · atualizado em ${data(a.updatedAt)}`}
        largura="g"
        rodape={
          <>
            <Button
              tamanho="p"
              variante="perigo"
              icone={PiTrash}
              onClick={() => setApagando(true)}
              className="mr-auto"
            >
              Apagar
            </Button>
            <Link
              href={`/blog/admin/articles/${a.id}/edit`}
              className={classesDeBotao('secundario', 'p')}
            >
              <Icon de={PiPencilSimple} tamanho="pp" /> Editar
            </Link>
            {a.status === 'REVIEW' ? (
              <Button
                tamanho="p"
                variante="primario"
                carregando={aprovar.isPending}
                onClick={() =>
                  rodar(
                    () => aprovar.mutateAsync([a.id]),
                    'Artigo aprovado e publicado.'
                  )
                }
              >
                Aprovar e publicar
              </Button>
            ) : a.status === 'PUBLISHED' ? (
              <Button
                tamanho="p"
                carregando={publicar.isPending}
                onClick={() =>
                  rodar(
                    () => publicar.mutateAsync([a.id, 'unpublish']),
                    'Artigo tirado do ar.'
                  )
                }
              >
                Tirar do ar
              </Button>
            ) : (
              <Button
                tamanho="p"
                variante="primario"
                carregando={publicar.isPending}
                onClick={() =>
                  rodar(
                    () => publicar.mutateAsync([a.id, 'publish']),
                    'Artigo publicado.'
                  )
                }
              >
                Publicar agora
              </Button>
            )}
          </>
        }
      >
        <Stack gap={6}>
          {a.description && (
            <Text papel="corpo" tom="suave" as="p" className="medida-texto">
              {a.description}
            </Text>
          )}
          <Numeros
            colunas={4}
            itens={[
              {
                id: 'estado',
                rotulo: 'Estado',
                valor: (
                  <span className="font-sans text-base">
                    <Estado a={a} />
                  </span>
                ),
              },
              {
                id: 'views',
                rotulo: 'Visualizações',
                valor: numero(a.viewCount),
              },
              {
                id: 'leituras',
                rotulo: 'Leituras até o fim',
                valor: numero(a.readCount),
              },
              {
                id: 'comentarios',
                rotulo: 'Comentários',
                valor: numero(a._count?.comments ?? 0),
              },
            ]}
          />
          <Inline gap={2} quebra>
            <Button
              tamanho="p"
              icone={PiStar}
              carregando={destacar.isPending}
              onClick={() =>
                rodar(
                  () => destacar.mutateAsync([a.id, !a.isFeatured]),
                  a.isFeatured ? 'Saiu dos destaques.' : 'Em destaque.'
                )
              }
            >
              {a.isFeatured ? 'Tirar do destaque' : 'Destacar na home do blog'}
            </Button>
            <Button
              tamanho="p"
              icone={PiCopy}
              carregando={duplicar.isPending}
              onClick={async () => {
                try {
                  const r = await duplicar.mutateAsync([a.id]);
                  const novo = r?.article?.id ?? r?.id;
                  toast.success('Cópia criada como rascunho.');
                  if (novo) router.push(`/blog/admin/articles/${novo}/edit`);
                  else aoFechar();
                } catch (e) {
                  toast.error(
                    e instanceof Error
                      ? e.message
                      : 'Não foi possível duplicar.'
                  );
                }
              }}
            >
              Duplicar
            </Button>
            <Link
              href={
                a.status === 'PUBLISHED'
                  ? `/blog/${a.slug}`
                  : `/blog/preview/${a.slug}`
              }
              target="_blank"
              className={classesDeBotao('fantasma', 'p')}
            >
              {a.status === 'PUBLISHED' ? 'Abrir no blog' : 'Ver a prévia'}{' '}
              <Icon de={PiArrowSquareOut} tamanho="pp" />
            </Link>
          </Inline>
          <Stack gap={2}>
            <Text papel="secao" as="h3">
              No painel
            </Text>
            <HistoricoDoRegistro entityId={a.id} />
          </Stack>
        </Stack>
      </Sheet>

      <ConfirmModal
        isOpen={apagando}
        onClose={() => setApagando(false)}
        onConfirm={async () => {
          await rodar(() => apagar.mutateAsync([a.id]), 'Artigo apagado.');
          setApagando(false);
        }}
        type="danger"
        acaoPerigosa
        title="Apagar este artigo?"
        message={`“${a.title}” sai do blog com comentários e curtidas. Para só tirar do ar, use “Tirar do ar”.`}
        confirmText="Apagar"
        cancelText="Voltar"
        isLoading={apagar.isPending}
      />
    </>
  );
}

/**
 * A capa do artigo na lista: 64×40 (a proporção de capa do blog, 16:10),
 * ou uma moldura vazia do mesmo tamanho — sem ela os títulos das linhas sem
 * capa ficariam desalinhados dos outros.
 */
function Capa({ src }: { src: string | null }) {
  const [falhou, setFalhou] = useState(false);
  return src && !falhou ? (
    // eslint-disable-next-line @next/next/no-img-element -- miniatura de capa, de qualquer origem
    <img
      src={src}
      alt=""
      width={64}
      height={40}
      loading="lazy"
      onError={() => setFalhou(true)}
      className="h-10 w-16 shrink-0 rounded-[6px] object-cover"
    />
  ) : (
    <span
      aria-hidden="true"
      className="h-10 w-16 shrink-0 rounded-[6px] bg-sup-2"
    />
  );
}
