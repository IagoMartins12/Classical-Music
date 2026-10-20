import type { ComponentType, SVGProps } from 'react';
import {
  PiArticle,
  PiChartLine,
  PiCurrencyDollar,
  PiEnvelopeSimple,
  PiGear,
  PiMusicNotes,
  PiShield,
  PiSquaresFour,
  PiUsers,
} from 'react-icons/pi';

/**
 * Dados de exemplo dos três esboços do painel.
 *
 * A navegação é a do painel de hoje, **inteira**: as 27 páginas de `/admin` e
 * as 10 de `/blog/admin`, reagrupadas por assunto. `rota` é o endereço que
 * existe hoje — nenhum muda (7.8.4: rotas e slugs não mudam no redesenho).
 *
 * Os números de catálogo são os da base (19.177 compositores, 207.890 obras,
 * 92.178 partituras); os demais são inventados para o esboço.
 */

type Glifo = ComponentType<SVGProps<SVGSVGElement>>;

export interface ItemNav {
  id: string;
  rotulo: string;
  rota: string;
  /** Contagem que pede ação (fila, pendência). Só onde há o que fazer. */
  pendentes?: number;
  /** O que mora ali, numa linha — usado no menu do esboço C. */
  resumo: string;
  /** Endereço que o painel de hoje aponta e não existe. */
  semPagina?: boolean;
}

export interface GrupoNav {
  id: string;
  rotulo: string;
  icone: Glifo;
  itens: ItemNav[];
}

