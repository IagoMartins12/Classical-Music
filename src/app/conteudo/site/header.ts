import type { Idioma } from '../legal/tipos';

/**
 * Interface copy for the site header (desktop, tablet and the mobile menu).
 *
 * Bundled instead of fetched: the header paints on every page, outside the
 * page's TranslationProvider, so loading `/translations/navbar.json` on the
 * client made it flash. The language comes from the URL, like the blog.
 */
const pt = {
  label: 'Navegação principal',
  home: 'Opus Atlas, início',
  explore: 'Explorar',
  blog: 'Blog',
  teaching: 'Ensino',
  about: 'Sobre',
  plans: 'Planos',
  signIn: 'Entrar',
  signUp: 'Criar conta',
  openMenu: 'Abrir o menu',
  menu: 'Menu',
  back: 'Voltar',
  language: 'Idioma',
  theme: 'Tema',
  account: 'Sua conta',
  accountShort: 'Perfil',
  completeProfile: 'Complete seu perfil',
  signOut: 'Sair',
  signedOut: 'Você saiu da conta.',
  signOutError: 'Não foi possível sair. Tente de novo.',
  notifications: {
    label: 'Avisos',
    unread: (n: number) =>
      n === 1 ? 'Avisos, 1 não lido' : `Avisos, ${n} não lidos`,
    empty:
      'Nenhum aviso por enquanto. A resposta das suas denúncias e as novidades da sua conta aparecem aqui.',
    failed: 'Não foi possível carregar os avisos.',
    retry: 'Tentar de novo',
    readAll: 'Marcar todos como lidos',
    unreadMark: 'não lido',
  },
  explorePaths: {
    composers: {
      label: 'Compositores',
      detail: 'Vidas, obras e épocas',
    },
    works: { label: 'Obras', detail: 'Com a partitura para baixar' },
    history: {
      label: 'História da música',
      detail: 'As épocas, em ordem',
    },
    instruments: {
      label: 'Instrumentos',
      detail: 'Das cordas ao órgão',
    },
  },
  accountLinks: {
    profile: 'Meu perfil',
    learning: 'Estudos',
    favorites: 'Favoritos',
    annotations: 'Anotações',
    uploads: 'Envios',
    achievements: 'Conquistas',
    collections: 'Coleções',
    teacher: 'Portal do professor',
    student: 'Portal do aluno',
    moderation: 'Moderação',
    admin: 'Administração',
  },
  search: {
    label: 'Buscar no Opus Atlas',
    placeholder: 'Buscar compositor, obra, artigo',
    open: 'Abrir a busca',
    featured: 'Compositores em destaque',
    shortcuts: 'Atalhos',
    links: {
      onThisDay: 'Quem nasceu hoje',
      history: 'História da música',
      instruments: 'Instrumentos',
      beginner: 'Obras para quem está começando',
    },
    title: 'Buscar',
    hint: 'Digite ao menos duas letras',
    searching: 'Buscando…',
    empty: 'Nada encontrado. Tente outro nome ou uma grafia diferente.',
    error: 'A busca falhou. Tente de novo em instantes.',
    composers: 'Compositores',
    works: 'Obras',
    articles: 'Artigos',
    seeAll: 'Ver todos os resultados',
  },
};

const en: typeof pt = {
  label: 'Main navigation',
  home: 'Opus Atlas, home',
  explore: 'Explore',
  blog: 'Blog',
  teaching: 'Teaching',
  about: 'About',
  plans: 'Plans',
  signIn: 'Sign in',
  signUp: 'Create account',
  openMenu: 'Open the menu',
  menu: 'Menu',
  back: 'Back',
  language: 'Language',
  theme: 'Theme',
  account: 'Your account',
  accountShort: 'Profile',
  completeProfile: 'Complete your profile',
  signOut: 'Sign out',
  signedOut: 'You signed out.',
  signOutError: 'Could not sign out. Try again.',
  notifications: {
    label: 'Notifications',
    unread: (n: number) =>
      n === 1 ? 'Notifications, 1 unread' : `Notifications, ${n} unread`,
    empty:
      'Nothing yet. Answers to your reports and news about your account show up here.',
    failed: 'Could not load your notifications.',
    retry: 'Try again',
    readAll: 'Mark all as read',
    unreadMark: 'unread',
  },
  explorePaths: {
    composers: { label: 'Composers', detail: 'Lives, works and eras' },
    works: { label: 'Works', detail: 'With the score to download' },
    history: { label: 'History of music', detail: 'The eras, in order' },
    instruments: {
      label: 'Instruments',
      detail: 'From strings to the organ',
    },
  },
  accountLinks: {
    profile: 'My profile',
    learning: 'Studies',
    favorites: 'Favorites',
    annotations: 'Annotations',
    uploads: 'Uploads',
    achievements: 'Achievements',
    collections: 'Collections',
    teacher: 'Teacher portal',
    student: 'Student portal',
    moderation: 'Moderation',
    admin: 'Administration',
  },
  search: {
    label: 'Search Opus Atlas',
    placeholder: 'Search composer, work, article',
    open: 'Open search',
    featured: 'Featured composers',
    shortcuts: 'Shortcuts',
    links: {
      onThisDay: 'Born today',
      history: 'Music history',
      instruments: 'Instruments',
      beginner: 'Works for beginners',
    },
    title: 'Search',
    hint: 'Type at least two letters',
    searching: 'Searching…',
    empty: 'Nothing found. Try another name or spelling.',
    error: 'Search failed. Try again in a moment.',
    composers: 'Composers',
    works: 'Works',
    articles: 'Articles',
    seeAll: 'See all results',
  },
};

export const HEADER: Record<Idioma, typeof pt> = { pt, en };

export type HeaderCopy = typeof pt;
