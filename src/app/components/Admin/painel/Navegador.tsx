'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Stack } from '@/app/components/ui/Layout';
import { Row } from '@/app/components/ui/Row';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { FichaAula } from '@/app/components/Admin/fichas/FichaAula';
import { FichaEvento } from '@/app/components/Admin/fichas/FichaEvento';
import { FichaTarefa } from '@/app/components/Admin/fichas/FichaTarefa';
import { FichaCompositor } from '@/app/components/Admin/fichas/FichaCompositor';
import { FichaObra } from '@/app/components/Admin/fichas/FichaObra';
import { FichaPartitura } from '@/app/components/Admin/fichas/FichaPartitura';
import { FichaUsuario } from '@/app/components/Admin/fichas/FichaUsuario';
import {
  adminKeys,
  useAdminInfinite,
  useAdminQuery,
} from '@/app/hooks/admin/query';
import {
  getCompositor,
  getObra,
  getPessoasDaObra,
  type Compositor,
  type Obra,
  type PessoaDaObra,
  type UsoDaObra,
} from '@/app/requests/admin/catalogo';
import { Avatar } from './Avatar';
import { Cadastro, type CadastroAberto } from './Cadastros';
import { dataCurta, numero } from './formatos';

/**
 * O navegador do painel: abre a ficha de qualquer registro — conta,
 * compositor, obra, partitura, evento da agenda, quem favoritou uma obra — de qualquer tela,
 * uma por cima da outra. Fechar tira só a de cima.
 *
 * É o que deixa navegar pelos dados: da obra para quem a favoritou, dessa
 * pessoa para os envios dela, do envio para o compositor, sem voltar à
 * lista. As telas pedem por `useNavegar()`; a casca (`AdminShell`) monta o
 * provedor.
 */

type Entrada =
  | { tipo: 'usuario'; id: string }
  | { tipo: 'compositor'; id: string; inicial?: Compositor }
  | { tipo: 'obra'; id: string; inicial?: Obra }
  | { tipo: 'partitura'; id: string }
  | { tipo: 'evento'; id: string }
  | { tipo: 'aula'; id: string }
  | { tipo: 'tarefa'; id: string }
  | { tipo: 'pessoas'; workId: string; titulo: string; kind: UsoDaObra }
  | { tipo: 'cadastro'; cadastro: CadastroAberto };

interface Navegar {
  usuario: (id: string) => void;
  compositor: (id: string, inicial?: Compositor) => void;
  obra: (id: string, inicial?: Obra) => void;
  partitura: (id: string) => void;
  evento: (id: string) => void;
  aula: (id: string) => void;
  tarefa: (id: string) => void;
  pessoasDaObra: (workId: string, titulo: string, kind: UsoDaObra) => void;
  editarCadastro: (cadastro: CadastroAberto) => void;
}

const Contexto = createContext<Navegar | null>(null);

export function useNavegar(): Navegar {
  const n = useContext(Contexto);
  if (!n) throw new Error('useNavegar fora do NavegadorDoPainel');
  return n;
}