export const NAVEGACAO: GrupoNav[] = [
  {
    id: 'geral',
    rotulo: 'Visão geral',
    icone: PiSquaresFour,
    itens: [
      {
        id: 'painel',
        rotulo: 'Painel',
        rota: '/admin',
        resumo: 'O que pede atenção hoje e os números da semana',
      },
    ],
  },
  {
    id: 'pessoas',
    rotulo: 'Pessoas',
    icone: PiUsers,
    itens: [
      {
        id: 'usuarios',
        rotulo: 'Usuários',
        rota: '/admin/users/list',
        resumo: 'Lista com filtros: anotadores, contribuidores, ativos',
      },
      {
        id: 'usuarios-analise',
        rotulo: 'Crescimento e retenção',
        rota: '/admin/users',
        resumo: 'Novos, ativos, retenção e tipos de conta',
      },
      {
        id: 'assinantes-planos',
        rotulo: 'Assinaturas',
        rota: '/admin/plans/subscribers',
        resumo: 'Quem assina cada plano',
        semPagina: true,
      },
    ],
  },
  {
    id: 'catalogo',
    rotulo: 'Catálogo',
    icone: PiMusicNotes,
    itens: [
      {
        id: 'compositores',
        rotulo: 'Compositores',
        rota: '/admin/composers',
        resumo: 'Verificação, qualidade e remoção sem obras',
      },
      {
        id: 'obras',
        rotulo: 'Obras',
        rota: '/admin/works',
        resumo: 'Edição, verificação e remoção sem dados de usuário',
      },
      {
        id: 'partituras',
        rotulo: 'Partituras',
        rota: '/admin/scores',
        resumo: 'Fonte, tipo e acessos',
      },
      {
        id: 'envios',
        rotulo: 'Envios',
        rota: '/admin/uploads',
        resumo: 'Histórico de contribuições e quem mais envia',
      },
    ],
  },
  {
    id: 'moderacao',
    rotulo: 'Moderação',
    icone: PiShield,
    itens: [
      {
        id: 'fila',
        rotulo: 'Fila de envios',
        rota: '/admin/moderation/moderate',
        pendentes: 14,
        resumo: 'Aprovar ou recusar o que as pessoas enviaram',
      },
      {
        id: 'denuncias',
        rotulo: 'Denúncias',
        rota: '/admin/moderation',
        pendentes: 3,
        resumo: 'Conteúdo denunciado, por motivo e tipo',
      },
      {
        id: 'relatorios',
        rotulo: 'Relatórios',
        rota: '/admin/reports-metric',
        resumo: 'Usuários, conteúdo e engajamento em CSV',
      },
    ],
  },
  {
    id: 'blog',
    rotulo: 'Blog',
    icone: PiArticle,
    itens: [
      {
        id: 'artigos',
        rotulo: 'Artigos',
        rota: '/blog/admin/articles',
        resumo: 'Escrever, editar e publicar',
      },
      {
        id: 'comentarios',
        rotulo: 'Comentários',
        rota: '/blog/admin/moderation',
        pendentes: 6,
        resumo: 'Aprovar, recusar e denúncias de comentário',
      },
      {
        id: 'categorias',
        rotulo: 'Categorias e tags',
        rota: '/blog/admin/categories',
        resumo:
          'Categorias em /blog/admin/categories, tags em /blog/admin/tags',
      },
      {
        id: 'midia',
        rotulo: 'Mídia',
        rota: '/admin/blog/media',
        resumo: 'Imagens do blog: usadas, soltas e temporárias',
      },
      {
        id: 'eventos',
        rotulo: 'Eventos importados',
        rota: '/admin/scrapers',
        resumo: 'Scrapers da agenda de concertos',
      },
    ],
  },
  {
    id: 'newsletter',
    rotulo: 'Newsletter',
    icone: PiEnvelopeSimple,
    itens: [
      {
        id: 'news-geral',
        rotulo: 'Resumo',
        rota: '/admin/newsletter',
        resumo: 'Assinantes, campanhas e entrega',
      },
      {
        id: 'campanhas',
        rotulo: 'Campanhas',
        rota: '/admin/newsletter/campaigns',
        resumo: 'Criar, agendar, testar e enviar',
      },
      {
        id: 'news-assinantes',
        rotulo: 'Assinantes',
        rota: '/admin/newsletter/subscribers',
        resumo: 'Lista, edição e exportação',
      },
      {
        id: 'modelos',
        rotulo: 'Modelos',
        rota: '/admin/newsletter/templates',
        resumo: 'Templates de e-mail e diagnóstico',
      },
      {
        id: 'listas-teste',
        rotulo: 'Listas de teste',
        rota: '/admin/newsletter/test-lists',
        resumo: 'Endereços para receber a prévia',
      },
      {
        id: 'news-numeros',
        rotulo: 'Números',
        rota: '/admin/newsletter/analytics',
        resumo: 'Abertura, clique e descadastro no período',
      },
    ],
  },
  {
    id: 'receita',
    rotulo: 'Receita',
    icone: PiCurrencyDollar,
    itens: [
      {
        id: 'planos',
        rotulo: 'Planos e preços',
        rota: '/admin/plans/pricing',
        resumo: 'Preço vigente de cada plano e histórico',
      },
      {
        id: 'cupons',
        rotulo: 'Cupons',
        rota: '/admin/plans/coupons',
        resumo: 'Criar, ativar e desativar',
      },
      {
        id: 'anuncios',
        rotulo: 'Anúncios',
        rota: '/admin/ads',
        resumo: 'Campanhas de anunciantes e desempenho',
      },
    ],
  },
  {
    id: 'numeros',
    rotulo: 'Números',
    icone: PiChartLine,
    itens: [
      {
        id: 'analytics',
        rotulo: 'Uso da plataforma',
        rota: '/admin/analytics',
        resumo: 'Engajamento, obras e compositores populares',
      },
      {
        id: 'insights',
        rotulo: 'Insights',
        rota: '/admin/insights',
        resumo: 'Funis, jornadas e riscos, com amostra declarada',
      },
    ],
  },
  {
    id: 'sistema',
    rotulo: 'Sistema',
    icone: PiGear,
    itens: [
      {
        id: 'saude',
        rotulo: 'Saúde',
        rota: '/admin/system',
        resumo: 'Filas, tempos de resposta e falhas',
      },
      {
        id: 'agendadas',
        rotulo: 'Tarefas agendadas',
        rota: '/admin/cron',
        resumo: 'Quando cada tarefa de manutenção roda',
      },
      {
        id: 'backup',
        rotulo: 'Backup',
        rota: '/admin/backup',
        resumo: 'O que entra no arquivo e quantos manter',
      },
      {
        id: 'banco',
        rotulo: 'Estúdio do banco',
        rota: '/admin/database',
        resumo: 'Leitura e escrita direta, com confirmação',
      },
      {
        id: 'orfaos',
        rotulo: 'Arquivos órfãos',
        rota: '/admin/orphan-files',
        resumo: 'Arquivos sem dono no armazenamento',
      },
      {
        id: 'auditoria',
        rotulo: 'Auditoria',
        rota: '/admin/logs',
        resumo: 'Quem fez o quê no painel, com antes e depois',
      },
    ],
  },
];

