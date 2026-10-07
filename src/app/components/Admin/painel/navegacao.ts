import type { ComponentType, SVGProps } from 'react';
import {
  PiArticle,
  PiChartLine,
  PiCurrencyDollar,
  PiEnvelopeSimple,
  PiGear,
  PiGraduationCap,
  PiMusicNotes,
  PiShield,
  PiSquaresFour,
  PiUsers,
} from 'react-icons/pi';

/**
 * O mapa do painel: uma fonte só para a lateral, o "Ir para" (⌘K) e a trilha
 * "onde estou" do topo.
 *
 * **Enxugado em 29/09/2026.** O menu antigo tinha 33 entradas em 10 seções,
 * com três telas para as mesmas denúncias (`/admin/moderation`,
 * `/admin/moderation/moderate`, `/admin/report`), duas para os números da
 * newsletter, duas para crescimento de usuários, filtros da lista de
 * usuários fingindo de página e um link para uma tela que não existia
 * (`/admin/plans/subscribers`). Os endereços antigos continuam válidos —
 * redirecionam para o lugar novo.
 *
 * `pendencia` liga o item a um número do `/admin/metrics/attention`: o menu
 * mostra quanta coisa espera ali.
 */

type Glifo = ComponentType<SVGProps<SVGSVGElement>>;

export type Pendencia = 'denuncias' | 'comentarios' | 'artigos';