export function NavegadorDoPainel({ children }: { children: ReactNode }) {
  const [pilha, setPilha] = useState<Array<Entrada & { chave: number }>>([]);
  // Um número da ficha que leva a outra tela ("ver as obras dele") fecha as
  // fichas: a casca não desmonta ao navegar, e elas cobririam a tela nova.
  const rota = usePathname();
  useEffect(() => setPilha([]), [rota]);

  const abrir = useCallback((e: Entrada) => {
    setPilha((p) => [...p, { ...e, chave: Date.now() + Math.random() }]);
  }, []);
  const fechar = useCallback((chave: number) => {
    setPilha((p) => p.filter((x) => x.chave !== chave));
  }, []);

  const navegar = useMemo<Navegar>(
    () => ({
      usuario: (id) => abrir({ tipo: 'usuario', id }),
      compositor: (id, inicial) => abrir({ tipo: 'compositor', id, inicial }),
      obra: (id, inicial) => abrir({ tipo: 'obra', id, inicial }),
      partitura: (id) => abrir({ tipo: 'partitura', id }),
      evento: (id) => abrir({ tipo: 'evento', id }),
      aula: (id) => abrir({ tipo: 'aula', id }),
      tarefa: (id) => abrir({ tipo: 'tarefa', id }),
      pessoasDaObra: (workId, titulo, kind) =>
        abrir({ tipo: 'pessoas', workId, titulo, kind }),
      editarCadastro: (cadastro) => abrir({ tipo: 'cadastro', cadastro }),
    }),
    [abrir]
  );

  return (
    <Contexto.Provider value={navegar}>
      {children}
      {pilha.map((e) => {
        const sair = () => fechar(e.chave);
        switch (e.tipo) {
          case 'usuario':
            return (
              <FichaUsuario key={e.chave} usuarioId={e.id} aoFechar={sair} />
            );
          case 'compositor':
            return (
              <CompositorPorId
                key={e.chave}
                id={e.id}
                inicial={e.inicial}
                aoFechar={sair}
                aoEditarCadastro={(id) =>
                  navegar.editarCadastro({ tipo: 'composer', id })
                }
              />
            );
          case 'obra':
            return (
              <ObraPorId
                key={e.chave}
                id={e.id}
                inicial={e.inicial}
                aoFechar={sair}
                aoEditarCadastro={(id) =>
                  navegar.editarCadastro({ tipo: 'work', id })
                }
              />
            );
          case 'partitura':
            return (
              <FichaPartitura
                key={e.chave}
                partituraId={e.id}
                aoFechar={sair}
              />
            );
          case 'evento':
            return (
              <FichaEvento key={e.chave} eventoId={e.id} aoFechar={sair} />
            );
          case 'aula':
            return <FichaAula key={e.chave} aulaId={e.id} aoFechar={sair} />;
          case 'tarefa':
            return (
              <FichaTarefa key={e.chave} tarefaId={e.id} aoFechar={sair} />
            );
          case 'pessoas':
            return (
              <PessoasDaObra
                key={e.chave}
                workId={e.workId}
                titulo={e.titulo}
                kind={e.kind}
                aoFechar={sair}
              />
            );
          case 'cadastro':
            return (
              <Cadastro key={e.chave} aberto={e.cadastro} aoFechar={sair} />
            );
        }
      })}
    </Contexto.Provider>
  );
}

function CompositorPorId({
  id,
  inicial,
  aoFechar,
  aoEditarCadastro,
}: {
  id: string;
  inicial?: Compositor;
  aoFechar: () => void;
  aoEditarCadastro: (id: string) => void;
}) {
  const q = useAdminQuery(
    adminKeys.list('catalogo', { compositor: id }),
    () => getCompositor(id),
    { enabled: !inicial }
  );
  const c = inicial ?? q.data ?? null;
  if (!c)
    return (
      <Carregando titulo="Compositor" erro={q.error} aoFechar={aoFechar} />
    );
  return (
    <FichaCompositor
      compositor={c}
      aoFechar={aoFechar}
      aoEditarCadastro={aoEditarCadastro}
    />
  );
}

function ObraPorId({
  id,
  inicial,
  aoFechar,
  aoEditarCadastro,
}: {
  id: string;
  inicial?: Obra;
  aoFechar: () => void;
  aoEditarCadastro: (id: string) => void;
}) {
  const q = useAdminQuery(
    adminKeys.list('catalogo', { obra: id }),
    () => getObra(id),
    { enabled: !inicial }
  );
  const o = inicial ?? q.data ?? null;
  if (!o)
    return <Carregando titulo="Obra" erro={q.error} aoFechar={aoFechar} />;
  return (
    <FichaObra
      obra={o}
      aoFechar={aoFechar}
      aoEditarCadastro={aoEditarCadastro}
    />
  );
}

function Carregando({
  titulo,
  erro,
  aoFechar,
}: {
  titulo: string;
  erro: string | null;
  aoFechar: () => void;
}) {
  return (
    <Sheet aberto aoFechar={aoFechar} titulo={titulo} largura="g">
      {erro ? (
        <Text papel="rotulo" tom="erro" as="p">
          {erro}
        </Text>
      ) : (
        <Row.Skeleton repetir={5} />
      )}
    </Sheet>
  );
}