export function acharItem(id: string) {
  for (const grupo of NAVEGACAO) {
    const item = grupo.itens.find((i) => i.id === id);
    if (item) return { grupo, item };
  }
  return { grupo: NAVEGACAO[0], item: NAVEGACAO[0].itens[0] };
}

export const TOTAL_PENDENTES = NAVEGACAO.flatMap((g) => g.itens).reduce(
  (soma, i) => soma + (i.pendentes ?? 0),
  0
);

// ---------------------------------------------------------------------------
// Painel
// ---------------------------------------------------------------------------

export const NUMEROS = [
  {
    id: 'usuarios',
    rotulo: 'Usuários',
    valor: 4_812,
    variacao: '+38 na semana',
  },
  {
    id: 'ativos',
    rotulo: 'Ativos em 30 dias',
    valor: 1_207,
    variacao: '25% da base',
  },
  { id: 'obras', rotulo: 'Obras', valor: 207_890, variacao: '+112 na semana' },
  {
    id: 'compositores',
    rotulo: 'Compositores',
    valor: 19_177,
    variacao: '+9 na semana',
  },
  {
    id: 'partituras',
    rotulo: 'Partituras',
    valor: 92_178,
    variacao: '+41 na semana',
  },
  {
    id: 'anotacoes',
    rotulo: 'Anotações',
    valor: 23_406,
    variacao: '+640 na semana',
  },
];

/** O que pede uma decisão de alguém hoje, na ordem de urgência. */
export const ATENCAO = [
  {
    id: 'fila',
    titulo: '14 envios esperando moderação',
    n: 14,
    curto: 'envios esperando moderação',
    detalhe: 'O mais antigo está na fila há 2 dias',
    acao: 'Abrir a fila',
    urgente: true,
  },
  {
    id: 'comentarios',
    titulo: '6 comentários do blog para aprovar',
    n: 6,
    curto: 'comentários do blog para aprovar',
    detalhe: 'Todos em “Chopin e o rubato”',
    acao: 'Ver comentários',
    urgente: false,
  },
  {
    id: 'denuncias',
    titulo: '3 denúncias abertas',
    n: 3,
    curto: 'denúncias abertas',
    detalhe: '2 de partitura com direitos autorais, 1 de comentário',
    acao: 'Ver denúncias',
    urgente: false,
  },
  {
    id: 'saude',
    titulo: 'Fila de e-mail com 2 falhas',
    n: 2,
    curto: 'falhas na fila de e-mail',
    detalhe: 'SMTP recusou às 09:14 · reenvio automático em 20 min',
    acao: 'Ver falhas',
    urgente: true,
  },
];

export const SISTEMA = [
  {
    id: 'api',
    rotulo: 'API',
    estado: 'ok',
    valor: '142 ms',
    detalhe: 'resposta mediana, 1 h',
  },
  {
    id: 'backup',
    rotulo: 'Backup',
    estado: 'ok',
    valor: 'hoje, 03:00',
    detalhe: 'verificado · 14,4 MB',
  },
  {
    id: 'filas',
    rotulo: 'Filas',
    estado: 'atencao',
    valor: '2 falhas',
    detalhe: 'e-mail · 0 em manutenção',
  },
  {
    id: 'agendadas',
    rotulo: 'Próxima tarefa',
    estado: 'ok',
    valor: '18:00',
    detalhe: 'sitemap.rebuild',
  },
] as const;

/** Anotações por dia, últimos 14 dias (a mais recente por último). */
export const ANOTACOES_14_DIAS = [
  { dia: '16/09', valor: 71 },
  { dia: '17/09', valor: 88 },
  { dia: '18/09', valor: 64 },
  { dia: '19/09', valor: 95 },
  { dia: '20/09', valor: 52 },
  { dia: '21/09', valor: 40 },
  { dia: '22/09', valor: 83 },
  { dia: '23/09', valor: 102 },
  { dia: '24/09', valor: 97 },
  { dia: '25/09', valor: 118 },
  { dia: '26/09', valor: 91 },
  { dia: '27/09', valor: 60 },
  { dia: '28/09', valor: 49 },
  { dia: '29/09', valor: 124 },
];