export interface ItemNav {
  rotulo: string;
  href: string;
  /** Outros começos de endereço que também acendem este item. */
  tambem?: string[];
  /** O que mora ali, numa linha — aparece no ⌘K. */
  resumo: string;
  pendencia?: Pendencia;
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
    rotulo: 'Painel',
    icone: PiSquaresFour,
    itens: [
      {
        rotulo: 'Painel',
        href: '/admin',
        resumo: 'O que pede atenção hoje e a semana em números',
      },
    ],
  },
  {
    id: 'pessoas',
    rotulo: 'Pessoas',
    icone: PiUsers,
    itens: [
      {
        rotulo: 'Usuários',
        href: '/admin/users',
        resumo: 'Contas, papéis, professores e exportação',
      },
    ],
  },
  {
    id: 'estudo',
    rotulo: 'Portal de estudo',
    icone: PiGraduationCap,
    itens: [
      {
        rotulo: 'Visão geral',
        href: '/admin/study',
        resumo: 'Aulas, tarefas, presença e o que está atrasado',
      },
      {
        rotulo: 'Aulas',
        href: '/admin/study/lessons',
        resumo: 'Próximas, passadas e sem desfecho',
      },
      {
        rotulo: 'Tarefas',
        href: '/admin/study/assignments',
        resumo: 'Em vigor, atrasadas e entregues',
      },
      {
        rotulo: 'Professores',
        href: '/admin/study/teachers',
        resumo: 'Quem dá aula, com alunos e agenda',
      },
      {
        rotulo: 'Alunos',
        href: '/admin/study/students',
        resumo: 'Quem estuda, com professores e tarefas',
      },
    ],
  },
  {
    id: 'catalogo',
    rotulo: 'Catálogo',
    icone: PiMusicNotes,
    itens: [
      {
        rotulo: 'Compositores',
        href: '/admin/composers',
        resumo: 'Verificação, qualidade e remoção sem obras',
      },
      {
        rotulo: 'Obras',
        href: '/admin/works',
        resumo: 'Edição, verificação e remoção',
      },
      {
        rotulo: 'Partituras',
        href: '/admin/scores',
        resumo: 'Fonte, tipo e acessos',
      },
      {
        rotulo: 'Envios',
        href: '/admin/uploads',
        resumo: 'O que a comunidade cadastrou e quem mais contribui',
      },
    ],
  },
  {
    id: 'moderacao',
    rotulo: 'Moderação',
    icone: PiShield,
    itens: [
      {
        rotulo: 'Denúncias',
        href: '/admin/moderation',
        tambem: ['/admin/report'],
        resumo: 'Conteúdo denunciado, pelo prazo de cada prioridade',
        pendencia: 'denuncias',
      },
      {
        rotulo: 'Comentários do blog',
        href: '/blog/admin/moderation',
        resumo: 'Aprovar, recusar e comentários sinalizados',
        pendencia: 'comentarios',
      },
    ],
  },
  {
    id: 'blog',
    rotulo: 'Blog',
    icone: PiArticle,
    itens: [
      {
        rotulo: 'Artigos',
        href: '/blog/admin/articles',
        resumo: 'Escrever, revisar e publicar',
        pendencia: 'artigos',
      },
      {
        rotulo: 'Categorias e tags',
        href: '/blog/admin/categories',
        tambem: ['/blog/admin/tags', '/blog/admin/home'],
        resumo: 'Como os artigos se organizam',
      },
      {
        rotulo: 'Mídia',
        href: '/admin/blog/media',
        resumo: 'Imagens do blog: usadas, soltas e temporárias',
      },
      {
        rotulo: 'Eventos importados',
        href: '/admin/scrapers',
        resumo: 'Os scrapers da agenda de concertos',
      },
    ],
  },
  {
    id: 'newsletter',
    rotulo: 'Newsletter',
    icone: PiEnvelopeSimple,
    itens: [
      {
        rotulo: 'Visão geral',
        href: '/admin/newsletter',
        tambem: ['/admin/newsletter/analytics'],
        resumo: 'Assinantes, entrega, abertura e clique',
      },
      {
        rotulo: 'Campanhas',
        href: '/admin/newsletter/campaigns',
        resumo: 'Criar, agendar, testar e enviar',
      },
      {
        rotulo: 'Assinantes',
        href: '/admin/newsletter/subscribers',
        resumo: 'Lista, edição e exportação',
      },
      {
        rotulo: 'Modelos',
        href: '/admin/newsletter/templates',
        resumo: 'Templates de e-mail e diagnóstico',
      },
      {
        rotulo: 'Listas de teste',
        href: '/admin/newsletter/test-lists',
        resumo: 'Quem recebe a prévia antes do envio',
      },
    ],
  },
  {
    id: 'receita',
    rotulo: 'Receita',
    icone: PiCurrencyDollar,
    itens: [
      {
        rotulo: 'Assinaturas',
        href: '/admin/plans/subscribers',
        resumo: 'Receita, assinantes por plano e quem não renovou',
      },
      {
        rotulo: 'Planos e preços',
        href: '/admin/plans/pricing',
        resumo: 'Preço vigente de cada plano e histórico',
      },
      {
        rotulo: 'Cupons',
        href: '/admin/plans/coupons',
        resumo: 'Criar, ativar e desativar',
      },
      {
        rotulo: 'Anúncios',
        href: '/admin/ads',
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
        rotulo: 'Insights',
        href: '/admin/insights',
        resumo: 'O que os dados mostram e o que fazer, com amostra declarada',
      },
      {
        rotulo: 'Uso da plataforma',
        href: '/admin/analytics',
        resumo: 'Crescimento, retenção, catálogo e biblioteca',
      },
      {
        rotulo: 'Relatórios',
        href: '/admin/reports-metric',
        resumo: 'Usuários, conteúdo e engajamento em CSV',
      },
    ],
  },
  {
    id: 'sistema',
    rotulo: 'Sistema',
    icone: PiGear,
    itens: [
      {
        rotulo: 'Saúde',
        href: '/admin/system',
        resumo: 'Banco, cache, filas e tempos de resposta',
      },
      {
        rotulo: 'Auditoria',
        href: '/admin/logs',
        resumo: 'Quem fez o quê no painel, quando, e o que mudou',
      },
      {
        rotulo: 'Tarefas agendadas',
        href: '/admin/cron',
        resumo: 'Quando cada tarefa de manutenção roda',
      },
      {
        rotulo: 'Backup',
        href: '/admin/backup',
        resumo: 'O que entra no arquivo, quantos manter e o histórico',
      },
      {
        rotulo: 'Database Studio',
        href: '/admin/database',
        resumo: 'Leitura e escrita direta, com confirmação',
      },
      {
        rotulo: 'Arquivos órfãos',
        href: '/admin/orphan-files',
        resumo: 'Arquivos sem dono no armazenamento',
      },
    ],
  },
];

/** O item que responde por um endereço: o de começo mais longo. */
export function acharAtual(pathname: string) {
  let melhor: { grupo: GrupoNav; item: ItemNav; tamanho: number } | null = null;

  for (const grupo of NAVEGACAO) {
    for (const item of grupo.itens) {
      for (const prefixo of [item.href, ...(item.tambem ?? [])]) {
        const casa =
          prefixo === '/admin'
            ? pathname === '/admin'
            : pathname === prefixo || pathname.startsWith(`${prefixo}/`);
        if (casa && (!melhor || prefixo.length > melhor.tamanho)) {
          melhor = { grupo, item, tamanho: prefixo.length };
        }
      }
    }
  }

  return melhor;
}
