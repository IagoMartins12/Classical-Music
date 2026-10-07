'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GiGrandPiano } from 'react-icons/gi';
import {
  PiArticle,
  PiBookmarkSimple,
  PiCaretDown,
  PiCaretRight,
  PiHeart,
  PiList,
  PiMagnifyingGlass,
  PiNotePencil,
  PiSignOut,
  PiSquaresFour,
  PiUser,
} from 'react-icons/pi';
import { LanguageToggle } from '@/app/components/LanguageToggle';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { MenuScreen, MenuScreenHeader } from '@/app/components/ui/MenuScreen';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { useAuth } from '@/app/hooks/useAuth';
import { signOut } from '@/app/libs/session';
import { useLoginModal, useRegisterModal } from '@/app/stores/authStore';
import { BLOG, type Idioma } from '@/app/conteudo/blog';
import {
  listarMaisLidos,
  type CategoriaRef,
  type ResumoDeArtigo,
} from '@/app/requests/blog/leitura';
import { autocomplete, type Autocomplete } from '@/app/requests/blog/taxonomy';
import { localizeHref, stripLanguagePrefix } from '@/app/utils/localizedRoutes';
import { rotasDoBlog } from '@/app/utils/blog/rotas';
import { Avatar } from './pecas';

/**
 * O cabeçalho do blog, na família do cabeçalho do site (01/10): o piano com
 * brilho, a marca em dourado, os links com o sublinhado que cresce, a
 * bandeira de idioma (com o aviso de "traduzindo") e o tema.
 *
 * **A marca** é "Blog do Opus Atlas" com o lema embaixo, em duas linhas
 * curtas: cabe no telefone sem empurrar a busca. O link para o site
 * principal chama "Explorar o acervo" e brilha como o "Blog" brilha lá.
 *
 * **Categorias** ganha um chevron com as categorias marcadas no painel
 * ("No menu Categorias"); no telefone, elas viram uma sublista no menu.
 *
 * A busca abre numa folha com sugestões enquanto se digita. Ctrl K (⌘K no
 * Mac) abre de qualquer lugar, sem anúncio na tela.
 */