const TITULO_USO: Record<UsoDaObra, string> = {
  favoritos: 'Quem favoritou',
  'quero-aprender': 'Quem quer aprender',
  aprendidas: 'Quem aprendeu',
};

/** Quem favoritou, quer aprender ou aprendeu uma obra; cada pessoa abre. */
function PessoasDaObra({
  workId,
  titulo,
  kind,
  aoFechar,
}: {
  workId: string;
  titulo: string;
  kind: UsoDaObra;
  aoFechar: () => void;
}) {
  const navegar = useNavegar();
  const lista = useAdminInfinite<PessoaDaObra>(
    adminKeys.list('catalogo', { pessoas: workId, kind }),
    async (cursor) => {
      const pagina = cursor ? Number(cursor) : 1;
      const r = await getPessoasDaObra(workId, kind, pagina);
      return {
        items: r.items,
        total: r.pagination.total,
        nextCursor:
          pagina < r.pagination.totalPages ? String(pagina + 1) : null,
      };
    }
  );

  return (
    <Sheet
      aberto
      aoFechar={aoFechar}
      titulo={TITULO_USO[kind]}
      descricao={`${titulo}${lista.total !== null ? ` · ${numero(lista.total)}` : ''}`}
      largura="m"
    >
      {lista.loading ? (
        <Row.Skeleton repetir={5} />
      ) : lista.items.length === 0 ? (
        <Text papel="rotulo" tom="suave" as="p">
          Ninguém ainda.
        </Text>
      ) : (
        <Stack gap={3}>
          <ul className="flex flex-col">
            {lista.items.map((p) => {
              const nome = p.user
                ? [p.user.firstName, p.user.lastName]
                    .filter(Boolean)
                    .join(' ') ||
                  p.user.username ||
                  p.user.email ||
                  'Conta sem nome'
                : 'Conta removida';
              return (
                <li key={p.id} className="border-b border-linha last:border-0">
                  <button
                    type="button"
                    disabled={!p.user}
                    onClick={() => p.user && navegar.usuario(p.user.id)}
                    className="-mx-2 flex min-h-11 w-[calc(100%+1rem)] items-center gap-3 rounded-controle px-2 py-2 text-left transition-colors enabled:hover:bg-[var(--interactive-hover)]"
                  >
                    <Avatar nome={nome} imagem={p.user?.image} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[0.9375rem] text-texto">
                        {nome}
                      </span>
                      <span className="t-legenda truncate">
                        {[p.user?.email, p.detalhe].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    {p.em && (
                      <span className="t-legenda t-dado shrink-0">
                        {dataCurta(p.em)}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {lista.hasMore && (
            <Button
              tamanho="p"
              variante="texto"
              onClick={lista.loadMore}
              carregando={lista.loadingMore}
            >
              Carregar mais
            </Button>
          )}
        </Stack>
      )}
    </Sheet>
  );
}

/**
 * Um nome que abre outro registro no painel: texto com sublinhado ao passar,
 * sem cara de botão — é um elo na leitura, não uma ação.
 */
export function Elo({
  onClick,
  children,
  className,
}: {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        // Dentro de uma linha clicável, o elo abre só o registro dele.
        e.stopPropagation();
        onClick();
      }}
      className={cx(
        'text-left text-texto underline decoration-linha-forte underline-offset-4 transition-colors hover:decoration-ouro',
        className
      )}
    >
      {children}
    </button>
  );
}

/**
 * Leva a outra tela do painel já filtrada (`/admin/works?compositor=…`).
 * As telas leem o filtro da URL ao montar; se a pessoa já está nessa tela,
 * o `router.push` não remonta nada e o filtro seria ignorado — aí a página
 * recarrega.
 */
export function irParaTela(
  router: { push: (url: string) => void },
  url: string
) {
  const destino = new URL(url, window.location.origin);
  if (destino.pathname === window.location.pathname) {
    window.location.assign(url);
  } else {
    router.push(url);
  }
}
