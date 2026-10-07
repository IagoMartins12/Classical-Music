'use client';

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { GiGrandPiano } from 'react-icons/gi';
import {
  PiBookmarkSimple,
  PiBookmarkSimpleFill,
  PiHeart,
  PiHeartFill,
  PiList,
  PiMagnifyingGlass,
  PiPause,
  PiPlay,
  PiShareNetwork,
  PiVinylRecord,
} from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Sheet } from '@/app/components/ui/Sheet';
import { Text } from '@/app/components/ui/Text';
import { cx } from '@/app/components/ui/cx';
import { MAIS_LIDOS, rota, type EsbocoId, type Vista } from './dados';

/**
 * As ilhas de cliente dos esboços: só o que precisa de estado ou de evento.
 * Todo o resto — inclusive o corpo do artigo — é renderizado no servidor.
 */

// ---------------------------------------------------------------------------
// Capa com reserva. Sem imagem, ou com a imagem quebrada, entra a pauta com a
// inicial do título: o card nunca fica com um buraco nem com o ícone de
// imagem quebrada do navegador.
// ---------------------------------------------------------------------------

export function Capa({
  src,
  alt,
  inicial,
  foco,
  sizes,
  prioridade = false,
  preencher = false,
  className,
}: {
  src: string | null;
  /** Ocupa a caixa do pai (o título fica por cima), em vez de ter proporção. */
  preencher?: boolean;
  /** Vazio nos cards: o título ao lado já nomeia o link. */
  alt: string;
  /** A letra da reserva: a inicial do título. */
  inicial: string;
  foco?: string;
  sizes: string;
  prioridade?: boolean;
  /** Proporção, raio e o que mais a caixa precisar. */
  className?: string;
}) {
  const [falhou, setFalhou] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // A imagem pode falhar antes de o React assumir a página: aí o `onError`
  // já passou e ninguém ouviu. Conferir o estado dela ao montar cobre o caso.
  useEffect(() => {
    const el = ref.current;
    if (el?.complete && el.naturalWidth === 0) setFalhou(true);
  }, []);

  return (
    <span
      className={cx(
        'block overflow-hidden bg-sup-2',
        preencher ? 'absolute inset-0' : 'relative',
        className
      )}
    >
      {src && !falhou ? (
        <Image
          ref={ref}
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={prioridade}
          onError={() => setFalhou(true)}
          className="object-cover"
          style={{ objectPosition: foco }}
        />
      ) : (
        <span aria-hidden="true" className="blog-pauta absolute inset-0">
          <span className="blog-pauta-linhas" />
          <span className="blog-pauta-letra">{inicial}</span>
        </span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Cabeçalho. Três formas, uma por esboço; a busca e o menu do telefone são os
// mesmos nos três.
// ---------------------------------------------------------------------------

type Forma = 'jornal' | 'fino' | 'site';

export function Cabecalho({
  esboco,
  forma,
  atual,
  faixa,
}: {
  esboco: EsbocoId;
  forma: Forma;
  atual: Vista;
  /** Segunda linha (as seções do esboço A, as prateleiras do C). */
  faixa?: ReactNode;
}) {
  const [menu, setMenu] = useState(false);
  const [busca, setBusca] = useState(false);

  const itens = [
    {
      rotulo: 'Artigos',
      href: rota(esboco, 'lista'),
      ativo: atual === 'lista',
    },
    {
      rotulo: 'Agenda',
      href: rota(esboco, 'agenda'),
      ativo: atual === 'agenda',
    },
    { rotulo: 'Enciclopédia', href: '/', ativo: false },
  ];

  return (
    <header className="sticky top-0 z-barra border-b border-linha bg-fundo">
      <div
        className={cx(
          'mx-auto flex w-full items-center gap-4 px-4 sm:px-6 lg:px-10',
          forma === 'fino'
            ? 'h-14 max-w-[var(--largura-conteudo)]'
            : 'h-16 max-w-[1360px]'
        )}
      >
        <Link
          href={rota(esboco)}
          className="flex min-h-[var(--alvo)] items-center gap-2.5 rounded-controle"
        >
          <GiGrandPiano className="h-6 w-6 text-ouro" aria-hidden="true" />
          <span className="font-display text-[1.375rem] leading-none">
            Opus Atlas
          </span>
          <span className="font-display text-[1.375rem] italic leading-none text-texto-fraco">
            Blog
          </span>
        </Link>

        <nav
          aria-label="Navegação do blog"
          className={cx(
            'hidden items-center gap-1 md:flex',
            forma === 'site' ? 'ml-6' : 'ml-auto'
          )}
        >
          {itens.map((item) => (
            <Link
              key={item.rotulo}
              href={item.href}
              aria-current={item.ativo ? 'page' : undefined}
              className={cx(
                'flex min-h-[var(--alvo)] items-center rounded-controle px-3 text-[0.9375rem] transition-colors duration-[var(--t-toque)]',
                item.ativo
                  ? 'text-ouro-texto'
                  : 'text-texto-suave hover:text-texto'
              )}
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>

        <div
          className={cx(
            'flex items-center gap-1',
            forma === 'site' ? 'ml-auto' : 'max-md:ml-auto'
          )}
        >
          {forma === 'site' ? (
            <button
              type="button"
              onClick={() => setBusca(true)}
              className="hidden min-h-[var(--alvo)] w-64 items-center gap-2 rounded-controle border border-linha-forte bg-[var(--campo)] px-3 text-sm text-texto-fraco transition-colors duration-[var(--t-toque)] hover:border-ouro/50 lg:flex"
            >
              <Icon de={PiMagnifyingGlass} />
              Buscar no blog
            </button>
          ) : null}
          <Button
            variante="fantasma"
            icone={PiMagnifyingGlass}
            rotulo="Buscar no blog"
            onClick={() => setBusca(true)}
            className={forma === 'site' ? 'lg:hidden' : undefined}
          />
          <ThemeToggle variant="compact" />
          <Link
            href={`/en${rota(esboco)}`}
            hrefLang="en"
            onClick={(e) => e.preventDefault()}
            title="Read in English (em /en/blog no blog de verdade)"
            className="hidden min-h-[var(--alvo)] items-center rounded-controle px-2.5 text-sm font-medium text-texto-suave hover:text-texto sm:flex"
          >
            EN
          </Link>
          <Button
            variante="fantasma"
            icone={PiList}
            rotulo="Abrir o menu"
            onClick={() => setMenu(true)}
            className="md:hidden"
          />
        </div>
      </div>

      {faixa}

      <Sheet
        aberto={menu}
        aoFechar={() => setMenu(false)}
        titulo="Blog"
        largura="p"
      >
        <Stack gap={1} as="nav" aria-label="Menu do blog">
          {itens.map((item) => (
            <Link
              key={item.rotulo}
              href={item.href}
              onClick={() => setMenu(false)}
              className="flex min-h-[var(--alvo)] items-center border-b border-linha font-display text-2xl"
            >
              {item.rotulo}
            </Link>
          ))}
        </Stack>
      </Sheet>

      <Sheet
        aberto={busca}
        aoFechar={() => setBusca(false)}
        titulo="Buscar no blog"
        largura="m"
      >
        <Stack gap={8}>
          <form role="search" onSubmit={(e) => e.preventDefault()}>
            <Field
              label="Buscar no blog"
              rotuloOculto
              type="search"
              enterKeyHint="search"
              placeholder="Compositor, obra, assunto"
              autoFocus
            />
          </form>
          <Stack gap={3}>
            <Text papel="legenda" as="h3">
              Os mais lidos
            </Text>
            <ul>
              {MAIS_LIDOS.slice(0, 4).map((artigo) => (
                <li key={artigo.slug} className="border-t border-linha">
                  <Link
                    href={rota(esboco, 'artigo')}
                    onClick={() => setBusca(false)}
                    className="flex min-h-[var(--alvo)] items-center py-2 font-display text-xl leading-snug hover:text-ouro-texto"
                  >
                    {artigo.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          </Stack>
        </Stack>
      </Sheet>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Ouvir o artigo e a música de fundo. A narração é do artigo; a música é uma
// escolha de quem lê — hoje ela começa sozinha ao abrir a página.
// ---------------------------------------------------------------------------

export function Ouvir({
  minutos,
  musica,
  empilhado = false,
}: {
  minutos: number;
  musica: string;
  /** Um botão por linha (a margem do esboço B). */
  empilhado?: boolean;
}) {
  const [narrando, setNarrando] = useState(false);
  const [tocando, setTocando] = useState(false);

  return (
    <div
      role="group"
      aria-label="Áudio do artigo"
      className={cx(
        'flex gap-2',
        empilhado ? 'flex-col items-start' : 'flex-wrap'
      )}
    >
      <Button
        tamanho="p"
        icone={narrando ? PiPause : PiPlay}
        aria-pressed={narrando}
        onClick={() => setNarrando((v) => !v)}
      >
        {narrando ? 'Pausar a narração' : `Ouvir o artigo, ${minutos} min`}
      </Button>
      <Button
        tamanho="p"
        variante="fantasma"
        icone={tocando ? PiPause : PiVinylRecord}
        aria-pressed={tocando}
        title={musica}
        onClick={() => setTocando((v) => !v)}
      >
        {tocando ? 'Pausar a música' : 'Música enquanto lê'}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Curtir, salvar, compartilhar.
// ---------------------------------------------------------------------------

export function Acoes({
  curtidas,
  empilhado = false,
}: {
  curtidas: number;
  empilhado?: boolean;
}) {
  const [curtiu, setCurtiu] = useState(false);
  const [salvou, setSalvou] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function compartilhar() {
    const dados = { title: document.title, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(dados);
      else {
        await navigator.clipboard.writeText(dados.url);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2400);
      }
    } catch {
      // A pessoa fechou a folha de compartilhar: nada a fazer.
    }
  }

  return (
    <div
      role="group"
      aria-label="Ações do artigo"
      className={cx(
        'flex gap-1',
        empilhado ? 'flex-col items-start' : 'items-center'
      )}
    >
      <Button
        tamanho="p"
        variante="fantasma"
        icone={curtiu ? PiHeartFill : PiHeart}
        aria-pressed={curtiu}
        onClick={() => setCurtiu((v) => !v)}
      >
        <span className="t-dado">{curtidas + (curtiu ? 1 : 0)}</span>
        <span className="sr-only">curtidas. Curtir</span>
      </Button>
      <Button
        tamanho="p"
        variante="fantasma"
        icone={salvou ? PiBookmarkSimpleFill : PiBookmarkSimple}
        aria-pressed={salvou}
        onClick={() => setSalvou((v) => !v)}
      >
        {salvou ? 'Salvo' : 'Salvar'}
      </Button>
      <Button
        tamanho="p"
        variante="fantasma"
        icone={PiShareNetwork}
        onClick={compartilhar}
      >
        <span aria-live="polite">
          {copiado ? 'Link copiado' : 'Compartilhar'}
        </span>
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Newsletter: inscrição com confirmação por e-mail (dupla), como a API faz.
// ---------------------------------------------------------------------------

export function Newsletter({ className }: { className?: string }) {
  const [estado, setEstado] = useState<'parado' | 'enviado'>('parado');
  const [erro, setErro] = useState<string>();

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email') ?? '');
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErro('Confira o endereço: falta algo como nome@exemplo.com.');
      return;
    }
    setErro(undefined);
    setEstado('enviado');
  }

  if (estado === 'enviado') {
    return (
      <p role="status" className={cx('t-corpo text-texto', className)}>
        Falta um passo: abra o e-mail que acabamos de enviar e confirme a
        inscrição.
      </p>
    );
  }

  return (
    <form
      noValidate
      onSubmit={enviar}
      className={cx(
        'flex flex-col gap-3 sm:flex-row sm:items-start',
        className
      )}
    >
      <Field
        label="Seu e-mail"
        rotuloOculto
        name="email"
        type="email"
        autoComplete="email"
        placeholder="nome@exemplo.com"
        erro={erro}
        className="min-w-0 flex-1"
      />
      <Button variante="primario" type="submit" className="shrink-0">
        Receber os artigos
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Campo de comentário. No blog de verdade, quem não entrou vê o convite para
// entrar no lugar do campo.
// ---------------------------------------------------------------------------

export function Comentar() {
  const [texto, setTexto] = useState('');

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
      <Field.Area
        label="Seu comentário"
        rows={3}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="O que você achou do artigo?"
      />
      <Inline extremos>
        <Text papel="legenda" as="p">
          Comentários seguem as regras da comunidade.
        </Text>
        <Button type="submit" disabled={texto.trim().length < 3}>
          Publicar
        </Button>
      </Inline>
    </form>
  );
}

/** Link com cara de botão, para o que navega. */
export function LinkBotao({
  href,
  variante = 'secundario',
  children,
}: {
  href: string;
  variante?: 'primario' | 'secundario' | 'fantasma';
  children: ReactNode;
}) {
  return (
    <Link href={href} className={classesDeBotao(variante, 'm')}>
      {children}
    </Link>
  );
}
