'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { PiFlag, PiHeart, PiHeartFill } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Button } from '@/app/components/ui/Button';
import { Vazio, Erro } from '@/app/components/ui/Estados';
import { Field } from '@/app/components/ui/Field';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { useAuth } from '@/app/hooks/useAuth';
import { useLoginModal } from '@/app/stores/authStore';
import { BLOG, type Idioma } from '@/app/conteudo/blog';
import {
  createComment,
  deleteComment,
  loadComments,
  reportComment,
  setCommentLiked,
  updateComment,
  type LegacyComment,
} from '@/app/requests/blog/interactions';
import { Avatar } from './pecas';

/**
 * Os comentários do artigo.
 *
 * **Carregam quando a seção chega perto da tela**: quem não rola até o fim
 * não faz a chamada. Comentário nasce no ar (RN-4: denúncia é sinal, não
 * sentença); apagado com respostas vira "Comentário removido", para a
 * conversa dos outros não sumir. Respostas ficam um nível abaixo.
 */

type T = (typeof BLOG)[Idioma]['comentarios'];

const nomeDe = (c: LegacyComment, t: T) =>
  [c.user.firstName, c.user.lastName].filter(Boolean).join(' ').trim() ||
  t.anonimo;

function quando(data: Date, idioma: Idioma) {
  const segundos = (data.getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(idioma === 'en' ? 'en' : 'pt-BR', {
    numeric: 'auto',
  });
  const passos: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  for (const [unidade, duracao] of passos) {
    if (Math.abs(segundos) >= duracao) {
      return rtf.format(Math.round(segundos / duracao), unidade);
    }
  }
  return rtf.format(0, 'minute');
}

export function Comentarios({
  idioma,
  artigoId,
  total,
}: {
  idioma: Idioma;
  artigoId: string;
  total: number;
}) {
  const t = BLOG[idioma].comentarios;
  const { user, isAuthenticated } = useAuth();
  const { open: abrirLogin } = useLoginModal();
  const secao = useRef<HTMLElement>(null);

  const [lista, setLista] = useState<LegacyComment[] | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [apagando, setApagando] = useState<LegacyComment | null>(null);
  const [denunciando, setDenunciando] = useState<LegacyComment | null>(null);
  const [aviso, setAviso] = useState('');

  const carregar = useCallback(async () => {
    setFalhou(false);
    try {
      setLista(await loadComments(artigoId));
    } catch {
      setFalhou(true);
    }
  }, [artigoId]);

  useEffect(() => {
    const el = secao.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      void carregar();
      return;
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          observador.disconnect();
          void carregar();
        }
      },
      { rootMargin: '600px 0px' }
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [carregar]);

  const contagem = lista
    ? lista.reduce(
        (n, c) =>
          n + (c.deleted ? 0 : 1) + c.replies.filter((r) => !r.deleted).length,
        0
      )
    : total;

  async function publicar(texto: string, paiId?: string) {
    await createComment(artigoId, texto, paiId);
    await carregar();
  }

  async function confirmarApagar() {
    if (!apagando) return;
    try {
      await deleteComment(apagando.id);
      await carregar();
    } catch {
      setAviso(BLOG[idioma].acoes.erro);
    } finally {
      setApagando(null);
    }
  }

  return (
    <section
      ref={secao}
      id="comentarios"
      aria-labelledby="comentarios-titulo"
      className="flex scroll-mt-28 flex-col gap-6"
    >
      <h2
        id="comentarios-titulo"
        className="flex items-baseline gap-3 t-subtitulo"
      >
        {t.titulo}
        <span className="t-dado text-base text-texto-fraco">{contagem}</span>
      </h2>

      {isAuthenticated ? (
        <FormularioDeComentario
          rotulo={t.campo}
          dica={t.dica}
          t={t}
          aoPublicar={(texto) => publicar(texto)}
        />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-sup-2 p-5">
          <p className="t-rotulo text-texto-suave">{t.entrar}</p>
          <Button onClick={abrirLogin}>{BLOG[idioma].nav.entrar}</Button>
        </div>
      )}

      <p role="status" className="t-legenda empty:hidden">
        {aviso}
      </p>

      {falhou ? (
        <Erro
          titulo={t.erro}
          acao={<Button onClick={carregar}>{t.tentarDeNovo}</Button>}
        />
      ) : lista === null ? (
        <div className="flex flex-col gap-5" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-3.5">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : lista.length === 0 ? (
        <Vazio titulo={t.vazio} />
      ) : (
        <ul>
          {lista.map((c) => (
            <Comentario
              key={c.id}
              c={c}
              idioma={idioma}
              meuId={user?.id}
              logado={isAuthenticated}
              abrirLogin={abrirLogin}
              aoResponder={(texto) => publicar(texto, c.id)}
              aoEditar={async (id, texto) => {
                await updateComment(id, texto);
                await carregar();
              }}
              aoApagar={setApagando}
              aoDenunciar={setDenunciando}
            />
          ))}
        </ul>
      )}

      <ConfirmModal
        isOpen={!!apagando}
        onClose={() => setApagando(null)}
        onConfirm={confirmarApagar}
        title={t.apagarTitulo}
        message={t.apagarTexto}
        confirmText={t.apagar}
        cancelText={t.cancelar}
        type="danger"
        acaoPerigosa
      />

      <Denuncia
        comentario={denunciando}
        t={t}
        aoFechar={() => setDenunciando(null)}
        aoEnviar={async (motivo) => {
          if (!denunciando) return;
          await reportComment(denunciando.id, motivo);
          setDenunciando(null);
          setAviso(t.denunciado);
        }}
      />
    </section>
  );
}

