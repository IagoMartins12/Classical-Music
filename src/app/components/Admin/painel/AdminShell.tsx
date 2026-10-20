'use client';

import { NavegadorDoPainel } from './Navegador';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GiGrandPiano } from 'react-icons/gi';
import {
  PiArrowSquareOut,
  PiCaretDown,
  PiCaretLeft,
  PiCaretRight,
  PiList,
  PiMagnifyingGlass,
  PiSignOut,
} from 'react-icons/pi';
import { signOut, useSession } from '@/app/libs/session';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { AreaCarregando } from '@/app/components/ui/Skeleton';
import { Row } from '@/app/components/ui/Row';
import { cx } from '@/app/components/ui/cx';
import { usePendencias } from '@/app/hooks/admin/usePainel';
import { temErro, type Pendencias } from '@/app/requests/admin/painel';
import {
  NAVEGACAO,
  acharAtual,
  type GrupoNav,
  type Pendencia,
} from './navegacao';
import { Paleta } from './Paleta';

/**
 * A casca do painel — o esboço A, escolhido em 29/09/2026.
 *
 * Lateral fixa com os assuntos, a janela inteira para o conteúdo (é o que o
 * ROADMAP prevê para o painel: densidade máxima, sem margem de catálogo).
 *
 * **Recolhível pelo chevron do topo** (pedido do dono): recolhida, a lateral
 * fica com 72px e só os ícones dos assuntos; passar o cursor ou focar um
 * ícone abre as páginas dele ao lado. A escolha fica guardada no navegador.
 * No telefone e no tablet a lateral mora numa folha, aberta pelo botão do
 * topo.
 *
 * ⌘K (Ctrl+K) abre o "Ir para" de qualquer tela.
 */

const CHAVE_RECOLHIDA = 'painel:lateral-recolhida';
const CHAVE_ABERTOS = 'painel:grupos-abertos';

function ler<T>(chave: string, padrao: T): T {
  try {
    const v = localStorage.getItem(chave);
    return v ? (JSON.parse(v) as T) : padrao;
  } catch {
    return padrao;
  }
}

function gravar(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // navegador que bloqueia armazenamento: a lateral só não lembra
  }
}

