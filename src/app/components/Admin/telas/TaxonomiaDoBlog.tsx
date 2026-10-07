'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PiPencilSimple, PiPlus, PiTrash } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Badge } from '@/app/components/ui/Badge';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';
import { Icon } from '@/app/components/ui/Icon';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Text } from '@/app/components/ui/Text';
import { Cabecalho } from '@/app/components/Admin/painel/Cabecalho';
import { ListaReordenavel } from '@/app/components/Admin/painel/ListaReordenavel';
import { Selecao } from '@/app/components/ui/Selecao';
import { Busca, Segmentos } from '@/app/components/Admin/painel/Controles';
import { numero } from '@/app/components/Admin/painel/formatos';
import {
  useApagarCategoria,
  useApagarTag,
  useAtivarCategoria,
  useCategoriasAdmin,
  useDestacarArtigo,
  useDestaquesDoBlog,
  useReordenarCategorias,
  useReordenarDestaques,
  useSecoesDoInicio,
  useTagsAdmin,
} from '@/app/hooks/admin/useBlogAdmin';
import type { CategoriaAdmin, TagAdmin } from '@/app/requests/admin/blog';

/**
 * Categorias e tags do blog, numa tela: eram duas páginas, cada uma com topo
 * de ícone gigante e quatro cards coloridos para dizer três números.
 *
 * **A ordem das categorias** (a do menu do blog) era trocada arrastando com
 * o mouse — sem teclado, sem toque. Agora arrasta pela alça com mouse ou
 * dedo (`ListaReordenavel`) e cada linha tem subir e descer; a nova ordem
 * vai para a API na hora.
 *
 * **Início do blog** (01/10): a ordem dos destaques do topo e das seções
 * de categoria, as duas arrastáveis.
 *
 * Criar e editar continuam nos formulários (`/blog/admin/categories/…` e
 * `/blog/admin/tags/…`), que têm imagem, cor, SEO e hierarquia.
 */

type Aba = 'categorias' | 'tags' | 'inicio';

const ENDERECO: Record<Aba, string> = {
  categorias: '/blog/admin/categories',
  tags: '/blog/admin/tags',
  inicio: '/blog/admin/home',
};

const contagem = (x: {
  articleCount?: number;
  _count?: { articles: number };
}) => x._count?.articles ?? x.articleCount ?? 0;

export default function TaxonomiaDoBlog({ inicial }: { inicial: Aba }) {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>(inicial);

  const trocar = (a: Aba) => {
    setAba(a);
    // O endereço acompanha a aba: dá para mandar o link e voltar pelo histórico.
    router.replace(ENDERECO[a], { scroll: false });
  };

  return (
    <Stack gap={6}>
      <Cabecalho
        titulo="Categorias e tags"
        descricao="Como os artigos do blog se organizam"
        acoes={
          <Link
            href={
              aba === 'categorias'
                ? '/blog/admin/categories/create'
                : '/blog/admin/tags/create'
            }
            className={classesDeBotao('primario', 'p')}
          >
            <Icon de={PiPlus} tamanho="pp" />{' '}
            {aba === 'categorias' ? 'Nova categoria' : 'Nova tag'}
          </Link>
        }
      />
      <Segmentos<Aba>
        rotulo="Categorias, tags ou início"
        valor={aba}
        aoMudar={trocar}
        opcoes={[
          { valor: 'categorias', rotulo: 'Categorias' },
          { valor: 'tags', rotulo: 'Tags' },
          { valor: 'inicio', rotulo: 'Início do blog' },
        ]}
      />
      {aba === 'categorias' ? (
        <Categorias />
      ) : aba === 'tags' ? (
        <Tags />
      ) : (
        <InicioDoBlog />
      )}
    </Stack>
  );
}

