'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  PiBookOpenText,
  PiBooks,
  PiCaretDown,
  PiChalkboardTeacher,
  PiHeart,
  PiList,
  PiMedal,
  PiNotePencil,
  PiSignOut,
  PiUploadSimple,
  PiUserCircle,
} from 'react-icons/pi';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import {
  EXPLORAR,
  PESSOA,
  destino,
  formatar,
  rota,
  type EsbocoId,
  type Tela,
} from './dados';
import { useEsboco } from './pecas';

/**
 * O que as três barras têm igual: os itens aprovados em 01/10 (Explorar ·
 * Blog · Ensino · Planos · Sobre), o menu da pessoa (nível, XP, o ponto
 * dourado da conquista nova) e o menu do telefone em folha de baixo, como o
 * do blog. Cada esboço compõe isso do seu jeito.
 */

export const ITENS = [
  { chave: 'blog', rotulo: 'Blog' },
  { chave: 'ensino', rotulo: 'Ensino' },
  { chave: 'sobre', rotulo: 'Sobre' },
] as const;

export const PESSOAIS: { tela: Tela; rotulo: string; icone: typeof PiHeart }[] =
  [
    { tela: 'estudo', rotulo: 'Estudo', icone: PiBookOpenText },
    { tela: 'favoritos', rotulo: 'Favoritos', icone: PiHeart },
    { tela: 'anotacoes', rotulo: 'Anotações', icone: PiNotePencil },
    { tela: 'envios', rotulo: 'Envios', icone: PiUploadSimple },
    { tela: 'conquistas', rotulo: 'Conquistas', icone: PiMedal },
    { tela: 'colecoes-minhas', rotulo: 'Coleções', icone: PiBooks },
    { tela: 'perfil', rotulo: 'Perfil', icone: PiUserCircle },
  ];

/** Fecha com Esc e com clique fora. */
export function useFechaFora<T extends HTMLElement>(
  aberto: boolean,
  fechar: () => void
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!aberto) return;
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && fechar();
    const clique = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) fechar();
    };
    document.addEventListener('keydown', tecla);
    document.addEventListener('mousedown', clique);
    return () => {
      document.removeEventListener('keydown', tecla);
      document.removeEventListener('mousedown', clique);
    };
  }, [aberto, fechar]);
  return ref;
}

/** "Planos" em destaque: a ficha dourada, a única da barra. */
export function LinkPlanos({
  esboco,
  className,
}: {
  esboco: EsbocoId;
  className?: string;
}) {
  return (
    <Link
      href={destino(esboco, 'planos')}
      className={cx(
        'inline-flex min-h-9 items-center rounded-full tint-ouro px-4 text-[0.9375rem] font-medium text-ouro-na-tinta transition-[filter] hover:brightness-110',
        className
      )}
    >
      Planos
    </Link>
  );
}

export function Avatar({ tamanho = 'h-9 w-9' }: { tamanho?: string }) {
  const { conquistaNova } = useEsboco();
  return (
    <span className="relative">
      <span
        className={cx(
          'grid place-items-center rounded-full bg-sup-2 font-display text-[1.125rem] text-ouro-texto',
          tamanho
        )}
      >
        M
      </span>
      {conquistaNova && (
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[var(--ouro)] ring-2 ring-[var(--fundo)]">
          <span className="sr-only">Conquista nova</span>
        </span>
      )}
    </span>
  );
}

/** Nível e XP: o XP sobe na hora quando chega uma conquista. */
export function NivelEXp() {
  const { xp } = useEsboco();
  const pct = Math.min(100, ((xp - 1000) / (PESSOA.proximoNivel - 1000)) * 100);
  return (
    <span className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between gap-3 t-rotulo">
        <span>Nível {PESSOA.nivel}</span>
        <span className="t-dado text-[0.8125rem] text-texto-suave">
          {formatar(xp)} / {formatar(PESSOA.proximoNivel)} XP
        </span>
      </span>
      <span className="h-1.5 overflow-hidden rounded-full bg-[var(--linha)]">
        <span
          className="barra-xp block h-full rounded-full fill-ouro"
          style={{ ['--xp' as string]: pct / 100 }}
        />
      </span>
    </span>
  );
}

