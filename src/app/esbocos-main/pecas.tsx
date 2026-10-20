'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { GiGrandPiano } from 'react-icons/gi';
import {
  PiCheck,
  PiEnvelopeSimple,
  PiFacebookLogo,
  PiGoogleLogo,
  PiLinkSimple,
  PiLinkedinLogo,
  PiTelegramLogo,
  PiWhatsappLogo,
  PiXLogo,
  PiX,
} from 'react-icons/pi';
import toast from 'react-hot-toast';
import Image from '@/app/components/SmartImage';
import { BoasVindasFinal } from './boas-vindas';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import {
  CONQUISTAS,
  EPOCAS,
  FAMOSOS,
  PESSOA,
  type Conquista,
  type EsbocoId,
} from './dados';

// ---------------------------------------------------------------------------
// O estado do esboço: visitante ou logado, e as folhas comuns
// ---------------------------------------------------------------------------

interface EstadoDoEsboco {
  esboco: EsbocoId;
  logado: boolean;
  setLogado: (v: boolean) => void;
  /** E-mail confirmado: só assim dá para completar fichas e criar coleções. */
  verificado: boolean;
  setVerificado: (v: boolean) => void;
  xp: number;
  conquistaNova: boolean;
  verConquistas: () => void;
  ganharConquista: () => void;
  abrirEntrar: () => void;
  abrirBoasVindas: () => void;
  compartilhar: (alvo: {
    titulo: string;
    url: string;
    imagem?: string;
  }) => void;
}

const Contexto = createContext<EstadoDoEsboco | null>(null);

export function useEsboco() {
  const c = useContext(Contexto);
  if (!c) throw new Error('useEsboco fora do EsbocoProvider');
  return c;
}

const CHAVE_LOGADO = 'esboco-main-logado';