function Categorias() {
  const { data, loading, error } = useCategoriasAdmin();
  const ativar = useAtivarCategoria();
  const apagar = useApagarCategoria();
  const reordenar = useReordenarCategorias();
  const [apagando, setApagando] = useState<CategoriaAdmin | null>(null);

  const gravarOrdem = async (nova: CategoriaAdmin[]) => {
    try {
      await reordenar.mutateAsync([
        nova.map((c, i) => ({ id: c.id, order: i })),
      ]);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Não foi possível reordenar.'
      );
    }
  };

  if (loading)
    return (
      <Row.Lista>
        <Row.Skeleton repetir={5} />
      </Row.Lista>
    );
  if (error || !data)
    return (
      <Text papel="rotulo" tom="erro" as="p">
        {error ?? 'Sem dados.'}
      </Text>
    );
  if (data.length === 0)
    return (
      <Vazio
        titulo="Nenhuma categoria"
        descricao="Crie a primeira para organizar os artigos."
      />
    );

  const nomes = new Map(data.map((c) => [c.id, c.name]));

  return (
    <>
      <Text papel="legenda" as="p">
        A ordem daqui é a do menu do blog: arraste pela alça ou use as setas.{' '}
        {numero(data.filter((c) => c.isActive).length)} de {numero(data.length)}{' '}
        ativas.
      </Text>
      <ListaReordenavel
        itens={data}
        chave={(c) => c.id}
        nome={(c) => c.name}
        ocupado={reordenar.isPending}
        aoMudar={(nova) => void gravarOrdem(nova)}
      >
        {(c) => (
          <>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-[0.9375rem] font-medium text-texto">
                  {c.name}
                </span>
                {!c.isActive && <Badge>Inativa</Badge>}
                {!c.showInMenu && c.isActive && <Badge>Fora do menu</Badge>}
              </span>
              <span className="t-legenda">
                /{c.slug}
                {c.parentId
                  ? ` · dentro de ${nomes.get(c.parentId) ?? 'outra categoria'}`
                  : ''}
              </span>
            </span>
            <span className="t-dado w-20 text-right text-sm text-texto-suave">
              {numero(contagem(c))} artigos
            </span>
            <span className="flex gap-1">
              <Button
                tamanho="p"
                variante="fantasma"
                onClick={() => ativar.mutate([c.id, !c.isActive])}
                disabled={ativar.isPending}
              >
                {c.isActive ? 'Desativar' : 'Ativar'}
              </Button>
              <Link
                href={`/blog/admin/categories/edit/${c.id}`}
                className={classesDeBotao('fantasma', 'p', true)}
                aria-label={`Editar ${c.name}`}
              >
                <Icon de={PiPencilSimple} tamanho="pp" />
              </Link>
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiTrash}
                rotulo={
                  contagem(c)
                    ? `${c.name} tem artigos e não pode ser apagada`
                    : `Apagar ${c.name}`
                }
                title={
                  contagem(c)
                    ? 'Tem artigos: mova-os para outra categoria antes'
                    : undefined
                }
                disabled={contagem(c) > 0}
                onClick={() => setApagando(c)}
              />
            </span>
          </>
        )}
      </ListaReordenavel>
      <ConfirmModal
        isOpen={!!apagando}
        onClose={() => setApagando(null)}
        onConfirm={async () => {
          if (!apagando) return;
          try {
            await apagar.mutateAsync([apagando.id]);
            toast.success('Categoria apagada.');
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : 'Não foi possível apagar.'
            );
          }
          setApagando(null);
        }}
        type="danger"
        acaoPerigosa
        title="Apagar esta categoria?"
        message={
          apagando
            ? `“${apagando.name}” sai do blog. Se ela tiver subcategorias, a API recusa e diz quais.`
            : ''
        }
        confirmText="Apagar"
        cancelText="Voltar"
        isLoading={apagar.isPending}
      />
    </>
  );
}

