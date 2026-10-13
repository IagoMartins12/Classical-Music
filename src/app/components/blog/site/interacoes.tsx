'use client';

import { NumeroVivo } from '@/app/components/ui/NumeroVivo';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import {
  PiBookmarkSimple,
  PiBookmarkSimpleFill,
  PiCheck,
  PiEnvelopeSimple,
  PiHeart,
  PiHeartFill,
  PiShareNetwork,
} from 'react-icons/pi';
import { Capa } from './Capa';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { useShare } from '@/app/components/ui/ShareSheet';
import { cx } from '@/app/components/ui/cx';
import { useAuth } from '@/app/hooks/useAuth';
import { useLoginModal } from '@/app/stores/authStore';
import { BLOG, type Idioma } from '@/app/conteudo/blog';
import {
  loadArticleInteractions,
  setArticleBookmarked,
  setArticleLiked,
} from '@/app/requests/blog/interactions';
import { registrarLeitura, registrarVisita } from '@/app/requests/blog/leitura';
import {
  resendNewsletterConfirmation,
  subscribeToNewsletter,
} from '@/app/requests/newsletter';

// ---------------------------------------------------------------------------
// Curtir, salvar, compartilhar
// ---------------------------------------------------------------------------

/**
 * As ações do artigo. A página é estática: o "curtiu" e o "salvou" de quem
 * lê chegam depois, do navegador. Sem conta, o clique abre o login — a
 * pessoa não perde o lugar.
 */
export function AcoesDoArtigo({
  idioma,
  artigoId,
  titulo,
  url,
  capa = null,
  curtidasIniciais,
  empilhado = false,
}: {
  idioma: Idioma;
  artigoId: string;
  titulo: string;
  url: string;
  capa?: string | null;
  curtidasIniciais: number;
  /** Um botão por linha (a lateral do computador). */
  empilhado?: boolean;
}) {
  const t = BLOG[idioma].acoes;
  const { isAuthenticated } = useAuth();
  const { open: abrirLogin } = useLoginModal();
  const [curtiu, setCurtiu] = useState(false);
  const [salvou, setSalvou] = useState(false);
  const [curtidas, setCurtidas] = useState(curtidasIniciais);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    loadArticleInteractions(artigoId)
      .then((estado) => {
        setCurtiu(estado.isLiked);
        setSalvou(estado.isBookmarked);
        setCurtidas(estado.likesCount);
      })
      .catch(() => undefined);
  }, [artigoId, isAuthenticated]);

  async function alternarCurtida() {
    if (!isAuthenticated) {
      setAviso(t.entrarPara);
      abrirLogin();
      return;
    }
    const novo = !curtiu;
    setCurtiu(novo);
    setCurtidas((n) => n + (novo ? 1 : -1));
    try {
      await setArticleLiked(artigoId, novo);
      avisar(
        novo ? t.curtiuAviso : t.descurtiuAviso,
        novo ? PiHeartFill : PiHeart
      );
    } catch {
      setCurtiu(!novo);
      setCurtidas((n) => n + (novo ? -1 : 1));
      setAviso(t.erro);
    }
  }

  async function alternarSalvo() {
    if (!isAuthenticated) {
      setAviso(t.entrarPara);
      abrirLogin();
      return;
    }
    const novo = !salvou;
    setSalvou(novo);
    try {
      await setArticleBookmarked(artigoId, novo);
      avisar(
        novo ? t.salvouAviso : t.tirouAviso,
        novo ? PiBookmarkSimpleFill : PiBookmarkSimple
      );
    } catch {
      setSalvou(!novo);
      setAviso(t.erro);
    }
  }

  const { share: compartilhar, sheet: folhaDeCompartilhar } = useShare({
    title: titulo,
    url,
    copy: {
      title: t.compartilhar,
      shareOn: t.compartilharEm,
      copyLink: t.copiar,
      copied: t.copiado,
      email: t.email,
    },
    thumbnail: (
      <Capa
        src={capa}
        alt=""
        inicial={titulo}
        sizes="80px"
        className="aspect-square w-16 shrink-0 rounded-controle"
      />
    ),
  });

  return (
    <div className={cx('flex flex-col gap-2', empilhado ? 'items-start' : '')}>
      <div
        role="group"
        aria-label={t.grupo}
        className={cx(
          'flex gap-1',
          empilhado ? 'flex-col items-start' : 'flex-wrap items-center'
        )}
      >
        <Button
          tamanho="p"
          variante="fantasma"
          icone={curtiu ? PiHeartFill : PiHeart}
          aria-pressed={curtiu}
          onClick={alternarCurtida}
          className={curtiu ? 'text-ouro-texto' : undefined}
        >
          <NumeroVivo valor={curtidas} className="t-dado" oculto />
          <span className="sr-only">
            {t.curtidas(curtidas)}. {curtiu ? t.curtido : t.curtir}
          </span>
        </Button>
        <Button
          tamanho="p"
          variante="fantasma"
          icone={salvou ? PiBookmarkSimpleFill : PiBookmarkSimple}
          aria-pressed={salvou}
          onClick={alternarSalvo}
          className={salvou ? 'text-ouro-texto' : undefined}
        >
          {salvou ? t.salvo : t.salvar}
        </Button>
        <Button
          tamanho="p"
          variante="fantasma"
          icone={PiShareNetwork}
          onClick={compartilhar}
        >
          {t.compartilhar}
        </Button>
      </div>
      <p role="status" className="t-legenda empty:hidden">
        {aviso}
      </p>

      {folhaDeCompartilhar}
    </div>
  );
}