export function CabecalhoDoBlog({
  idioma,
  categorias,
}: {
  idioma: Idioma;
  categorias: CategoriaRef[];
}) {
  const t = BLOG[idioma];
  const pathname = usePathname() ?? '/blog';
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { open: abrirLogin } = useLoginModal();
  const { open: abrirCadastro } = useRegisterModal();

  const [menu, setMenu] = useState(false);
  const [vista, setVista] = useState<'principal' | 'perfil' | 'categorias'>(
    'principal'
  );
  const [busca, setBusca] = useState(false);
  const [conta, setConta] = useState(false);
  const [listaDeCategorias, setListaDeCategorias] = useState(false);
  const contaRef = useRef<HTMLDivElement>(null);
  const categoriasRef = useRef<HTMLDivElement>(null);
  const noMenu = categorias.filter((c) => c.noMenu);

  // Nível 2 é administrador; o 1 é professor e não abre o painel (ver
  // `common/auth/roles` na API). Escreve quem é um ou outro.
  const admin = (user?.role ?? 0) >= 2;
  const escreve = admin || !!user?.isTeacher;
  const limpo = stripLanguagePrefix(pathname);

  const itens = [
    {
      rotulo: t.nav.artigos,
      href: rotasDoBlog.artigos(idioma),
      ativo: limpo.startsWith('/blog/articles'),
    },
    {
      rotulo: t.nav.categorias,
      href: rotasDoBlog.categorias(idioma),
      ativo: limpo.startsWith('/blog/category'),
    },
    {
      rotulo: t.nav.agenda,
      href: rotasDoBlog.agenda(idioma),
      ativo: limpo.startsWith('/blog/calendar'),
    },
  ];

  const itensDaConta = [
    { rotulo: t.nav.perfil, href: '/profile', icone: PiUser },
    {
      rotulo: t.nav.salvos,
      href: rotasDoBlog.salvos(),
      icone: PiBookmarkSimple,
    },
    { rotulo: t.nav.curtidos, href: rotasDoBlog.curtidos(), icone: PiHeart },
    ...(escreve
      ? [
          {
            rotulo: t.nav.escrever,
            href: admin
              ? rotasDoBlog.escrever()
              : rotasDoBlog.escreverComoAutor(),
            icone: PiNotePencil,
          },
          {
            rotulo: t.nav.publicados,
            href: rotasDoBlog.meusArtigos(),
            icone: PiArticle,
          },
        ]
      : []),
    ...(admin
      ? [
          {
            rotulo: t.nav.painel,
            href: rotasDoBlog.painel(),
            icone: PiSquaresFour,
          },
        ]
      : []),
  ];

  // Ctrl K / ⌘K abre a busca.
  useEffect(() => {
    const atalho = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setBusca(true);
      }
    };
    document.addEventListener('keydown', atalho);
    return () => document.removeEventListener('keydown', atalho);
  }, []);

  // Os menus suspensos fecham ao clicar fora ou com Esc.
  useEffect(() => {
    if (!conta && !listaDeCategorias) return;
    const fora = (e: MouseEvent) => {
      if (!contaRef.current?.contains(e.target as Node)) setConta(false);
      if (!categoriasRef.current?.contains(e.target as Node))
        setListaDeCategorias(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setConta(false);
      setListaDeCategorias(false);
    };
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', fora);
      document.removeEventListener('keydown', esc);
    };
  }, [conta, listaDeCategorias]);

  /** A troca de idioma do blog é por endereço: `/blog` ↔ `/en/blog`. */
  const irParaIdioma = (novo: Idioma) => {
    setMenu(false);
    router.push(localizeHref(limpo, novo));
  };

  async function sair() {
    setConta(false);
    setMenu(false);
    await signOut({ redirect: false });
    router.refresh();
  }

  const nomeDoUsuario =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.email?.split('@')[0] ||
    '';

  return (
    <header className="navbar-classical sticky top-0 z-barra">
      <div className="mx-auto flex h-16 w-full max-w-[1360px] items-center gap-4 px-4 sm:h-[4.5rem] sm:px-6 lg:px-10">
        <Link
          href={rotasDoBlog.inicio(idioma)}
          aria-label={t.nav.marca}
          className="group flex min-h-[var(--alvo)] shrink-0 items-center gap-2.5 rounded-controle"
        >
          <GiGrandPiano
            aria-hidden="true"
            className="icon-glow h-7 w-7 shrink-0 text-ouro-texto transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none sm:h-8 sm:w-8"
          />
          <span className="flex flex-col">
            <span className="font-display text-[1.3125rem] leading-none sm:text-[1.5rem]">
              {idioma === 'pt' ? (
                <>
                  <span className="italic text-texto-suave">
                    {t.nav.marcaDo}{' '}
                  </span>
                  <span className="gold-shine font-semibold">Opus Atlas</span>
                </>
              ) : (
                <>
                  <span className="gold-shine font-semibold">Opus Atlas</span>
                  <span className="italic text-texto-suave"> Blog</span>
                </>
              )}
            </span>
            <span className="mt-1 hidden text-[0.75rem] leading-none text-texto-fraco sm:block">
              {t.nav.lema}
            </span>
          </span>
        </Link>

        <nav
          aria-label={t.nav.rotulo}
          className="ml-4 hidden items-center gap-1 lg:flex xl:ml-8"
        >
          {itens.map((item) =>
            item.href === rotasDoBlog.categorias(idioma) && noMenu.length ? (
              <div
                key={item.rotulo}
                ref={categoriasRef}
                className="relative flex items-center"
                onMouseEnter={() => setListaDeCategorias(true)}
                onMouseLeave={() => setListaDeCategorias(false)}
              >
                <LinkDaBarra item={item} />
                <button
                  type="button"
                  aria-expanded={listaDeCategorias}
                  aria-controls="menu-categorias"
                  aria-label={t.nav.abrirCategorias}
                  onClick={() => setListaDeCategorias((v) => !v)}
                  className="-ml-2 grid h-9 w-8 place-items-center rounded-controle text-texto-fraco hover:text-texto"
                >
                  <Icon
                    de={PiCaretDown}
                    tamanho="pp"
                    className={cx(
                      'transition-transform duration-[var(--t-toque)]',
                      listaDeCategorias && 'rotate-180'
                    )}
                  />
                </button>
                {listaDeCategorias && (
                  <div
                    id="menu-categorias"
                    className="absolute left-0 top-full z-menu pt-2"
                  >
                    <ul className="sup-alta w-64 !rounded-card p-2">
                      {noMenu.map((c) => (
                        <li key={c.slug}>
                          <Link
                            href={rotasDoBlog.categoria(c.slug, idioma)}
                            onClick={() => setListaDeCategorias(false)}
                            aria-current={
                              limpo === `/blog/category/${c.slug}`
                                ? 'page'
                                : undefined
                            }
                            className="flex min-h-[var(--alvo)] items-center rounded-controle px-3 text-[0.9375rem] text-texto-suave hover:bg-sup-2 hover:text-texto aria-[current=page]:text-ouro-texto"
                          >
                            {c.nome}
                          </Link>
                        </li>
                      ))}
                      <li className="mt-1 border-t border-linha pt-1">
                        <Link
                          href={rotasDoBlog.categorias(idioma)}
                          onClick={() => setListaDeCategorias(false)}
                          className="flex min-h-[var(--alvo)] items-center rounded-controle px-3 text-[0.875rem] font-medium text-ouro-texto hover:bg-sup-2"
                        >
                          {t.nav.todasCategorias}
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <LinkDaBarra key={item.rotulo} item={item} />
            )
          )}
          <Link
            href={localizeHref('/', idioma)}
            className="group relative ml-1 flex min-h-[var(--alvo)] items-center rounded-controle px-3 text-[0.9375rem] font-medium"
          >
            <span className="gold-shine">{t.nav.acervo}</span>
            <span
              aria-hidden="true"
              className="absolute inset-x-3 bottom-2 h-px origin-left scale-x-0 bg-ouro transition-transform duration-300 ease-saida group-hover:scale-x-100 motion-reduce:transition-none"
            />
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setBusca(true)}
            aria-keyshortcuts="Control+K Meta+K"
            className="mr-1 hidden min-h-[var(--alvo)] w-52 items-center gap-2 rounded-controle border border-linha-forte bg-[var(--campo)] px-3 text-sm text-texto-fraco transition-colors duration-[var(--t-toque)] hover:border-ouro/50 xl:flex"
          >
            <Icon de={PiMagnifyingGlass} />
            <span className="flex-1 text-left">{t.nav.buscar}</span>
          </button>
          <Button
            variante="fantasma"
            icone={PiMagnifyingGlass}
            rotulo={t.nav.buscar}
            aria-keyshortcuts="Control+K Meta+K"
            onClick={() => setBusca(true)}
            className="xl:hidden"
          />
          <LanguageToggle
            variant="compact"
            idioma={idioma}
            aoTrocar={irParaIdioma}
            className="hidden sm:flex"
          />
          <ThemeToggle variant="navbar" className="hidden sm:block" />

          {isAuthenticated ? (
            <div ref={contaRef} className="relative hidden lg:block">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={conta}
                onClick={() => setConta((c) => !c)}
                className="ml-1 flex min-h-[var(--alvo)] items-center rounded-full"
              >
                <Avatar
                  autor={{ nome: nomeDoUsuario, imagem: user?.image ?? null }}
                  tamanho="p"
                />
                <span className="sr-only">{t.nav.conta}</span>
              </button>
              {conta && (
                <div
                  role="menu"
                  aria-label={t.nav.conta}
                  className="sup-alta absolute right-0 top-full z-menu mt-2 w-60 !rounded-card p-2"
                >
                  <p className="truncate px-3 py-2 text-[0.875rem] text-texto-fraco">
                    {nomeDoUsuario}
                  </p>
                  {itensDaConta.map((item) => (
                    <Link
                      key={item.href}
                      role="menuitem"
                      href={item.href}
                      onClick={() => setConta(false)}
                      className="flex min-h-[var(--alvo)] items-center gap-3 rounded-controle px-3 text-[0.9375rem] text-texto-suave hover:bg-sup-2 hover:text-texto"
                    >
                      <Icon de={item.icone} />
                      {item.rotulo}
                    </Link>
                  ))}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={sair}
                    className="flex min-h-[var(--alvo)] w-full items-center gap-3 rounded-controle px-3 text-left text-[0.9375rem] text-texto-suave hover:bg-sup-2 hover:text-texto"
                  >
                    <Icon de={PiSignOut} />
                    {t.nav.sair}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <span className="ml-1 hidden lg:block">
              <Button tamanho="p" onClick={abrirLogin}>
                {t.nav.entrar}
              </Button>
            </span>
          )}

          <Button
            variante="fantasma"
            icone={PiList}
            rotulo={t.nav.abrirMenu}
            aria-expanded={menu}
            onClick={() => setMenu(true)}
            className="lg:hidden"
          />
        </div>
      </div>

      {/* No telefone, as categorias numa faixa que rola (esboço A). */}
      {categorias.length > 0 && (
        <nav
          aria-label={t.nav.secoes}
          className="border-t border-linha lg:hidden"
        >
          <ul className="mx-auto flex w-full max-w-[1360px] gap-6 overflow-x-auto px-4 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
            {categorias.map((c) => {
              const ativo = limpo === `/blog/category/${c.slug}`;
              return (
                <li key={c.slug} className="shrink-0">
                  <Link
                    href={rotasDoBlog.categoria(c.slug, idioma)}
                    aria-current={ativo ? 'page' : undefined}
                    className={cx(
                      'flex min-h-[var(--alvo)] items-center text-sm',
                      ativo ? 'font-medium text-ouro-texto' : 'text-texto-suave'
                    )}
                  >
                    {c.nome}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <Sheet
        aberto={menu}
        aoFechar={() => {
          setMenu(false);
          setVista('principal');
        }}
        titulo={t.nav.menu}
        largura="p"
      >
        {/* O menu do site principal (`Navbar`): três telas que deslizam —
            a principal, o perfil (tocando no seu nome) e as categorias
            (pela seta de Categorias) —, cada uma com voltar. */}
        <div className="relative overflow-hidden">
          <MenuScreen active={vista === 'principal'} side="left">
            <nav aria-label={t.nav.rotulo}>
              <ul className="flex flex-col gap-1">
                {itens.map((item) => (
                  <li key={item.rotulo} className="flex items-center">
                    <Link
                      href={item.href}
                      aria-current={item.ativo ? 'page' : undefined}
                      onClick={() => setMenu(false)}
                      className={cx(
                        'flex min-h-[var(--alvo)] flex-1 items-center rounded-controle px-4 font-medium transition-colors hover:bg-sup-2',
                        item.ativo ? 'text-ouro-texto' : 'text-texto-suave'
                      )}
                    >
                      {item.rotulo}
                    </Link>
                    {item.href === rotasDoBlog.categorias(idioma) &&
                      noMenu.length > 0 && (
                        <Button
                          variante="fantasma"
                          tamanho="p"
                          icone={PiCaretRight}
                          rotulo={t.nav.abrirCategorias}
                          onClick={() => setVista('categorias')}
                          className="ml-2"
                        />
                      )}
                  </li>
                ))}
                <li>
                  <Link
                    href={localizeHref('/', idioma)}
                    onClick={() => setMenu(false)}
                    className="flex min-h-[var(--alvo)] items-center rounded-controle px-4 font-medium hover:bg-sup-2"
                  >
                    <span className="gold-shine">{t.nav.acervo}</span>
                  </Link>
                </li>
              </ul>
            </nav>

            <hr className="my-4 border-linha" />

            {isAuthenticated ? (
              <ul className="flex flex-col gap-1">
                <li>
                  <button
                    type="button"
                    onClick={() => setVista('perfil')}
                    className="flex w-full items-center gap-3 rounded-controle px-4 py-2.5 text-left hover:bg-sup-2"
                  >
                    <Avatar
                      autor={{
                        nome: nomeDoUsuario,
                        imagem: user?.image ?? null,
                      }}
                      tamanho="p"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-texto">
                        {nomeDoUsuario}
                      </span>
                      <span className="t-legenda block">
                        {t.nav.perfilCurto}
                      </span>
                    </span>
                    <Icon de={PiCaretRight} className="text-texto-fraco" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={sair}
                    className="flex min-h-[var(--alvo)] w-full items-center gap-3 rounded-controle px-4 text-left text-[0.9375rem] text-texto-suave hover:bg-sup-2"
                  >
                    <Icon de={PiSignOut} />
                    {t.nav.sair}
                  </button>
                </li>
              </ul>
            ) : (
              <ul className="flex flex-col gap-1">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      abrirLogin();
                    }}
                    className="flex min-h-[var(--alvo)] w-full items-center rounded-controle px-4 text-left font-medium text-texto-suave hover:bg-sup-2"
                  >
                    {t.nav.entrar}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      abrirCadastro();
                    }}
                    className="flex min-h-[var(--alvo)] w-full items-center rounded-controle px-4 text-left font-medium text-ouro-texto hover:bg-sup-2"
                  >
                    {t.nav.criarConta}
                  </button>
                </li>
              </ul>
            )}

            <hr className="my-4 border-linha" />

            <div className="flex items-center justify-center gap-3 py-1">
              <LanguageToggle
                variant="compact"
                idioma={idioma}
                aoTrocar={irParaIdioma}
              />
              <ThemeToggle variant="navbar" />
            </div>
          </MenuScreen>

          <MenuScreen active={vista === 'perfil'} side="right">
            <MenuScreenHeader
              title={t.nav.perfilCurto}
              backLabel={t.nav.voltar}
              onBack={() => setVista('principal')}
            />
            <div className="mb-3 flex items-center gap-3 px-4 py-2">
              <Avatar
                autor={{ nome: nomeDoUsuario, imagem: user?.image ?? null }}
              />
              <span className="min-w-0">
                <span className="block truncate font-medium text-texto">
                  {nomeDoUsuario}
                </span>
                {user?.email && (
                  <span className="t-legenda block truncate">{user.email}</span>
                )}
              </span>
            </div>
            <ul className="flex flex-col gap-1">
              {itensDaConta.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenu(false)}
                    className="flex min-h-[var(--alvo)] items-center gap-3 rounded-controle px-4 text-[0.9375rem] text-texto-suave hover:bg-sup-2"
                  >
                    <Icon de={item.icone} />
                    {item.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </MenuScreen>

          <MenuScreen active={vista === 'categorias'} side="right">
            <MenuScreenHeader
              title={t.nav.categorias}
              backLabel={t.nav.voltar}
              onBack={() => setVista('principal')}
            />
            <ul className="flex flex-col gap-1">
              {noMenu.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={rotasDoBlog.categoria(c.slug, idioma)}
                    onClick={() => setMenu(false)}
                    className="flex min-h-[var(--alvo)] items-center rounded-controle px-4 text-[0.9375rem] text-texto-suave hover:bg-sup-2"
                  >
                    {c.nome}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={rotasDoBlog.categorias(idioma)}
                  onClick={() => setMenu(false)}
                  className="flex min-h-[var(--alvo)] items-center rounded-controle px-4 text-[0.9375rem] font-medium text-ouro-texto hover:bg-sup-2"
                >
                  {t.nav.todasCategorias}
                </Link>
              </li>
            </ul>
          </MenuScreen>
        </div>
      </Sheet>

      <BuscaDoBlog
        aberta={busca}
        aoFechar={() => setBusca(false)}
        idioma={idioma}
      />
    </header>
  );
}

/** Link da barra, com o sublinhado em ouro que cresce do meio (o do site). */
function LinkDaBarra({
  item,
}: {
  item: { rotulo: string; href: string; ativo: boolean };
}) {
  return (
    <Link
      href={item.href}
      aria-current={item.ativo ? 'page' : undefined}
      className={cx(
        'group relative flex min-h-[var(--alvo)] items-center rounded-controle px-3 text-[0.9375rem] font-medium transition-colors duration-[var(--t-toque)]',
        item.ativo ? 'text-ouro-texto' : 'text-texto-suave hover:text-texto'
      )}
    >
      {item.rotulo}
      <span
        aria-hidden="true"
        className={cx(
          'absolute inset-x-3 bottom-2 h-px bg-ouro transition-transform duration-300 ease-saida motion-reduce:transition-none',
          item.ativo ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        )}
      />
    </Link>
  );
}

/**
 * A busca do blog: sugestões enquanto se digita (artigos, categorias,
 * assuntos) e, com Enter, a página de resultados.
 */
function BuscaDoBlog({
  aberta,
  aoFechar,
  idioma,
}: {
  aberta: boolean;
  aoFechar: () => void;
  idioma: Idioma;
}) {
  const t = BLOG[idioma].busca;
  const router = useRouter();
  const [q, setQ] = useState('');
  const [sugestoes, setSugestoes] = useState<Autocomplete | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [maisLidos, setMaisLidos] = useState<ResumoDeArtigo[] | null>(null);

  // Antes de digitar, os cinco mais lidos: um começo para quem não sabe o
  // que procurar. Carrega na primeira abertura.
  useEffect(() => {
    if (!aberta || maisLidos) return;
    listarMaisLidos(5, { idioma })
      .then(setMaisLidos)
      .catch(() => setMaisLidos([]));
  }, [aberta, maisLidos, idioma]);

  useEffect(() => {
    const termo = q.trim();
    if (termo.length < 2) {
      setSugestoes(null);
      return;
    }
    setBuscando(true);
    const espera = setTimeout(async () => {
      try {
        setSugestoes(await autocomplete(termo, 'all'));
      } catch {
        setSugestoes(null);
      } finally {
        setBuscando(false);
      }
    }, 300);
    return () => clearTimeout(espera);
  }, [q]);

  function buscar(e: FormEvent) {
    e.preventDefault();
    if (q.trim().length < 2) return;
    aoFechar();
    router.push(rotasDoBlog.busca(q.trim()));
  }

  const nada =
    sugestoes &&
    !sugestoes.articles.length &&
    !sugestoes.categories.length &&
    !sugestoes.tags.length;

  const fecharEIr = () => {
    aoFechar();
    setQ('');
  };

  return (
    <Sheet aberto={aberta} aoFechar={aoFechar} titulo={t.titulo} largura="m">
      <div className="flex flex-col gap-6">
        <form role="search" onSubmit={buscar} className="flex flex-col gap-2">
          <label htmlFor="busca-do-blog" className="sr-only">
            {t.campo}
          </label>
          <input
            id="busca-do-blog"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.dica}
            className="input-classical !pl-4 text-lg"
          />
          <p role="status" className="t-legenda min-h-5">
            {buscando ? t.buscando : nada ? t.nada(q.trim()) : ''}
          </p>
        </form>

        {!sugestoes && q.trim().length < 2 && !!maisLidos?.length && (
          <div>
            <h3 className="t-legenda">{t.maisLidos}</h3>
            <ol className="mt-1">
              {maisLidos.map((a, i) => (
                <li
                  key={a.id}
                  className="border-b border-linha last:border-b-0"
                >
                  <Link
                    href={rotasDoBlog.artigo(a.slug, idioma)}
                    onClick={fecharEIr}
                    className="flex min-h-[var(--alvo)] items-baseline gap-4 py-2.5 hover:text-ouro-texto"
                  >
                    <span className="t-dado w-4 shrink-0 text-[0.875rem] text-texto-fraco">
                      {i + 1}
                    </span>
                    <span className="font-display text-xl leading-snug">
                      {a.titulo}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}

        {sugestoes && !nada && (
          <div className="flex flex-col gap-6">
            {sugestoes.articles.length > 0 && (
              <div>
                <h3 className="t-legenda">{t.artigos}</h3>
                <ul className="mt-1">
                  {sugestoes.articles.slice(0, 6).map((a) => (
                    <li
                      key={a.id}
                      className="border-b border-linha last:border-b-0"
                    >
                      <Link
                        href={rotasDoBlog.artigo(a.slug, idioma)}
                        onClick={fecharEIr}
                        className="flex min-h-[var(--alvo)] items-center py-2 font-display text-xl leading-snug hover:text-ouro-texto"
                      >
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(sugestoes.categories.length > 0 || sugestoes.tags.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {sugestoes.categories.map((c) => (
                  <Link
                    key={c.id}
                    href={rotasDoBlog.categoria(c.slug, idioma)}
                    onClick={fecharEIr}
                    className="inline-flex min-h-9 items-center rounded-full border border-linha-forte px-3.5 text-sm text-texto-suave hover:border-ouro/45 hover:text-ouro-texto"
                  >
                    {c.name}
                  </Link>
                ))}
                {sugestoes.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={rotasDoBlog.tag(tag.slug, idioma)}
                    onClick={fecharEIr}
                    className="inline-flex min-h-9 items-center rounded-full border border-linha-forte px-3.5 text-sm text-texto-suave hover:border-ouro/45 hover:text-ouro-texto"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
            <Link
              href={rotasDoBlog.busca(q.trim())}
              onClick={fecharEIr}
              className="t-rotulo font-medium text-ouro-texto underline underline-offset-4"
            >
              {t.verTodos(q.trim())}
            </Link>
          </div>
        )}
      </div>
    </Sheet>
  );
}
