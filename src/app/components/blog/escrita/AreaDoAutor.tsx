'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { PiNotePencil, PiPlus } from 'react-icons/pi';
import { Badge } from '@/app/components/ui/Badge';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Erro, Vazio } from '@/app/components/ui/Estados';
import { Icon } from '@/app/components/ui/Icon';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { cx } from '@/app/components/ui/cx';
import { useAuth } from '@/app/hooks/useAuth';
import { useLoginModal } from '@/app/stores/authStore';
import {
  loadMyArticles,
  type MeuArtigo,
} from '@/app/requests/blog/admin-actions';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import { Capa } from '@/app/components/blog/site/Capa';
import { dataCurta } from '@/app/utils/blog/formatos';

/** Quem escreve no blog: administrador, ou professor. */
export function useEscritor() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const admin = (user?.role ?? 0) >= 2;
  const professor = !!user?.isTeacher;
  return {
    carregando: isLoading,
    entrou: isAuthenticated,
    admin,
    escreve: admin || professor,
  };
}

/**
 * A guarda das páginas de autor (escrever, editar, meus artigos). A API é
 * quem decide de verdade (professor aprovado ou administrador); aqui é só
 * para não abrir um formulário que não vai salvar.
 */
export function GuardaDeAutor({ children }: { children: ReactNode }) {
  const { carregando, entrou, escreve } = useEscritor();
  const { open: abrirLogin } = useLoginModal();
  if (carregando) return <Skeleton className="h-[28rem] w-full rounded-card" />;
  if (!entrou) {
    return (
      <Vazio
        titulo="Entre para escrever"
        descricao="Professores e administradores escrevem no blog."
        acao={
          <button
            type="button"
            onClick={abrirLogin}
            className={classesDeBotao('primario')}
          >
            Entrar
          </button>
        }
      />
    );
  }
  if (!escreve) {
    return (
      <Vazio
        titulo="Escrever é para professores"
        descricao="Se você dá aula, peça o seu cadastro de professor no seu perfil."
      />
    );
  }
  return <>{children}</>;
}

const ESTADO: Record<string, string> = {
  DRAFT: 'Rascunho',
  REVIEW: 'Em revisão',
  SCHEDULED: 'Agendado',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Arquivado',
};

/**
 * "Meus artigos": tudo o que a pessoa escreveu, em qualquer estado. O
 * administrador edita pelo painel; o professor, pela escrita de autor — e
 * só enquanto o artigo não foi ao ar.
 */
export function MeusArtigos() {
  const { admin } = useEscritor();
  const [artigos, setArtigos] = useState<MeuArtigo[] | null>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    loadMyArticles()
      .then(setArtigos)
      .catch(() => setFalhou(true));
  }, []);

  const novo = admin ? rotasDoBlog.escrever() : rotasDoBlog.escreverComoAutor();

  if (falhou) return <Erro titulo="Não deu para carregar os seus artigos." />;
  if (!artigos) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-card" />
        ))}
      </div>
    );
  }
  if (!artigos.length) {
    return (
      <Vazio
        icone={PiNotePencil}
        titulo="Você ainda não escreveu"
        descricao="O primeiro artigo começa como rascunho; quando estiver pronto, vai para revisão."
        acao={
          <Link href={novo} className={classesDeBotao('primario')}>
            <Icon de={PiPlus} tamanho="p" />
            Escrever artigo
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={novo}
        className={cx(classesDeBotao('primario'), 'self-start')}
      >
        <Icon de={PiPlus} tamanho="p" />
        Escrever artigo
      </Link>
      <ul className="flex flex-col">
        {artigos.map((a) => {
          const noAr = a.status === 'PUBLISHED';
          const editavel =
            admin || a.status === 'DRAFT' || a.status === 'REVIEW';
          const href = noAr
            ? rotasDoBlog.artigo(a.slug)
            : editavel
              ? admin
                ? rotasDoBlog.editar(a.id)
                : rotasDoBlog.editarComoAutor(a.id)
              : rotasDoBlog.previa(a.slug);
          return (
            <li
              key={a.id}
              className="relative grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-4 border-b border-linha py-4 last:border-b-0 sm:grid-cols-[7rem_minmax(0,1fr)_auto]"
            >
              <Capa
                src={a.coverImage}
                alt=""
                inicial={a.title}
                sizes="112px"
                className="aspect-[4/3] rounded-controle"
              />
              <div className="flex min-w-0 flex-col gap-1">
                <Link
                  href={href}
                  className="blog-titulo-link font-display text-[1.375rem] leading-snug"
                >
                  {a.title}
                </Link>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-texto-fraco">
                  <Badge>{ESTADO[a.status] ?? a.status}</Badge>
                  <span className="t-dado">
                    {noAr && a.publishedAt
                      ? dataCurta(a.publishedAt)
                      : `editado ${dataCurta(a.updatedAt)}`}
                  </span>
                  {noAr && (
                    <span className="t-dado">{a.viewCount} leituras</span>
                  )}
                </p>
              </div>
              {noAr && admin && (
                <Link
                  href={rotasDoBlog.editar(a.id)}
                  className={cx(
                    classesDeBotao('fantasma', 'p'),
                    'relative z-10 max-sm:hidden'
                  )}
                >
                  Editar
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