function Tags() {
  const { data, loading, error } = useTagsAdmin();
  const apagar = useApagarTag();
  const [busca, setBusca] = useState('');
  const [apagando, setApagando] = useState<TagAdmin | null>(null);

  const visiveis = useMemo(() => {
    const t = busca.trim().toLowerCase();
    const todas = [...(data ?? [])].sort((a, b) => contagem(b) - contagem(a));
    return t
      ? todas.filter(
          (x) => x.name.toLowerCase().includes(t) || x.slug.includes(t)
        )
      : todas;
  }, [data, busca]);

  if (loading)
    return (
      <Row.Lista>
        <Row.Skeleton repetir={5} />
      </Row.Lista>
    );
  if (error || !data)
    return (
      <Text papel="rotulo" tom="erro" as="p">
        {error ?? 'Sem dados.'}
      </Text>
    );

  const semUso = data.filter((t) => contagem(t) === 0).length;

  return (
    <>
      <Busca
        valor={busca}
        aoMudar={setBusca}
        rotulo="Buscar tag"
        placeholder="Nome da tag"
      />
      <Text papel="legenda" as="p">
        {numero(data.length)} tags · {numero(semUso)} sem nenhum artigo
      </Text>
      {visiveis.length === 0 ? (
        <Vazio
          titulo="Nenhuma tag encontrada"
          descricao={busca ? `Nada com “${busca}”.` : 'Crie a primeira.'}
        />
      ) : (
        <ul className="sup-1 grid grid-cols-1 !p-0 md:grid-cols-2">
          {visiveis.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 border-b border-linha px-4 py-2.5 md:odd:border-r"
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[0.9375rem] text-texto">
                  {t.name}
                </span>
                <span className="t-legenda truncate">#{t.slug}</span>
              </span>
              <span
                className={
                  contagem(t)
                    ? 't-dado text-sm text-texto-suave'
                    : 't-dado text-sm text-texto-fraco'
                }
              >
                {numero(contagem(t))}
              </span>
              <Link
                href={`/blog/admin/tags/edit/${t.id}`}
                className={classesDeBotao('fantasma', 'p', true)}
                aria-label={`Editar ${t.name}`}
              >
                <Icon de={PiPencilSimple} tamanho="pp" />
              </Link>
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiTrash}
                rotulo={
                  contagem(t)
                    ? `#${t.slug} está em uso e não pode ser apagada`
                    : `Apagar ${t.name}`
                }
                title={
                  contagem(t)
                    ? 'Está em artigos: tire dos artigos antes'
                    : undefined
                }
                disabled={contagem(t) > 0}
                onClick={() => setApagando(t)}
              />
            </li>
          ))}
        </ul>
      )}
      <ConfirmModal
        isOpen={!!apagando}
        onClose={() => setApagando(null)}
        onConfirm={async () => {
          if (!apagando) return;
          try {
            await apagar.mutateAsync([apagando.id]);
            toast.success('Tag apagada.');
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : 'Não foi possível apagar.'
            );
          }
          setApagando(null);
        }}
        type="danger"
        acaoPerigosa
        title="Apagar esta tag?"
        message={
          apagando
            ? `#${apagando.slug} não está em nenhum artigo e sai da lista.`
            : ''
        }
        confirmText="Apagar"
        cancelText="Voltar"
        isLoading={apagar.isPending}
      />
    </>
  );
}

/**
 * O que aparece no início do blog, de cima para baixo: os destaques do topo
 * (até cinco artigos) e as seções de categoria com os últimos artigos.
 * Arrastar grava a ordem na hora. Pôr um artigo em destaque continua sendo
 * na escrita ou na lista de artigos; aqui ele pode sair.
 */