function FormularioDeComentario({
  rotulo,
  dica,
  t,
  inicial = '',
  aoPublicar,
  aoCancelar,
  textoDoBotao,
}: {
  rotulo: string;
  dica: string;
  t: T;
  inicial?: string;
  aoPublicar: (texto: string) => Promise<void>;
  aoCancelar?: () => void;
  textoDoBotao?: string;
}) {
  const [texto, setTexto] = useState(inicial);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string>();

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (texto.trim().length < 2) return;
    setEnviando(true);
    setErro(undefined);
    try {
      await aoPublicar(texto.trim());
      setTexto('');
      aoCancelar?.();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : String(falha));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3">
      <Field.Area
        label={rotulo}
        rows={3}
        maxLength={2000}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={dica}
        erro={erro}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="t-legenda">{t.regras}</p>
        <div className="flex gap-2">
          {aoCancelar && (
            <Button variante="fantasma" onClick={aoCancelar}>
              {t.cancelar}
            </Button>
          )}
          <Button
            type="submit"
            carregando={enviando}
            disabled={texto.trim().length < 2}
          >
            {textoDoBotao ?? t.publicar}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Comentario({
  c,
  idioma,
  meuId,
  logado,
  abrirLogin,
  aoResponder,
  aoEditar,
  aoApagar,
  aoDenunciar,
  resposta = false,
}: {
  c: LegacyComment;
  idioma: Idioma;
  meuId?: string;
  logado: boolean;
  abrirLogin: () => void;
  aoResponder: (texto: string) => Promise<void>;
  aoEditar: (id: string, texto: string) => Promise<void>;
  aoApagar: (c: LegacyComment) => void;
  aoDenunciar: (c: LegacyComment) => void;
  resposta?: boolean;
}) {
  const t = BLOG[idioma].comentarios;
  const [respondendo, setRespondendo] = useState(false);
  const [editando, setEditando] = useState(false);
  const [curtiu, setCurtiu] = useState(!!c.userLiked);
  const [curtidas, setCurtidas] = useState(c._count.likes);
  const meu = !!meuId && c.user.id === meuId;
  const nome = nomeDe(c, t);

  async function curtir() {
    if (!logado) return abrirLogin();
    const novo = !curtiu;
    setCurtiu(novo);
    setCurtidas((n) => n + (novo ? 1 : -1));
    try {
      await setCommentLiked(c.id, novo);
    } catch {
      setCurtiu(!novo);
      setCurtidas((n) => n + (novo ? -1 : 1));
    }
  }

  return (
    <li
      className={cx(
        'flex gap-3.5 py-5',
        resposta ? 'pb-0' : 'border-t border-linha'
      )}
    >
      <Avatar
        autor={{ nome, imagem: c.deleted ? null : c.user.image }}
        tamanho={resposta ? 'p' : 'm'}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {c.deleted ? (
          <p className="t-rotulo italic text-texto-fraco">{t.removido}</p>
        ) : (
          <>
            <p className="flex flex-wrap items-baseline gap-x-3 text-[0.9375rem]">
              <span className="font-medium">{nome}</span>
              <time dateTime={c.createdAt.toISOString()} className="t-legenda">
                {quando(c.createdAt, idioma)}
              </time>
              {c.isEdited && <span className="t-legenda">{t.editado}</span>}
            </p>
            {editando ? (
              <FormularioDeComentario
                rotulo={t.editar}
                dica={t.dica}
                t={t}
                inicial={c.content}
                textoDoBotao={t.salvar}
                aoPublicar={(texto) => aoEditar(c.id, texto)}
                aoCancelar={() => setEditando(false)}
              />
            ) : (
              <p className="t-corpo whitespace-pre-line break-words text-texto-suave">
                {c.content}
              </p>
            )}
            {!editando && (
              <div className="-ml-2 flex flex-wrap items-center gap-1">
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={curtiu ? PiHeartFill : PiHeart}
                  aria-pressed={curtiu}
                  onClick={curtir}
                  className={curtiu ? 'text-ouro-texto' : undefined}
                >
                  <span className="t-dado" aria-hidden="true">
                    {curtidas}
                  </span>
                  <span className="sr-only">{t.curtir}</span>
                </Button>
                {!resposta && (
                  <Button
                    tamanho="p"
                    variante="fantasma"
                    onClick={() =>
                      logado ? setRespondendo((r) => !r) : abrirLogin()
                    }
                  >
                    {t.responder}
                  </Button>
                )}
                {meu ? (
                  <>
                    <Button
                      tamanho="p"
                      variante="fantasma"
                      onClick={() => setEditando(true)}
                    >
                      {t.editar}
                    </Button>
                    <Button
                      tamanho="p"
                      variante="fantasma"
                      onClick={() => aoApagar(c)}
                    >
                      {t.apagar}
                    </Button>
                  </>
                ) : (
                  logado && (
                    <Button
                      tamanho="p"
                      variante="fantasma"
                      icone={PiFlag}
                      onClick={() => aoDenunciar(c)}
                    >
                      {t.denunciar}
                    </Button>
                  )
                )}
              </div>
            )}
          </>
        )}

        {respondendo && (
          <div className="pt-2">
            <FormularioDeComentario
              rotulo={t.resposta}
              dica={t.dica}
              t={t}
              textoDoBotao={t.responder}
              aoPublicar={aoResponder}
              aoCancelar={() => setRespondendo(false)}
            />
          </div>
        )}

        {c.replies.length > 0 && (
          <ul className="flex flex-col">
            {c.replies.map((r) => (
              <Comentario
                key={r.id}
                c={r}
                idioma={idioma}
                meuId={meuId}
                logado={logado}
                abrirLogin={abrirLogin}
                aoResponder={aoResponder}
                aoEditar={aoEditar}
                aoApagar={aoApagar}
                aoDenunciar={aoDenunciar}
                resposta
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function Denuncia({
  comentario,
  t,
  aoFechar,
  aoEnviar,
}: {
  comentario: LegacyComment | null;
  t: T;
  aoFechar: () => void;
  aoEnviar: (motivo: string) => Promise<void>;
}) {
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);

  return (
    <Sheet
      aberto={!!comentario}
      aoFechar={aoFechar}
      titulo={t.denunciarTitulo}
      largura="p"
      rodape={
        <Button
          variante="primario"
          carregando={enviando}
          disabled={motivo.trim().length < 5}
          onClick={async () => {
            setEnviando(true);
            try {
              await aoEnviar(motivo.trim());
              setMotivo('');
            } finally {
              setEnviando(false);
            }
          }}
        >
          {t.denunciar}
        </Button>
      }
    >
      {comentario && (
        <div className="flex flex-col gap-4">
          <p className="t-rotulo rounded-controle bg-sup-2 p-3 text-texto-suave">
            “{comentario.content}”
          </p>
          <Field.Area
            label={t.denunciarMotivo}
            rows={3}
            maxLength={500}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>
      )}
    </Sheet>
  );
}