export const CADASTROS_14_DIAS = [3, 5, 2, 6, 4, 1, 2, 7, 5, 9, 6, 3, 4, 8];

export const ATIVIDADE = [
  {
    id: 1,
    quem: 'Iago',
    oque: 'verificou',
    alvo: 'Frédéric Chopin',
    quando: 'há 12 min',
  },
  {
    id: 2,
    quem: 'Iago',
    oque: 'aprovou o envio',
    alvo: 'Nocturne op. 9 nº 2 (partitura)',
    quando: 'há 40 min',
  },
  {
    id: 3,
    quem: 'Marina',
    oque: 'publicou',
    alvo: '“Chopin e o rubato”',
    quando: 'há 2 h',
  },
  {
    id: 4,
    quem: 'Sistema',
    oque: 'concluiu',
    alvo: 'backup verificado (74 coleções)',
    quando: 'hoje, 03:05',
  },
  {
    id: 5,
    quem: 'Iago',
    oque: 'criou o cupom',
    alvo: 'PRIMAVERA20',
    quando: 'ontem',
  },
  {
    id: 6,
    quem: 'Iago',
    oque: 'convidou para professor',
    alvo: 'Ana Ribeiro (Mentor de presente)',
    quando: 'ontem',
  },
];

// ---------------------------------------------------------------------------
// Módulo de exemplo: Obras
// ---------------------------------------------------------------------------

export const OBRAS = [
  {
    id: 'o1',
    titulo: 'Nocturne em mi bemol maior',
    compositor: 'Frédéric Chopin',
    catalogo: 'Op. 9 nº 2',
    ano: 1832,
    partituras: 14,
    favoritos: 1_902,
    verificada: true,
    pendente: false,
  },
  {
    id: 'o2',
    titulo: 'Sonata ao luar',
    compositor: 'Ludwig van Beethoven',
    catalogo: 'Op. 27 nº 2',
    ano: 1801,
    partituras: 22,
    favoritos: 3_418,
    verificada: true,
    pendente: false,
  },
  {
    id: 'o3',
    titulo: 'Gymnopédie nº 1',
    compositor: 'Erik Satie',
    catalogo: '—',
    ano: 1888,
    partituras: 9,
    favoritos: 1_127,
    verificada: true,
    pendente: true,
  },
  {
    id: 'o4',
    titulo: 'Prelúdio em dó maior',
    compositor: 'Johann Sebastian Bach',
    catalogo: 'BWV 846',
    ano: 1722,
    partituras: 31,
    favoritos: 2_240,
    verificada: true,
    pendente: false,
  },
  {
    id: 'o5',
    titulo: 'Clair de lune',
    compositor: 'Claude Debussy',
    catalogo: 'L. 75/3',
    ano: 1905,
    partituras: 11,
    favoritos: 2_876,
    verificada: false,
    pendente: true,
  },
  {
    id: 'o6',
    titulo: 'Estudo em lá menor',
    compositor: 'Heitor Villa-Lobos',
    catalogo: 'W235',
    ano: 1929,
    partituras: 2,
    favoritos: 318,
    verificada: false,
    pendente: false,
  },
  {
    id: 'o7',
    titulo: 'Rêverie',
    compositor: 'Claude Debussy',
    catalogo: 'L. 68',
    ano: 1890,
    partituras: 4,
    favoritos: 604,
    verificada: false,
    pendente: false,
  },
  {
    id: 'o8',
    titulo: 'Kinderszenen: Träumerei',
    compositor: 'Robert Schumann',
    catalogo: 'Op. 15 nº 7',
    ano: 1838,
    partituras: 6,
    favoritos: 981,
    verificada: true,
    pendente: false,
  },
];

export const FILTROS_OBRAS = [
  { id: 'todas', rotulo: 'Todas', total: 207_890 },
  { id: 'nao-verificadas', rotulo: 'Não verificadas', total: 188_412 },
  { id: 'sem-partitura', rotulo: 'Sem partitura', total: 131_050 },
  { id: 'com-envio', rotulo: 'Com envio pendente', total: 9 },
];

export const formatar = (n: number) => n.toLocaleString('pt-BR');