function InicioDoBlog() {
  const destaques = useDestaquesDoBlog();
  const reordenarDestaques = useReordenarDestaques();
  const destacar = useDestacarArtigo();
  const categorias = useCategoriasAdmin();
  const secoes = useSecoesDoInicio();
  const [acrescentar, setAcrescentar] = useState('');

  const comErro = async (f: () => Promise<unknown>, ok: string) => {
    try {
      await f();
      toast.success(ok);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível gravar.');
    }
  };

  const noInicio = [...(categorias.data ?? [])]
    .filter((c) => c.showOnHome)
    .sort(
      (a, b) => (a.homeOrder ?? 999) - (b.homeOrder ?? 999) || a.order - b.order
    );
  const fora = (categorias.data ?? []).filter(
    (c) => !c.showOnHome && c.isActive
  );

  return (
    <Stack gap={8}>
      <section
        aria-labelledby="destaques-inicio"
        className="flex flex-col gap-3"
      >
        <div>
          <h2 id="destaques-inicio" className="t-subtitulo">
            Destaques do topo
          </h2>
          <Text papel="legenda" as="p">
            O primeiro é o grande. Arraste pela alça ou use as setas.
          </Text>
        </div>
        {destaques.loading ? (
          <Row.Lista>
            <Row.Skeleton repetir={3} />
          </Row.Lista>
        ) : !destaques.data?.length ? (
          <Vazio
            titulo="Nenhum artigo em destaque"
            descricao="Sem destaques, o topo mostra os mais recentes. Destaque um artigo na escrita ou na lista de artigos."
          />
        ) : (
          <ListaReordenavel
            itens={[...destaques.data].sort(
              (a, b) => a.featuredOrder - b.featuredOrder
            )}
            chave={(a) => a.id}
            nome={(a) => a.title}
            ocupado={reordenarDestaques.isPending}
            aoMudar={(nova) =>
              void comErro(
                () =>
                  reordenarDestaques.mutateAsync([
                    nova.map((a, i) => ({ id: a.id, featuredOrder: i + 1 })),
                  ]),
                'Ordem dos destaques gravada.'
              )
            }
          >
            {(a, i) => (
              <>
                <span className="t-dado w-6 text-center text-sm text-texto-fraco">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium text-texto">
                  {a.title}
                </span>
                <Button
                  tamanho="p"
                  variante="fantasma"
                  disabled={destacar.isPending}
                  onClick={() =>
                    void comErro(
                      () => destacar.mutateAsync([a.id, false]),
                      'Saiu dos destaques.'
                    )
                  }
                >
                  Tirar do destaque
                </Button>
              </>
            )}
          </ListaReordenavel>
        )}
      </section>

      <section aria-labelledby="secoes-inicio" className="flex flex-col gap-3">
        <div>
          <h2 id="secoes-inicio" className="t-subtitulo">
            Seções de categoria
          </h2>
          <Text papel="legenda" as="p">
            Cada uma mostra os últimos artigos da categoria, nesta ordem.
            Categoria sem artigo publicado não aparece no blog.
          </Text>
        </div>
        {categorias.loading ? (
          <Row.Lista>
            <Row.Skeleton repetir={3} />
          </Row.Lista>
        ) : noInicio.length === 0 ? (
          <Vazio
            titulo="Nenhuma seção no início"
            descricao="Acrescente uma categoria abaixo."
          />
        ) : (
          <ListaReordenavel
            itens={noInicio}
            chave={(c) => c.id}
            nome={(c) => c.name}
            ocupado={secoes.isPending}
            aoMudar={(nova) =>
              void comErro(
                () => secoes.mutateAsync([nova.map((c) => c.id)]),
                'Ordem das seções gravada.'
              )
            }
          >
            {(c) => (
              <>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[0.9375rem] font-medium text-texto">
                    {c.name}
                  </span>
                  <span className="t-legenda">
                    {numero(contagem(c))} artigos
                  </span>
                </span>
                <Button
                  tamanho="p"
                  variante="fantasma"
                  disabled={secoes.isPending}
                  onClick={() =>
                    void comErro(
                      () =>
                        secoes.mutateAsync([
                          noInicio
                            .filter((x) => x.id !== c.id)
                            .map((x) => x.id),
                        ]),
                      'Seção tirada do início.'
                    )
                  }
                >
                  Tirar do início
                </Button>
              </>
            )}
          </ListaReordenavel>
        )}
        {fora.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-64">
              <Selecao
                aria-label="Categoria para acrescentar ao início"
                valor={acrescentar}
                aoMudar={setAcrescentar}
                opcoes={[
                  { value: '', label: 'Escolha uma categoria' },
                  ...fora.map((c) => ({ value: c.id, label: c.name })),
                ]}
                className="w-full"
              />
            </div>
            <Button
              tamanho="p"
              icone={PiPlus}
              disabled={!acrescentar || secoes.isPending}
              onClick={() =>
                void comErro(
                  () =>
                    secoes.mutateAsync([
                      [...noInicio.map((x) => x.id), acrescentar],
                    ]),
                  'Seção acrescentada no fim.'
                ).then(() => setAcrescentar(''))
              }
            >
              Acrescentar ao início
            </Button>
          </div>
        )}
      </section>
    </Stack>
  );
}