/**
 * Aviso curto no canto de cima, à direita: curtir, salvar, copiar o link.
 * Fica longe da barra do player (embaixo) e do botão que foi tocado.
 */
function avisar(texto: string, icone: typeof PiHeart) {
  toast(texto, {
    position: 'top-right',
    duration: 2400,
    icon: <Icon de={icone} className="text-ouro-texto" />,
  });
}

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------

/** Inscrição com confirmação por e-mail (dupla), como a API faz. */
export function Newsletter({
  idioma,
  origem,
  empilhado = false,
  className,
}: {
  idioma: Idioma;
  /** De onde veio a inscrição (vai para a API, para a métrica). */
  origem: string;
  empilhado?: boolean;
  className?: string;
}) {
  const t = BLOG[idioma].newsletter;
  const [estado, setEstado] = useState<
    'parado' | 'enviando' | 'confirmar' | 'ja'
  >('parado');
  const [erro, setErro] = useState<string>();
  const [podeReenviar, setPodeReenviar] = useState(false);
  const email = useRef('');

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const valor = String(
      new FormData(e.currentTarget).get('email') ?? ''
    ).trim();
    email.current = valor;
    if (!/^\S+@\S+\.\S+$/.test(valor)) {
      setErro(t.invalido);
      return;
    }
    setErro(undefined);
    setEstado('enviando');
    try {
      const r = await subscribeToNewsletter({
        email: valor,
        sourceUrl: window.location.href,
        utmSource: origem,
      });
      if (r.success) {
        setEstado('confirmar');
        avisar(t.enviadoAviso, PiEnvelopeSimple);
      } else if (r.errorCode === 'ALREADY_SUBSCRIBED') {
        setEstado('ja');
        avisar(t.jaInscrito, PiCheck);
      } else if (r.errorCode === 'PENDING_CONFIRMATION') {
        setPodeReenviar(true);
        setEstado('confirmar');
        avisar(t.enviadoAviso, PiEnvelopeSimple);
      } else {
        setErro(r.error ?? r.message);
        setEstado('parado');
        toast.error(r.error ?? r.message ?? BLOG[idioma].acoes.erro, {
          position: 'top-right',
        });
      }
    } catch {
      setErro(BLOG[idioma].acoes.erro);
      setEstado('parado');
      toast.error(BLOG[idioma].acoes.erro, { position: 'top-right' });
    }
  }

  if (estado === 'confirmar' || estado === 'ja') {
    return (
      <div
        role="status"
        className={cx('flex flex-col items-start gap-3', className)}
      >
        <p className="t-corpo text-texto">
          {estado === 'ja' ? t.jaInscrito : t.confirme}
        </p>
        {podeReenviar && (
          <Button
            tamanho="p"
            variante="texto"
            onClick={() => {
              setPodeReenviar(false);
              void resendNewsletterConfirmation(email.current);
            }}
          >
            {t.reenviar}
          </Button>
        )}
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={enviar}
      className={cx(
        'flex flex-col gap-3',
        !empilhado && 'sm:flex-row sm:items-start',
        className
      )}
    >
      <Field
        label={t.campo}
        rotuloOculto
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="nome@exemplo.com"
        erro={erro}
        className="min-w-0 flex-1"
      />
      <Button
        variante="primario"
        type="submit"
        carregando={estado === 'enviando'}
        className="shrink-0"
      >
        {t.enviar}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Visita e leitura
// ---------------------------------------------------------------------------

/**
 * Conta a visita (a página é estática: o servidor não vê quem chega) e a
 * leitura completa, quando o fim do texto aparece na tela depois de pelo
 * menos 15 segundos na página.
 */
/**
 * Uma vez por artigo nesta visita (a aba aberta): o efeito que registra a
 * visita roda de novo quando o React monta o componente duas vezes (modo de
 * desenvolvimento), ao recarregar e ao voltar para a página. A API também
 * conta uma visita só por leitor a cada 30 minutos, de forma atômica; esta
 * guarda poupa a chamada. Sem `sessionStorage` (aba privada bloqueada), vale
 * a memória desta página.
 */
const jaContados = new Set<string>();
function primeiraVezNestaVisita(chave: string) {
  if (jaContados.has(chave)) return false;
  jaContados.add(chave);
  try {
    if (sessionStorage.getItem(chave)) return false;
    sessionStorage.setItem(chave, '1');
  } catch {
    // Sem armazenamento: fica a memória desta página.
  }
  return true;
}

export function ContadorDeLeitura({
  artigoId,
  fimId,
  desligado = false,
}: {
  artigoId: string;
  /** O elemento que marca o fim do texto. */
  fimId: string;
  /** A prévia não conta. */
  desligado?: boolean;
}) {
  useEffect(() => {
    if (desligado) return;
    if (primeiraVezNestaVisita(`blog:visita:${artigoId}`)) {
      void registrarVisita(artigoId);
    }
    const inicio = Date.now();
    const fim = document.getElementById(fimId);
    if (!fim || !('IntersectionObserver' in window)) return;

    let contou = false;
    const observador = new IntersectionObserver((entradas) => {
      const segundos = (Date.now() - inicio) / 1000;
      if (!contou && entradas.some((e) => e.isIntersecting) && segundos >= 15) {
        contou = true;
        if (primeiraVezNestaVisita(`blog:leitura:${artigoId}`)) {
          void registrarLeitura(artigoId, segundos);
        }
        observador.disconnect();
      }
    });
    observador.observe(fim);
    return () => observador.disconnect();
  }, [artigoId, fimId, desligado]);

  return null;
}