export function EsbocoProvider({
  esboco,
  children,
}: {
  esboco: EsbocoId;
  children: ReactNode;
}) {
  const [logado, setLogadoBruto] = useState(false);
  const [xp, setXp] = useState(PESSOA.xp);
  const [verificado, setVerificado] = useState(true);
  const [conquistaNova, setConquistaNova] = useState(false);
  const [aviso, setAviso] = useState<Conquista | null>(null);
  const [entrar, setEntrar] = useState(false);
  const [boasVindas, setBoasVindas] = useState(false);
  const [alvo, setAlvo] = useState<{
    titulo: string;
    url: string;
    imagem?: string;
  } | null>(null);

  useEffect(() => {
    try {
      setLogadoBruto(sessionStorage.getItem(CHAVE_LOGADO) === '1');
    } catch {
      /* sem armazenamento: visitante */
    }
  }, []);

  const setLogado = useCallback((v: boolean) => {
    setLogadoBruto(v);
    try {
      sessionStorage.setItem(CHAVE_LOGADO, v ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  // A conquista "ao vivo": no produto chega pelo socket assim que a API a
  // calcula (o evento de atividade já existe); aqui um botão da barra simula.
  const ganharConquista = useCallback(() => {
    const c = CONQUISTAS.find((x) => x.id === 'nove-dias') as Conquista;
    setAviso(c);
    setConquistaNova(true);
    setXp((v) => v + c.xp);
  }, []);

  const compartilhar = useCallback(
    async (a: { titulo: string; url: string; imagem?: string }) => {
      // No telefone de verdade (toque) com a folha do sistema: só ela. Sem a
      // do sistema (navegador de app, desktop), a nossa folha.
      const toque = window.matchMedia('(pointer: coarse)').matches;
      if (toque && typeof navigator.share === 'function') {
        await navigator
          .share({ title: a.titulo, url: a.url })
          .catch(() => undefined);
        return;
      }
      setAlvo(a);
    },
    []
  );

  const valor = useMemo<EstadoDoEsboco>(
    () => ({
      esboco,
      logado,
      setLogado,
      verificado,
      setVerificado,
      xp,
      conquistaNova,
      verConquistas: () => setConquistaNova(false),
      ganharConquista,
      abrirEntrar: () => setEntrar(true),
      abrirBoasVindas: () => setBoasVindas(true),
      compartilhar,
    }),
    [
      esboco,
      logado,
      setLogado,
      verificado,
      xp,
      conquistaNova,
      ganharConquista,
      compartilhar,
    ]
  );

  return (
    <Contexto.Provider value={valor}>
      {children}
      <AvisoDeConquista conquista={aviso} aoFechar={() => setAviso(null)} />
      <FolhaDeEntrar
        aberto={entrar}
        aoFechar={() => setEntrar(false)}
        aoCriar={() => {
          setEntrar(false);
          setLogado(true);
          setBoasVindas(true);
        }}
        aoEntrar={() => {
          setEntrar(false);
          setLogado(true);
        }}
      />
      <BoasVindasFinal
        aberto={boasVindas}
        aoFechar={() => setBoasVindas(false)}
      />
      <FolhaDeCompartilhar alvo={alvo} aoFechar={() => setAlvo(null)} />
    </Contexto.Provider>
  );
}

// ---------------------------------------------------------------------------
// Marca, retrato, ficha
// ---------------------------------------------------------------------------

export function Marca({
  href,
  compacta = false,
  encolhe = false,
  className,
}: {
  href: string;
  compacta?: boolean;
  /** No telefone, só o piano (barra do esboço B, que leva a busca no meio). */
  encolhe?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="Opus Atlas — início"
      className={cx(
        'group/marca flex min-h-[var(--alvo)] shrink-0 items-center gap-2.5 rounded-controle',
        className
      )}
    >
      <GiGrandPiano
        aria-hidden="true"
        className="icon-glow h-7 w-7 shrink-0 text-ouro-texto transition-transform duration-300 group-hover/marca:-rotate-6 motion-reduce:transition-none"
      />
      {!compacta && (
        <span
          className={cx(
            'gold-shine whitespace-nowrap font-display text-[1.375rem] font-semibold leading-none',
            encolhe && 'max-sm:hidden'
          )}
        >
          Opus Atlas
        </span>
      )}
    </Link>
  );
}

export function Retrato({
  nome,
  src,
  className,
  sizes = '160px',
  prioridade = false,
}: {
  nome: string;
  src?: string | null;
  className?: string;
  sizes?: string;
  prioridade?: boolean;
}) {
  const [quebrou, setQuebrou] = useState(false);
  const inicial = nome.replace(
    /^(Giovanni Battista|Pierre|Henry Clay) /,
    ''
  )[0];

  return (
    <span className={cx('relative block overflow-hidden bg-sup-2', className)}>
      {src && !quebrou ? (
        <Image
          src={src}
          alt={`Retrato de ${nome}`}
          fill
          sizes={sizes}
          priority={prioridade}
          onError={() => setQuebrou(true)}
          className="object-cover object-top"
        />
      ) : (
        // Sem foto (ou o "sem foto" do IMSLP): a inicial em Garamond, nunca
        // um buraco nem a silhueta genérica.
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center font-display text-[2.5em] text-texto-fraco"
        >
          {inicial}
        </span>
      )}
    </span>
  );
}

export const retratoDe = (nome: string) =>
  FAMOSOS.find((c) => c.nome === nome)?.retrato ?? null;

/** Rostos sobrepostos (coleções e listas). */
export function Rostos({
  nomes,
  tamanho = 'h-9 w-9',
}: {
  nomes: string[];
  tamanho?: string;
}) {
  return (
    <span className="flex -space-x-2.5">
      {nomes.map((n) => (
        <Retrato
          key={n}
          nome={n}
          src={retratoDe(n)}
          sizes="48px"
          className={cx(tamanho, 'rounded-full ring-2 ring-[var(--fundo)]')}
        />
      ))}
    </span>
  );
}

export function anos(nasc: number, morte?: number) {
  return morte ? `${nasc}–${morte}` : `n. ${nasc}`;
}

export const nomeDaEpoca = (id: string) =>
  EPOCAS.find((e) => e.id === id)?.nome ?? id;

/** Link sublinhado em ouro ao passar — o link de texto do sistema. */
export const linkTexto =
  'underline decoration-transparent underline-offset-4 transition-colors duration-[var(--t-toque)] hover:text-ouro-texto hover:decoration-ouro/60';

// ---------------------------------------------------------------------------
// Compartilhar (parte da folha do blog: no código final viram uma peça só)
// ---------------------------------------------------------------------------

function FolhaDeCompartilhar({
  alvo,
  aoFechar,
}: {
  alvo: { titulo: string; url: string; imagem?: string } | null;
  aoFechar: () => void;
}) {
  const [copiado, setCopiado] = useState(false);
  const titulo = alvo?.titulo ?? '';
  const url = alvo?.url ?? '';
  const texto = encodeURIComponent(titulo);
  const link = encodeURIComponent(url);

  const destinos = [
    {
      nome: 'WhatsApp',
      icone: PiWhatsappLogo,
      href: `https://wa.me/?text=${texto}%20${link}`,
    },
    {
      nome: 'X',
      icone: PiXLogo,
      href: `https://x.com/intent/post?text=${texto}&url=${link}`,
    },
    {
      nome: 'Facebook',
      icone: PiFacebookLogo,
      href: `https://www.facebook.com/sharer/sharer.php?u=${link}`,
    },
    {
      nome: 'LinkedIn',
      icone: PiLinkedinLogo,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${link}`,
    },
    {
      nome: 'Telegram',
      icone: PiTelegramLogo,
      href: `https://t.me/share/url?url=${link}&text=${texto}`,
    },
    {
      nome: 'E-mail',
      icone: PiEnvelopeSimple,
      href: `mailto:?subject=${texto}&body=${link}`,
    },
  ];

  return (
    <Sheet
      aberto={!!alvo}
      aoFechar={aoFechar}
      titulo="Compartilhar"
      largura="p"
    >
      <div className="flex flex-col gap-7">
        {/* O cartão como vai aparecer no WhatsApp: a imagem gerada 1200×630
            (retrato + nome + marca), nunca o retrato vertical cortado. */}
        <div className="overflow-hidden rounded-card bg-sup-2">
          <CartaoDeCompartilhar titulo={titulo} imagem={alvo?.imagem} />
          <p className="t-dado truncate px-4 py-3 text-[0.75rem] text-texto-fraco">
            {url.replace(/^https?:\/\//, '')}
          </p>
        </div>

        <ul aria-label="Compartilhar em" className="grid grid-cols-3 gap-y-5">
          {destinos.map((d) => (
            <li key={d.nome}>
              <a
                href={d.href}
                target={d.href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2 rounded-controle text-[0.8125rem] text-texto-suave"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-sup-2 text-texto transition-[background-color,color,transform] duration-[var(--t-toque)] group-hover:text-ouro-texto group-active:scale-95 motion-reduce:transition-none">
                  <Icon de={d.icone} tamanho="m" />
                </span>
                {d.nome}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 rounded-controle bg-[var(--campo)] p-1.5 pl-4">
          <label htmlFor="link-compartilhar" className="sr-only">
            Copiar link
          </label>
          <input
            id="link-compartilhar"
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="t-dado min-w-0 flex-1 truncate bg-transparent text-[0.8125rem] text-texto-suave outline-none"
          />
          <Button
            tamanho="p"
            variante={copiado ? 'secundario' : 'primario'}
            icone={copiado ? PiCheck : PiLinkSimple}
            onClick={async () => {
              await navigator.clipboard?.writeText(url).catch(() => undefined);
              setCopiado(true);
              setTimeout(() => setCopiado(false), 2400);
            }}
            className="shrink-0"
          >
            {copiado ? 'Copiado' : 'Copiar'}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

/**
 * O cartão Open Graph (1200×630) desenhado em HTML para o esboço: no produto
 * é um `opengraph-image.tsx` por compositor e por obra. Com retrato: o rosto à
 * esquerda, inteiro; sem retrato, só a marca e o título.
 */
export function CartaoDeCompartilhar({
  titulo,
  imagem,
}: {
  titulo: string;
  imagem?: string;
}) {
  const [principal, ...resto] = titulo.split(' — ');
  return (
    <div className="relative flex aspect-[1200/630] w-full bg-[#0c0d12] text-[#f3f1ec]">
      {imagem ? (
        <Retrato
          nome={principal}
          src={imagem}
          sizes="200px"
          className="h-full w-[38%] shrink-0"
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-[5%]">
        <span className="flex items-center gap-1.5 text-[#e0bc5c]">
          <GiGrandPiano aria-hidden="true" className="h-4 w-4" />
          <span className="font-display text-[0.8125rem]">Opus Atlas</span>
        </span>
        <span className="flex flex-col gap-1">
          <span className="line-clamp-2 font-display text-[1.375rem] leading-tight">
            {principal}
          </span>
          {resto.length ? (
            <span className="truncate text-[0.75rem] text-[#b5b1c0]">
              {resto.join(' — ')}
            </span>
          ) : null}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conquista ao vivo
// ---------------------------------------------------------------------------

/** A medalha de traço: o círculo se desenha, a fita entra, o visto por último. */
export function Medalha({
  className,
  desenhar = false,
}: {
  className?: string;
  desenhar?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cx(desenhar && 'medalha-desenha', className)}
    >
      <path
        className="medalha-fita"
        pathLength={1}
        d="M11 3l3 8M21 3l-3 8M11 3h10"
      />
      <circle className="medalha-disco" pathLength={1} cx="16" cy="19" r="9" />
      <path
        className="medalha-visto"
        pathLength={1}
        d="M12.4 19.2l2.5 2.5 4.7-5"
      />
    </svg>
  );
}

function AvisoDeConquista({
  conquista,
  aoFechar,
}: {
  conquista: Conquista | null;
  aoFechar: () => void;
}) {
  useEffect(() => {
    if (!conquista) return;
    const id = setTimeout(aoFechar, 6500);
    return () => clearTimeout(id);
  }, [conquista, aoFechar]);

  if (!conquista) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="conquista-chega sup-alta fixed left-1/2 top-4 z-aviso flex w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 items-center gap-4 !rounded-card p-4 pr-3"
    >
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full tint-ouro text-ouro-texto">
        <Medalha desenhar className="h-9 w-9" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-display text-[1.25rem] leading-snug">
          {conquista.nome}
        </span>
        <span className="t-rotulo text-texto-suave">
          Conquista nova ·{' '}
          <span className="t-dado text-ouro-texto">+{conquista.xp} XP</span>
        </span>
        <span className="t-legenda">{conquista.como}</span>
      </span>
      <button
        type="button"
        onClick={aoFechar}
        className="grid h-9 w-9 shrink-0 place-items-center self-start rounded-full text-texto-fraco hover:bg-sup-2 hover:text-texto"
      >
        <Icon de={PiX} tamanho="p" rotulo="Fechar aviso" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Entrar e criar conta
// ---------------------------------------------------------------------------

/**
 * Entrar: no login, erro só no toast e genérico ("E-mail ou senha
 * incorretos") — nada escrito no formulário, nenhuma regra de senha. A regra
 * de tamanho aparece só em "Criar conta", ao lado do campo.
 */
function FolhaDeEntrar({
  aberto,
  aoFechar,
  aoEntrar,
  aoCriar,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoEntrar: () => void;
  aoCriar: () => void;
}) {
  const [modo, setModo] = useState<'entrar' | 'criar'>('entrar');
  const [senha, setSenha] = useState('');

  const campo =
    'input-classical min-h-[var(--alvo)] w-full rounded-controle px-4 text-base';

  return (
    <Sheet
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={modo === 'entrar' ? 'Entrar no Opus Atlas' : 'Criar sua conta'}
      descricao={
        modo === 'entrar'
          ? 'Sua estante, suas anotações e o que você está estudando.'
          : 'Grátis. Guarde obras, escolha partituras e acompanhe seu estudo.'
      }
      largura="p"
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (modo === 'entrar') {
            if (senha !== 'opus1234') {
              toast.error('E-mail ou senha incorretos');
              return;
            }
            aoEntrar();
          } else {
            aoCriar();
          }
        }}
      >
        <Button
          icone={PiGoogleLogo}
          onClick={modo === 'entrar' ? aoEntrar : aoCriar}
        >
          {modo === 'entrar' ? 'Entrar com Google' : 'Criar com Google'}
        </Button>
        <span className="flex items-center gap-3 t-legenda">
          <span className="h-px flex-1 bg-[var(--linha)]" />
          ou com e-mail
          <span className="h-px flex-1 bg-[var(--linha)]" />
        </span>
        {modo === 'criar' && (
          <label className="flex flex-col gap-1.5">
            <span className="t-rotulo">Como podemos te chamar</span>
            <input className={campo} autoComplete="given-name" />
          </label>
        )}
        <label className="flex flex-col gap-1.5">
          <span className="t-rotulo">E-mail</span>
          <input
            className={campo}
            type="email"
            autoComplete="email"
            defaultValue="marina@exemplo.com"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="t-rotulo">Senha</span>
          <input
            className={campo}
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete={
              modo === 'entrar' ? 'current-password' : 'new-password'
            }
          />
          {modo === 'criar' && (
            <span className="t-legenda">Pelo menos 8 caracteres.</span>
          )}
          {modo === 'entrar' && (
            <span className="t-legenda">
              No esboço, a senha certa é{' '}
              <span className="t-dado">opus1234</span>; qualquer outra mostra o
              erro.
            </span>
          )}
        </label>
        <Button variante="primario" type="submit">
          {modo === 'entrar' ? 'Entrar' : 'Criar conta'}
        </Button>
        <p className="t-rotulo text-center text-texto-suave">
          {modo === 'entrar' ? 'Ainda não tem conta? ' : 'Já tem conta? '}
          <button
            type="button"
            onClick={() => setModo(modo === 'entrar' ? 'criar' : 'entrar')}
            className={cx('text-ouro-texto', linkTexto)}
          >
            {modo === 'entrar' ? 'Criar conta grátis' : 'Entrar'}
          </button>
        </p>
      </form>
    </Sheet>
  );
}

export function Ficha({
  ativa,
  onClick,
  children,
}: {
  ativa?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativa}
      onClick={onClick}
      className={cx(
        'inline-flex min-h-10 items-center rounded-full px-4 text-[0.9375rem] transition-colors duration-[var(--t-toque)]',
        ativa
          ? 'tint-ouro text-ouro-na-tinta'
          : 'bg-sup-2 text-texto-suave hover:text-texto'
      )}
    >
      {children}
    </button>
  );
}