export function MenuDaPessoa({ esboco }: { esboco: EsbocoId }) {
  const [aberto, setAberto] = useState(false);
  const { setLogado, verConquistas, conquistaNova } = useEsboco();
  const ref = useFechaFora<HTMLDivElement>(aberto, () => setAberto(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={aberto}
        aria-haspopup="menu"
        onClick={() => setAberto(!aberto)}
        className="flex min-h-[var(--alvo)] items-center gap-2 rounded-full pl-1 pr-2 hover:bg-sup-2"
      >
        <Avatar />
        <span className="max-md:hidden">{PESSOA.nome}</span>
        <Icon
          de={PiCaretDown}
          tamanho="pp"
          className={cx('transition-transform', aberto && 'rotate-180')}
        />
      </button>
      {aberto && (
        <div
          role="menu"
          className="c-resultados sup-alta absolute right-0 top-full z-menu mt-2 flex w-72 flex-col gap-1 !rounded-card p-2"
        >
          <div className="flex flex-col gap-3 px-3 pb-3 pt-2">
            <span className="flex flex-col">
              <span className="font-display text-[1.25rem]">
                {PESSOA.nomeCompleto}
              </span>
              <span className="t-legenda">
                Plano Free · {PESSOA.sequencia} dias seguidos
              </span>
            </span>
            <NivelEXp />
          </div>
          <span className="mx-2 h-px bg-[var(--linha)]" />
          {PESSOAIS.map((p) => (
            <Link
              key={p.tela}
              role="menuitem"
              href={rota(esboco, p.tela)}
              onClick={() => {
                setAberto(false);
                if (p.tela === 'conquistas') verConquistas();
              }}
              className="flex min-h-10 items-center gap-3 rounded-controle px-3 text-[0.9375rem] text-texto-suave hover:bg-sup-2 hover:text-texto"
            >
              <Icon de={p.icone} tamanho="p" />
              <span className="flex-1">{p.rotulo}</span>
              {p.tela === 'conquistas' && conquistaNova && (
                <span className="t-legenda !text-ouro-texto">nova</span>
              )}
            </Link>
          ))}
          <Link
            role="menuitem"
            href="#"
            className="flex min-h-10 items-center gap-3 rounded-controle px-3 text-[0.9375rem] text-texto-suave hover:bg-sup-2 hover:text-texto"
          >
            <Icon de={PiChalkboardTeacher} tamanho="p" />
            Portal de estudo
          </Link>
          <span className="mx-2 h-px bg-[var(--linha)]" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setLogado(false);
              setAberto(false);
            }}
            className="flex min-h-10 items-center gap-3 rounded-controle px-3 text-left text-[0.9375rem] text-texto-suave hover:bg-sup-2 hover:text-texto"
          >
            <Icon de={PiSignOut} tamanho="p" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

export function AcoesDaConta({
  esboco,
  compacta = false,
}: {
  esboco: EsbocoId;
  compacta?: boolean;
}) {
  const { logado, abrirEntrar } = useEsboco();
  if (logado) return <MenuDaPessoa esboco={esboco} />;
  return (
    <span className="flex items-center gap-1">
      <Button
        variante="fantasma"
        tamanho="p"
        onClick={abrirEntrar}
        className={compacta ? 'max-sm:hidden' : undefined}
      >
        Entrar
      </Button>
      <Button
        variante="secundario"
        tamanho="p"
        onClick={abrirEntrar}
        className="max-sm:hidden"
      >
        Criar conta
      </Button>
    </span>
  );
}

export function Tema() {
  return <ThemeToggle variant="navbar" />;
}

/** O painel "Explorar": os cinco caminhos pela enciclopédia. */
export function ListaExplorar({
  esboco,
  aoEscolher,
  extra,
}: {
  esboco: EsbocoId;
  aoEscolher?: () => void;
  extra?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_minmax(0,1.4fr)] lg:gap-4">
      {EXPLORAR.map((e) => (
        <Link
          key={e.href}
          href={destino(esboco, e.href)}
          onClick={aoEscolher}
          className="group flex flex-col gap-1 rounded-controle p-3 hover:bg-sup-2"
        >
          <span className="font-display text-[1.25rem] transition-colors group-hover:text-ouro-texto">
            {e.rotulo}
          </span>
          <span className="t-rotulo text-texto-suave">{e.detalhe}</span>
        </Link>
      ))}
      {extra}
    </div>
  );
}

/** O menu do telefone: folha de baixo com a lista, como o do blog. */
export function MenuDoTelefone({
  esboco,
  aberto: abertoFora,
  aoMudar,
  semBotao = false,
}: {
  esboco: EsbocoId;
  /** Controlado de fora — a aba "Menu" do esboço C abre a mesma folha. */
  aberto?: boolean;
  aoMudar?: (v: boolean) => void;
  semBotao?: boolean;
}) {
  const [abertoDentro, setAbertoDentro] = useState(false);
  const aberto = abertoFora ?? abertoDentro;
  const setAberto = aoMudar ?? setAbertoDentro;
  const { logado, abrirEntrar } = useEsboco();
  return (
    <>
      {!semBotao && (
        <Button
          variante="fantasma"
          tamanho="p"
          icone={PiList}
          rotulo="Abrir menu"
          onClick={() => setAberto(true)}
          className="lg:hidden"
        />
      )}
      <Sheet
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Menu"
        largura="p"
      >
        <div className="flex flex-col gap-6">
          {logado && (
            <div className="rounded-card bg-sup-2 p-4">
              <NivelEXp />
            </div>
          )}
          <section className="flex flex-col gap-1">
            <h3 className="t-legenda px-3">Explorar</h3>
            {EXPLORAR.map((e) => (
              <Link
                key={e.href}
                href={destino(esboco, e.href)}
                onClick={() => setAberto(false)}
                className="flex min-h-[var(--alvo)] items-center rounded-controle px-3 font-display text-[1.25rem] hover:bg-sup-2"
              >
                {e.rotulo}
              </Link>
            ))}
          </section>
          <section className="flex flex-col gap-1">
            {ITENS.map((i) => (
              <Link
                key={i.chave}
                href={destino(esboco, i.chave)}
                onClick={() => setAberto(false)}
                className="flex min-h-[var(--alvo)] items-center rounded-controle px-3 hover:bg-sup-2"
              >
                {i.rotulo}
              </Link>
            ))}
            <LinkPlanos esboco={esboco} className="mt-2 self-start" />
          </section>
          {logado ? (
            <section className="grid grid-cols-2 gap-1">
              {PESSOAIS.map((p) => (
                <Link
                  key={p.tela}
                  href={rota(esboco, p.tela)}
                  onClick={() => setAberto(false)}
                  className="flex min-h-[var(--alvo)] items-center gap-2 rounded-controle px-3 text-texto-suave hover:bg-sup-2"
                >
                  <Icon de={p.icone} tamanho="p" />
                  {p.rotulo}
                </Link>
              ))}
            </section>
          ) : (
            <Button
              variante="primario"
              onClick={() => {
                setAberto(false);
                abrirEntrar();
              }}
            >
              Entrar ou criar conta
            </Button>
          )}
          <div className="flex items-center justify-between rounded-card bg-sup-2 px-4 py-2">
            <span className="t-rotulo">Tema</span>
            <Tema />
          </div>
        </div>
      </Sheet>
    </>
  );
}

/** O rodapé, igual nos três: a enciclopédia, o produto, a ajuda. */
export function Rodape({ esboco }: { esboco: EsbocoId }) {
  const colunas = [
    {
      titulo: 'Enciclopédia',
      itens: EXPLORAR.map((e) => ({
        rotulo: e.rotulo,
        href: destino(esboco, e.href),
      })),
    },
    {
      titulo: 'Opus Atlas',
      itens: [
        { rotulo: 'Sobre', href: destino(esboco, 'sobre') },
        { rotulo: 'Planos', href: destino(esboco, 'planos') },
        { rotulo: 'Ensino', href: destino(esboco, 'ensino') },
        { rotulo: 'Blog', href: destino(esboco, 'blog') },
        { rotulo: 'Agenda de concertos', href: destino(esboco, 'blog') },
      ],
    },
    {
      titulo: 'Ajuda',
      itens: [
        { rotulo: 'Central de ajuda', href: '#' },
        { rotulo: 'Perguntas frequentes', href: '#' },
        { rotulo: 'Fale conosco', href: '#' },
        { rotulo: 'Termos', href: '#' },
        { rotulo: 'Privacidade', href: '#' },
        { rotulo: 'Direitos autorais', href: '#' },
      ],
    },
  ];
  return (
    <footer className="mt-24 bg-sup-2">
      <div className="section-wrap grid grid-cols-1 gap-10 py-14 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="flex max-w-xs flex-col gap-3">
          <span className="gold-shine font-display text-[1.5rem] font-semibold">
            Opus Atlas
          </span>
          <p className="t-rotulo text-texto-suave">
            O atlas da música erudita: compositores, obras, partituras de cada
            edição, gravações, estudo e aulas, num lugar só.
          </p>
          <p className="t-legenda">Em português e em inglês.</p>
        </div>
        {colunas.map((c) => (
          <nav
            key={c.titulo}
            aria-label={c.titulo}
            className="flex flex-col gap-2"
          >
            <h2 className="t-legenda">{c.titulo}</h2>
            {c.itens.map((i) => (
              <Link
                key={i.rotulo}
                href={i.href}
                className="t-rotulo text-texto-suave underline decoration-transparent underline-offset-4 hover:text-ouro-texto hover:decoration-ouro/60"
              >
                {i.rotulo}
              </Link>
            ))}
          </nav>
        ))}
      </div>
    </footer>
  );
}
