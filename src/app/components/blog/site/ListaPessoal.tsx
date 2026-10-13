'use client';

import { useCallback, useEffect, useState } from 'react';
import { recarregarTudo } from '@/app/libs/pwa/recarregar';
import Link from 'next/link';
import { PiBookmarkSimple, PiHeart } from 'react-icons/pi';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Erro, Vazio } from '@/app/components/ui/Estados';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { useAuth } from '@/app/hooks/useAuth';
import { apiFetch } from '@/app/libs/api/client';
import { useLoginModal } from '@/app/stores/authStore';
import { BLOG, type Idioma } from '@/app/conteudo/blog';
import {
  resumoDeArtigo,
  type ResumoDeArtigo,
} from '@/app/requests/blog/leitura';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import { Cartao } from './cartoes';

/**
 * Os artigos salvos ou curtidos de quem está lendo. Por pessoa: carrega no
 * navegador, com a sessão, e nunca passa por cache.
 */
export function ListaPessoal({
  idioma,
  tipo,
}: {
  idioma: Idioma;
  tipo: 'salvos' | 'curtidos';
}) {
  const t = BLOG[idioma].pessoal;
  const { isAuthenticated, isLoading } = useAuth();
  const { open: abrirLogin } = useLoginModal();
  const [artigos, setArtigos] = useState<ResumoDeArtigo[] | null>(null);
  const [pagina, setPagina] = useState(1);
  const [paginas, setPaginas] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [falhou, setFalhou] = useState(false);

  const caminho = tipo === 'salvos' ? 'my-bookmarks' : 'my-likes';
  const chave = tipo === 'salvos' ? 'bookmarks' : 'likes';

  const carregar = useCallback(
    async (n: number) => {
      setCarregando(true);
      setFalhou(false);
      try {
        const data = await apiFetch<
          { pagination?: { totalPages: number } } & Partial<
            Record<'likes' | 'bookmarks', Array<{ article: unknown }>>
          >
        >(`/blog/interactions/${caminho}`, {
          query: { page: n, limit: 12 },
          cache: 'no-store',
        });
        const novos = (data[chave] ?? []).map((e) => resumoDeArtigo(e.article));
        setArtigos((atuais) =>
          n === 1 ? novos : [...(atuais ?? []), ...novos]
        );
        setPaginas(data.pagination?.totalPages ?? 1);
        setPagina(n);
      } catch {
        setFalhou(true);
      } finally {
        setCarregando(false);
      }
    },
    [caminho, chave]
  );

  useEffect(() => {
    if (isAuthenticated) void carregar(1);
  }, [isAuthenticated, carregar]);

  const icone = tipo === 'salvos' ? PiBookmarkSimple : PiHeart;

  if (!isLoading && !isAuthenticated) {
    return (
      <Vazio
        icone={icone}
        titulo={t.entrar}
        acao={
          <Button variante="primario" onClick={abrirLogin}>
            {BLOG[idioma].nav.entrar}
          </Button>
        }
      />
    );
  }

  if (falhou && !artigos) {
    return (
      <Erro
        titulo={t.erro}
        acao={
          <Button onClick={() => void recarregarTudo()}>
            {BLOG[idioma].comentarios.tentarDeNovo}
          </Button>
        }
      />
    );
  }

  if (!artigos) {
    return (
      <div
        aria-hidden="true"
        className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
      >
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[3/2] h-auto w-full rounded-card" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (artigos.length === 0) {
    return (
      <Vazio
        icone={icone}
        titulo={tipo === 'salvos' ? t.salvosVazio : t.curtidosVazio}
        descricao={t.vazioDescricao}
        acao={
          <Link
            href={rotasDoBlog.artigos(idioma)}
            className={classesDeBotao('primario', 'm')}
          >
            {t.explorar}
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <ul className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {artigos.map((artigo) => (
          <li key={artigo.id}>
            <Cartao artigo={artigo} idioma={idioma} comResumo />
          </li>
        ))}
      </ul>
      {pagina < paginas && (
        <Button
          className="self-center"
          carregando={carregando}
          onClick={() => carregar(pagina + 1)}
        >
          {t.carregarMais}
        </Button>
      )}
    </div>
  );
}
