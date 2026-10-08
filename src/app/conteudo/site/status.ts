import type { Idioma } from '../legal/tipos';

/** Copy for the 404, 401 and 403 pages. The number reads like a catalog entry: "Op. 404". */
const pt = {
  op: 'Op.',
  paths: 'Outros caminhos',
  notFound: {
    name: 'Partitura perdida',
    metaTitle: 'Página não encontrada · Opus Atlas',
    site: {
      title: 'Página não encontrada.',
      text: 'O link pode estar errado ou a página mudou de endereço. Busque pelo nome do compositor ou da obra.',
    },
    blog: {
      title: 'Artigo não encontrado.',
      text: 'Este artigo mudou de endereço ou saiu do ar. Busque pelo título.',
    },
    portal: {
      title: 'Esta tela do portal não existe.',
      text: 'A aula ou a tarefa pode ter sido apagada, ou o link é de outra conta.',
    },
    search: 'Buscar no Opus Atlas',
    placeholder: 'Um compositor, uma obra…',
    submit: 'Buscar',
    report: 'O link era nosso? Avise a gente',
    reported: 'Obrigado. A equipe vai olhar esse link.',
    quote: {
      text: 'Sem música, a vida seria um erro.',
      author: 'Friedrich Nietzsche',
    },
  },
  signIn: {
    name: 'Ensaio fechado',
    metaTitle: 'Entre para continuar · Opus Atlas',
    title: 'Entre para continuar.',
    text: 'Esta página é pessoal, como os seus estudos, os seus envios ou as suas aulas. Depois de entrar, você volta direto para cá.',
    signIn: 'Entrar',
    signUp: 'Criar conta grátis',
  },
  denied: {
    name: 'Ensaio fechado',
    metaTitle: 'Sem acesso · Opus Atlas',
    title: 'Você não tem acesso a esta página.',
    home: 'Voltar ao início',
    back: 'Página anterior',
    untouched: 'Nada foi apagado ou alterado.',
  },
  error: {
    name: 'Corda partida',
    title: 'Algo deu errado do nosso lado.',
    text: 'Não foi culpa sua. Tente de novo em instantes; se continuar, avise a gente.',
    retry: 'Tentar de novo',
    home: 'Voltar ao início',
    report: 'Avisar a equipe',
  },
  quote: {
    text: 'Onde as palavras falham, a música fala.',
    author: 'Hans Christian Andersen',
  },
  links: {
    composers: ['Compositores', 'Vidas, obras e épocas'],
    works: ['Obras', 'Com a partitura para baixar'],
    history: ['História da música', 'Da Idade Média a hoje'],
    articles: ['Artigos', 'Tudo o que já publicamos'],
    calendar: ['Concertos', 'A agenda dos próximos'],
    encyclopedia: ['Compositores', 'Volte à enciclopédia'],
    teacher: ['Portal do professor', 'As aulas e tarefas de hoje'],
    student: ['Portal do aluno', 'As suas aulas e tarefas'],
    studies: ['Seus estudos', 'O que você está estudando'],
    open: ['Obras', 'Partituras grátis, sem conta'],
    plans: ['Planos', 'O que a conta guarda'],
  } as Record<string, [string, string]>,
};

const en: typeof pt = {
  op: 'Op.',
  paths: 'Other paths',
  notFound: {
    name: 'A lost score',
    metaTitle: 'Page not found · Opus Atlas',
    site: {
      title: 'Page not found.',
      text: 'The link may be wrong or the page has moved. Search for the composer or the work by name.',
    },
    blog: {
      title: 'Article not found.',
      text: 'This article has moved or is no longer published. Search by its title.',
    },
    portal: {
      title: 'This portal screen does not exist.',
      text: 'The lesson or assignment may have been deleted, or the link belongs to another account.',
    },
    search: 'Search Opus Atlas',
    placeholder: 'A composer, a work…',
    submit: 'Search',
    report: 'Was it our link? Let us know',
    reported: 'Thanks. The team will look at that link.',
    quote: {
      text: 'Without music, life would be a mistake.',
      author: 'Friedrich Nietzsche',
    },
  },
  signIn: {
    name: 'Closed rehearsal',
    metaTitle: 'Sign in to continue · Opus Atlas',
    title: 'Sign in to continue.',
    text: 'This page is personal, like your studies, your uploads or your lessons. Once you sign in, you come straight back here.',
    signIn: 'Sign in',
    signUp: 'Create a free account',
  },
  denied: {
    name: 'Closed rehearsal',
    metaTitle: 'No access · Opus Atlas',
    title: 'You do not have access to this page.',
    home: 'Back to the home page',
    back: 'Previous page',
    untouched: 'Nothing was deleted or changed.',
  },
  error: {
    name: 'A broken string',
    title: 'Something went wrong on our side.',
    text: 'It was not your fault. Try again in a moment; if it keeps happening, let us know.',
    retry: 'Try again',
    home: 'Back to the home page',
    report: 'Tell the team',
  },
  quote: {
    text: 'Where words fail, music speaks.',
    author: 'Hans Christian Andersen',
  },
  links: {
    composers: ['Composers', 'Lives, works and eras'],
    works: ['Works', 'With the score to download'],
    history: ['History of music', 'From the Middle Ages to today'],
    articles: ['Articles', 'Everything we have published'],
    calendar: ['Concerts', 'The upcoming calendar'],
    encyclopedia: ['Composers', 'Back to the encyclopedia'],
    teacher: ['Teacher portal', 'Today’s lessons and assignments'],
    student: ['Student portal', 'Your lessons and assignments'],
    studies: ['Your studies', 'What you are studying'],
    open: ['Works', 'Free scores, no account needed'],
    plans: ['Plans', 'What an account keeps'],
  },
};

export const STATUS: Record<Idioma, typeof pt> = { pt, en };
export type StatusCopy = typeof pt;