/** Quantos esperam em cada item do menu, a partir das pendências. */
function contagem(p: Pendencias | undefined, qual?: Pendencia): number {
  if (!p || !qual) return 0;
  if (qual === 'denuncias')
    return temErro(p.denuncias) ? 0 : p.denuncias.abertas;
  if (qual === 'comentarios')
    return temErro(p.blog) ? 0 : p.blog.comentarios + p.blog.sinalizados;
  if (qual === 'artigos') return temErro(p.blog) ? 0 : p.blog.emRevisao;
  return 0;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/admin';
  const router = useRouter();
  const { data: session, status } = useSession();
  const admin = status === 'authenticated' && session?.user?.role === 2;

  // Quem confere o papel de verdade é a API; aqui só se evita mostrar a
  // casca a quem não é administrador.
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    } else if (status === 'authenticated' && session?.user?.role !== 2) {
      router.replace('/access-denied');
    }
  }, [status, session, router, pathname]);

  const [recolhida, setRecolhida] = useState(false);
  const [folha, setFolha] = useState(false);
  const [paleta, setPaleta] = useState(false);

  useEffect(() => setRecolhida(ler(CHAVE_RECOLHIDA, false)), []);
  useEffect(() => setFolha(false), [pathname]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaleta((a) => !a);
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, []);

  const alternarRecolhida = () =>
    setRecolhida((r) => {
      gravar(CHAVE_RECOLHIDA, !r);
      return !r;
    });

  const { data: pendencias } = usePendencias(admin);
  const atual = acharAtual(pathname);

  const conta = {
    nome:
      [session?.user?.firstName, session?.user?.lastName]
        .filter(Boolean)
        .join(' ') ||
      session?.user?.name ||
      session?.user?.email ||
      'Administrador',
    imagem: session?.user?.image ?? null,
  };

  return (
    <div className="flex min-h-dvh bg-fundo text-texto">
      <aside
        className={cx(
          'sticky top-0 z-barra hidden h-dvh shrink-0 border-r border-linha fundo-sup-2 lg:block',
          'transition-[width] duration-[var(--t-entrada)] ease-saida motion-reduce:transition-none',
          recolhida ? 'w-[72px]' : 'w-[272px]'
        )}
      >
        {recolhida ? (
          <LateralRecolhida
            pathname={pathname}
            pendencias={pendencias}
            conta={conta}
            aoExpandir={alternarRecolhida}
            aoBuscar={() => setPaleta(true)}
          />
        ) : (
          <Lateral
            pathname={pathname}
            pendencias={pendencias}
            conta={conta}
            aoRecolher={alternarRecolhida}
            aoBuscar={() => setPaleta(true)}
          />
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-barra flex min-h-14 items-center gap-3 border-b border-linha bg-fundo px-4 sm:px-6 lg:px-10">
          <Button
            variante="fantasma"
            tamanho="p"
            icone={PiList}
            rotulo="Abrir menu do painel"
            onClick={() => setFolha(true)}
            className="lg:hidden"
          />
          <nav
            aria-label="Você está em"
            className="t-rotulo flex min-w-0 items-center gap-2"
          >
            {atual && atual.grupo.itens.length > 1 && (
              <>
                <span className="shrink-0 text-texto-fraco">
                  {atual.grupo.rotulo}
                </span>
                <span className="text-texto-fraco" aria-hidden="true">
                  /
                </span>
              </>
            )}
            <span className="truncate font-medium text-texto">
              {atual?.item.rotulo ?? 'Painel'}
            </span>
          </nav>
          <Button
            variante="fantasma"
            tamanho="p"
            icone={PiMagnifyingGlass}
            rotulo="Ir para uma página do painel"
            onClick={() => setPaleta(true)}
            className="ml-auto lg:hidden"
          />
        </header>

        {/* Recolhida a lateral, o conteúdo ganha a largura dela e o teto
            sobe — na mesma animação da lateral. */}
        <main
          className={cx(
            'w-full px-4 py-8 sm:px-6 lg:px-10',
            'transition-[max-width] duration-[var(--t-entrada)] ease-saida motion-reduce:transition-none',
            recolhida ? 'max-w-[1680px]' : 'max-w-[1440px]'
          )}
        >
          {admin ? (
            <NavegadorDoPainel>{children}</NavegadorDoPainel>
          ) : (
            <AreaCarregando rotulo="Carregando o painel">
              <Row.Lista>
                <Row.Skeleton repetir={6} />
              </Row.Lista>
            </AreaCarregando>
          )}
        </main>
      </div>

      <Sheet
        aberto={folha}
        aoFechar={() => setFolha(false)}
        titulo="Painel"
        largura="p"
      >
        <Lateral
          pathname={pathname}
          pendencias={pendencias}
          conta={conta}
          aoBuscar={() => {
            setFolha(false);
            setPaleta(true);
          }}
          naFolha
        />
      </Sheet>

      <Paleta aberta={paleta} aoFechar={() => setPaleta(false)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lateral aberta
// ---------------------------------------------------------------------------

interface Conta {
  nome: string;
  imagem: string | null;
}

function Lateral({
  pathname,
  pendencias,
  conta,
  aoRecolher,
  aoBuscar,
  naFolha = false,
}: {
  pathname: string;
  pendencias: Pendencias | undefined;
  conta: Conta;
  aoRecolher?: () => void;
  aoBuscar: () => void;
  naFolha?: boolean;
}) {
  const grupoAtual = acharAtual(pathname)?.grupo.id;
  const [abertos, setAbertos] = useState<string[]>([]);

  useEffect(
    () => setAbertos(ler(CHAVE_ABERTOS, ['moderacao', 'catalogo'])),
    []
  );

  const alternar = (id: string) =>
    setAbertos((a) => {
      const novo = a.includes(id) ? a.filter((x) => x !== id) : [...a, id];
      gravar(CHAVE_ABERTOS, novo);
      return novo;
    });

  return (
    <div className="flex h-full min-h-0 flex-col">
      {!naFolha && (
        <div className="flex items-center gap-2.5 py-4 pl-5 pr-3">
          <Link
            href="/admin"
            className="flex min-w-0 flex-1 items-center gap-2.5"
          >
            <GiGrandPiano
              className="h-7 w-7 shrink-0 text-ouro-texto"
              aria-hidden="true"
            />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="font-display text-lg">Opus Atlas</span>
              <span className="t-legenda truncate">Painel administrativo</span>
            </span>
          </Link>
          {aoRecolher && (
            <Button
              variante="fantasma"
              tamanho="p"
              icone={PiCaretLeft}
              rotulo="Recolher o menu"
              onClick={aoRecolher}
              aria-expanded="true"
            />
          )}
        </div>
      )}

      <div className={cx('pb-3', naFolha ? 'px-0' : 'px-4')}>
        <button
          type="button"
          onClick={aoBuscar}
          className="flex min-h-9 w-full items-center gap-2 rounded-controle border border-linha px-3 text-sm text-texto-fraco transition-colors duration-[var(--t-resposta)] ease-saida hover:border-linha-forte hover:text-texto-suave [@media(pointer:coarse)]:min-h-[var(--alvo)]"
        >
          <Icon de={PiMagnifyingGlass} tamanho="pp" />
          <span className="flex-1 text-left">Ir para…</span>
          <kbd className="t-dado rounded-[6px] border border-linha px-1.5 text-xs max-lg:hidden">
            ⌘K
          </kbd>
        </button>
      </div>

      <nav
        aria-label="Painel"
        className={cx(
          'flex-1 overflow-y-auto pb-4 rolagem-discreta',
          naFolha ? 'px-0' : 'px-3'
        )}
      >
        <ul className="flex flex-col gap-0.5">
          {NAVEGACAO.map((g) => {
            const soUm = g.itens.length === 1;
            const aberto = abertos.includes(g.id) || g.id === grupoAtual;
            const esperando = g.itens.reduce(
              (s, i) => s + contagem(pendencias, i.pendencia),
              0
            );

            if (soUm) {
              const i = g.itens[0];
              return (
                <li key={g.id}>
                  <ItemLateral
                    href={i.href}
                    ativo={acharAtual(pathname)?.item.href === i.href}
                  >
                    <Icon de={g.icone} className="text-texto-fraco" />
                    <span className="flex-1">{i.rotulo}</span>
                  </ItemLateral>
                </li>
              );
            }

            return (
              <li key={g.id}>
                <button
                  type="button"
                  aria-expanded={aberto}
                  onClick={() => alternar(g.id)}
                  className="flex min-h-9 w-full items-center gap-3 rounded-controle px-3 text-left text-sm text-texto-suave transition-colors duration-[var(--t-toque)] ease-saida hover:text-texto [@media(pointer:coarse)]:min-h-[var(--alvo)]"
                >
                  <Icon de={g.icone} className="text-texto-fraco" />
                  <span className="flex-1">{g.rotulo}</span>
                  {!aberto && <Contador n={esperando} />}
                  <Icon
                    de={PiCaretDown}
                    tamanho="pp"
                    className={cx(
                      'text-texto-fraco transition-transform duration-[var(--t-resposta)] ease-saida motion-reduce:transition-none',
                      !aberto && '-rotate-90'
                    )}
                  />
                </button>
                {aberto && (
                  <ul className="flex flex-col pb-2 pl-7">
                    {g.itens.map((i) => (
                      <li key={i.href}>
                        <ItemLateral
                          href={i.href}
                          ativo={acharAtual(pathname)?.item.href === i.href}
                        >
                          <span className="flex-1">{i.rotulo}</span>
                          <Contador
                            n={contagem(pendencias, i.pendencia)}
                            forte
                          />
                        </ItemLateral>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={cx(
          'flex items-center gap-3 border-t border-linha py-3',
          naFolha ? 'px-0' : 'px-4'
        )}
      >
        <Avatar conta={conta} />
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-medium">{conta.nome}</span>
          <Link
            href="/"
            className="t-legenda inline-flex items-center gap-1 hover:text-texto"
          >
            Ver o site <Icon de={PiArrowSquareOut} tamanho="pp" />
          </Link>
        </span>
        <ThemeToggle variant="compact" />
        <Button
          variante="fantasma"
          tamanho="p"
          icone={PiSignOut}
          rotulo="Sair"
          onClick={() => signOut({ callbackUrl: '/', redirect: true })}
        />
      </div>
    </div>
  );
}

function ItemLateral({
  href,
  ativo,
  children,
}: {
  href: string;
  ativo: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={ativo ? 'page' : undefined}
      className={cx(
        'flex min-h-9 w-full items-center gap-3 rounded-controle px-3 text-sm',
        'transition-colors duration-[var(--t-toque)] ease-saida [@media(pointer:coarse)]:min-h-[var(--alvo)]',
        ativo
          ? 'fundo-sup-1 font-medium text-texto shadow-[var(--sombra-1)]'
          : 'text-texto-suave hover:bg-[var(--interactive-hover)] hover:text-texto'
      )}
    >
      {children}
    </Link>
  );
}

/** Número de pendências: só número, sem bolha colorida; forte no item. */
function Contador({ n, forte = false }: { n: number; forte?: boolean }) {
  if (!n) return null;
  return (
    <span
      className={cx(
        't-dado min-w-6 rounded-full px-1.5 text-center text-xs leading-5',
        forte ? 'tint-ouro text-ouro-na-tinta' : 'text-texto-fraco'
      )}
    >
      {n > 99 ? '99+' : n}
    </span>
  );
}

function Avatar({ conta }: { conta: Conta }) {
  return conta.imagem ? (
    // eslint-disable-next-line @next/next/no-img-element -- avatar de 36px, vindo de qualquer domínio
    <img
      src={conta.imagem}
      alt=""
      className="h-9 w-9 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full tint-ouro font-medium text-ouro-na-tinta">
      {conta.nome.charAt(0).toUpperCase()}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Lateral recolhida
// ---------------------------------------------------------------------------

function LateralRecolhida({
  pathname,
  pendencias,
  conta,
  aoExpandir,
  aoBuscar,
}: {
  pathname: string;
  pendencias: Pendencias | undefined;
  conta: Conta;
  aoExpandir: () => void;
  aoBuscar: () => void;
}) {
  const grupoAtual = acharAtual(pathname)?.grupo.id;
  const [aberto, setAberto] = useState<{
    grupo: GrupoNav;
    topo: number;
  } | null>(null);
  const fechar = useRef<ReturnType<typeof setTimeout> | null>(null);

  const abrir = useCallback((grupo: GrupoNav, alvo: HTMLElement) => {
    if (fechar.current) clearTimeout(fechar.current);
    setAberto({ grupo, topo: alvo.getBoundingClientRect().top });
  }, []);

  const agendarFechar = () => {
    if (fechar.current) clearTimeout(fechar.current);
    fechar.current = setTimeout(() => setAberto(null), 180);
  };

  useEffect(() => setAberto(null), [pathname]);

  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(null);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [aberto]);

  return (
    <div className="flex h-full flex-col items-center gap-1 py-4">
      <Link
        href="/admin"
        className="mb-1 grid h-10 w-10 place-items-center"
        title="Painel"
      >
        <GiGrandPiano className="h-7 w-7 text-ouro-texto" aria-hidden="true" />
        <span className="sr-only">Painel</span>
      </Link>
      <Button
        variante="fantasma"
        tamanho="p"
        icone={PiCaretRight}
        rotulo="Abrir o menu"
        onClick={aoExpandir}
        aria-expanded="false"
      />
      <Button
        variante="fantasma"
        tamanho="p"
        icone={PiMagnifyingGlass}
        rotulo="Ir para (⌘K)"
        onClick={aoBuscar}
        className="mb-2"
      />

      <nav
        aria-label="Painel"
        className="flex flex-1 flex-col items-center gap-1"
      >
        {NAVEGACAO.map((g) => {
          const esperando = g.itens.reduce(
            (s, i) => s + contagem(pendencias, i.pendencia),
            0
          );
          const ativo = g.id === grupoAtual;
          const classe = cx(
            'relative grid h-11 w-11 place-items-center rounded-controle transition-colors duration-[var(--t-toque)] ease-saida',
            ativo
              ? 'fundo-sup-1 text-texto shadow-[var(--sombra-1)]'
              : 'text-texto-fraco hover:bg-[var(--interactive-hover)] hover:text-texto'
          );
          const ponto = esperando > 0 && (
            <span
              aria-hidden="true"
              className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-ouro"
            />
          );

          if (g.itens.length === 1) {
            return (
              <Link
                key={g.id}
                href={g.itens[0].href}
                aria-current={ativo ? 'page' : undefined}
                className={classe}
                title={g.rotulo}
                onMouseEnter={(e) => abrir(g, e.currentTarget)}
                onMouseLeave={agendarFechar}
                onFocus={(e) => abrir(g, e.currentTarget)}
                onBlur={agendarFechar}
              >
                <Icon de={g.icone} tamanho="m" />
                <span className="sr-only">{g.rotulo}</span>
                {ponto}
              </Link>
            );
          }

          return (
            <button
              key={g.id}
              type="button"
              aria-haspopup="true"
              aria-expanded={aberto?.grupo.id === g.id}
              className={classe}
              onMouseEnter={(e) => abrir(g, e.currentTarget)}
              onMouseLeave={agendarFechar}
              onFocus={(e) => abrir(g, e.currentTarget)}
              onClick={(e) => abrir(g, e.currentTarget)}
            >
              <Icon de={g.icone} tamanho="m" />
              <span className="sr-only">
                {g.rotulo}
                {esperando > 0 ? `, ${esperando} esperando` : ''}
              </span>
              {ponto}
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-2">
        <ThemeToggle variant="compact" />
        <span title={conta.nome}>
          <Avatar conta={conta} />
        </span>
        <Button
          variante="fantasma"
          tamanho="p"
          icone={PiSignOut}
          rotulo="Sair"
          onClick={() => signOut({ callbackUrl: '/', redirect: true })}
        />
      </div>

      {/* As páginas do assunto, ao lado do ícone. `fixed` para escapar da
          rolagem da lateral, que cortaria um menu posicionado dentro dela. */}
      {aberto && (
        <div
          role="menu"
          aria-label={aberto.grupo.rotulo}
          className="sup-alta fixed left-[80px] z-menu flex w-60 flex-col gap-0.5 !rounded-card p-2"
          style={{
            top: Math.min(
              aberto.topo - 8,
              window.innerHeight - 60 - aberto.grupo.itens.length * 40
            ),
          }}
          onMouseEnter={() => fechar.current && clearTimeout(fechar.current)}
          onMouseLeave={agendarFechar}
        >
          <span className="t-legenda px-3 pb-1 pt-1.5">
            {aberto.grupo.rotulo}
          </span>
          {aberto.grupo.itens.map((i) => {
            const ativo = acharAtual(pathname)?.item.href === i.href;
            return (
              <Link
                key={i.href}
                href={i.href}
                role="menuitem"
                aria-current={ativo ? 'page' : undefined}
                onBlur={agendarFechar}
                onFocus={() => fechar.current && clearTimeout(fechar.current)}
                className={cx(
                  'flex min-h-9 items-center gap-2 rounded-controle px-3 text-sm',
                  ativo
                    ? 'bg-sup-2 font-medium text-texto'
                    : 'text-texto-suave hover:bg-[var(--interactive-hover)] hover:text-texto'
                )}
              >
                <span className="flex-1">{i.rotulo}</span>
                <Contador n={contagem(pendencias, i.pendencia)} forte />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
