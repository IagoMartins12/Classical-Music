import { CONTATO } from '@/app/utils/contato';
import type { Idioma } from './legal/tipos';

/**
 * O texto da página de planos (`/pricing`).
 *
 * **O que está e o que vem.** O que ainda não existe fica em `emBreve` (no
 * card, uma linha só) e em `'breve'` na tabela, marcado "Em breve" nos dois — anunciar como
 * incluído o que quem assina não recebe é propaganda enganosa (CDC, art. 37).
 * Quando um recurso ficar pronto, passe-o de `emBreve` para `recursos` (e
 * troque o `'breve'` da linha da tabela por `true`).
 *
 * **Card curto.** O card diz o essencial de cada plano; a lista inteira mora
 * na tabela "lado a lado", para onde o link do pé dos cards leva. Em 21/10/2026
 * o suporte prioritário (do Plus em diante) e o Plus dos alunos do Maestro
 * passaram a incluídos, e com eles a retrospectiva, as recomendações
 * de peças e o relatório pedagógico do Maestro; os avisos por WhatsApp e e-mail seguem "em breve".
 *
 * **Os números moram em `LIMITES`.** A API aplica os mesmos em
 * `billing/constants/plan-features.constants.ts` (`uploadLimit`,
 * `maxPerformanceVideos`, `maxStudents`): mude os dois juntos, ou a página
 * anuncia um limite e o sistema aplica outro.
 *
 * **Nenhum preço aqui.** Valor, desconto anual e economia vêm de
 * `GET /pricing` (a tabela do painel). Atenção: em 28/09/2026 o Stripe cobra
 * pelo *price ID* configurado na API, não por essa tabela, e o cupom não
 * chega ao Stripe — por isso esta página não fala de cupom.
 *
 * **Teste grátis: 7 dias em todos os planos pagos** (`TRIAL_PERIOD_DAYS`, na
 * API; decisão do dono, 20/10/2026), com cartão e só na primeira assinatura
 * (quem já teve plano pago não ganha de novo). O número anunciado é o de
 * `trialDays` da tabela de preços, nunca um valor escrito aqui.
 */
export const LIMITES = {
  FREE: {
    /** Compositores, obras e partituras somados. */
    acervo: 20,
    /** Vídeos de performance. */
    performances: 4,
  },
  MENTOR: {
    alunos: 7,
  },
} as const;

export type ChavePlano = 'FREE' | 'PLUS' | 'MENTOR' | 'MAESTRO';

/** Célula da tabela: incluído, não incluído, texto, ou "em breve". */
export type Valor = boolean | string | { breve: true };

const BREVE = { breve: true } as const;

export type ConteudoPlanos = {
  meta: {
    titulo: string;
    /** `precos` chega pronto ("R$ 29"), ou `null` se a API não respondeu. */
    descricao: (
      precos: Record<'PLUS' | 'MENTOR' | 'MAESTRO', string> | null
    ) => string;
  };
  migalha: string;
  titulo: string;
  abertura: string;
  /**
   * What the paid plans unlock, as gold icons and one short line under the
   * hero's lead, with the entry price (Plus, monthly) from the price table;
   * without the table, the line goes without it.
   */
  pagos: {
    rotulo: string;
    itens: Record<'videos' | 'envios' | 'portal' | 'relatorios', string>;
    chamada: (aPartirDe: string | null) => string;
  };
  /** The hero's two actions, like the other editorial pages. */
  acoesTopo: { planos: string; criarConta: string; seuPlano: string };
  periodo: {
    rotulo: string;
    mensal: string;
    anual: string;
    ate: (pct: number) => string;
  };
  grupos: {
    estudar: { titulo: string; texto: string };
    ensinar: { titulo: string; texto: string };
  };
  carrossel: { rotulo: string; plano: (nome: string) => string };
  /** O teste grátis, como o card o anuncia (os dias vêm da tabela de preços). */
  teste: { selo: (dias: number) => string; detalhe: string };
  /** O link do pé dos cards para a tabela completa. */
  comparar: string;
  emBreve: string;
  planos: Record<
    ChavePlano,
    {
      nome: string;
      paraQuem: string;
      inclui: string | null;
      /** O que o plano entrega hoje — curto: o card mostra só isto. */
      recursos: string[];
      /** O que vem ("Em breve"), em nomes curtos, numa linha só no card. */
      emBreve: string[];
      acao: string;
    }
  >;
  preco: {
    gratis: string;
    porMes: string;
    porAno: (total: string) => string;
    economia: (valor: string) => string;
    anualDisponivel: (porMes: string) => string;
    soMensal: string;
    indisponivel: string;
  };
  estado: {
    seuPlano: string;
    planoAtual: string;
    gerenciar: string;
    voltarAoFree: string;
  };
  comparacao: {
    titulo: string;
    recurso: string;
    sim: string;
    nao: string;
    linhas: { recurso: string; valores: [Valor, Valor, Valor, Valor] }[];
  };
  perguntas: {
    titulo: string;
    itens: (anual: number | null) => { pergunta: string; resposta: string }[];
  };
  fecho: { titulo: string; texto: string };
  confirmar: {
    titulo: (plano: string) => string;
    periodo: string;
    total: string;
    cupom: string;
    cupomAjuda: string;
    aplicar: string;
    original: string;
    desconto: string;
    pagar: string;
    cancelar: string;
    nota: string;
    /** O que o teste grátis significa na hora de assinar. */
    teste: (dias: number) => string;
    /** O rótulo do total quando há teste: ele só é cobrado no fim. */
    totalDepois: string;
    entrar: string;
    erroCupom: string;
    erroPagamento: string;
  };
};

const L = LIMITES;

export const PLANOS: Record<Idioma, ConteudoPlanos> = {
  pt: {
    meta: {
      titulo: 'Planos e preços | Opus Atlas — grátis, Plus, Mentor e Maestro',
      descricao: (p) =>
        p
          ? `A enciclopédia de música clássica e as partituras são grátis. Plus por ${p.PLUS}/mês com envios ilimitados; para professores, Mentor (${p.MENTOR}/mês, até ${L.MENTOR.alunos} alunos) e Maestro (${p.MAESTRO}/mês, alunos ilimitados), com portal de aulas, tarefas e relatórios.`
          : 'A enciclopédia de música clássica e as partituras são grátis. Plus para quem contribui sem limite; Mentor e Maestro para professores, com portal de aulas, tarefas e relatórios.',
    },
    migalha: 'Planos',
    titulo:
      'Já pensou em ter o universo da música clássica na palma das suas mãos?',
    abertura:
      'Grave quantos vídeos de performance quiser e envie ao acervo sem limite. Se você dá aula, leve a turma para o portal, com agenda, tarefas com prazo e o progresso de cada aluno.',
    pagos: {
      rotulo: 'O que os planos destravam',
      itens: {
        videos: 'Vídeos de performance sem limite',
        envios: 'Envios ao acervo sem limite',
        portal: 'Portal do professor',
        relatorios: 'Relatórios de progresso',
      },
      chamada: (p) =>
        p
          ? `Diversas funcionalidades para o seu estudo, a partir de **${p}/mês**`
          : 'Diversas funcionalidades para o seu estudo',
    },
    periodo: {
      rotulo: 'Cobrança',
      mensal: 'Mensal',
      anual: 'Anual',
      ate: (pct) => `até ${pct}% menos`,
    },
    grupos: {
      estudar: {
        titulo: 'Para estudar',
        texto: 'Para quem lê, toca e contribui com o acervo.',
      },
      ensinar: {
        titulo: 'Para ensinar',
        texto:
          'Assinou, a conta vira professor na hora — sem análise. Seus alunos não pagam nada.',
      },
    },
    carrossel: {
      rotulo: 'Planos',
      plano: (n) => `Ver o plano ${n}`,
    },
    emBreve: 'Em breve',
    teste: {
      selo: (dias) => (dias === 1 ? '1 dia grátis' : `${dias} dias grátis`),
      detalhe: 'Na primeira assinatura. Cancele antes do fim e nada é cobrado.',
    },
    comparar: 'Comparar todos os recursos',
    acoesTopo: {
      planos: 'Ver os planos',
      criarConta: 'Criar conta grátis',
      seuPlano: 'Ver minha assinatura',
    },
    planos: {
      FREE: {
        nome: 'Free',
        paraQuem: 'Para ler, ouvir e começar a organizar o estudo.',
        inclui: null,
        recursos: [
          'Enciclopédia, partituras e blog',
          'Favoritos, listas de estudo e anotações',
          'Ser aluno de um professor',
          `Até ${L.FREE.acervo} envios e ${L.FREE.performances} vídeos de performance`,
        ],
        emBreve: [],
        acao: 'Criar conta grátis',
      },
      PLUS: {
        nome: 'Plus',
        paraQuem: 'Para quem contribui com o acervo e grava o próprio estudo.',
        inclui: 'Tudo do Free, e:',
        recursos: [
          'Envios ilimitados ao acervo',
          'Vídeos de performance ilimitados',
          'Sua retrospectiva de estudo',
          'Recomendações de peças para estudar',
          'Suporte prioritário',
        ],
        emBreve: [],
        acao: 'Assinar o Plus',
      },
      MENTOR: {
        nome: 'Mentor',
        paraQuem: 'Para o professor que está organizando a turma.',
        inclui: 'Tudo do Plus, e:',
        recursos: [
          'Portal do professor: aulas, tarefas e agenda',
          'Relatórios de progresso para o aluno',
          'Avisos antes da aula e do prazo',
          `Até ${L.MENTOR.alunos} alunos ativos`,
        ],
        emBreve: [],
        acao: 'Assinar o Mentor',
      },
      MAESTRO: {
        nome: 'Maestro',
        paraQuem: 'Para quem dá aula a muitos alunos.',
        inclui: 'Tudo do Mentor, e:',
        recursos: [
          'Alunos ativos ilimitados',
          'Envio de vídeos nas tarefas',
          'Seus alunos ganham o Plus',
          'Relatório pedagógico com evolução por habilidade',
        ],
        emBreve: ['avisos por WhatsApp e e-mail'],
        acao: 'Assinar o Maestro',
      },
    },
    preco: {
      gratis: 'Grátis',
      porMes: '/mês',
      porAno: (t) => `${t} por ano, cobrados de uma vez`,
      economia: (v) => `economia de ${v}`,
      anualDisponivel: (m) => `ou ${m}/mês no plano anual`,
      soMensal: 'Só no plano mensal',
      indisponivel: 'Indisponível no momento',
    },
    estado: {
      seuPlano: 'Seu plano',
      planoAtual: 'Seu plano atual',
      gerenciar: 'Gerenciar assinatura',
      voltarAoFree:
        'Para voltar ao Free, cancele a assinatura em Meu perfil → Configurações da Conta.',
    },
    comparacao: {
      titulo: 'Os planos lado a lado',
      recurso: 'Recurso',
      sim: 'Incluído',
      nao: 'Não incluído',
      linhas: [
        {
          recurso: 'Enciclopédia, partituras e blog',
          valores: [true, true, true, true],
        },
        {
          recurso: 'Favoritos, "Quero aprender" e "Já aprendi"',
          valores: [true, true, true, true],
        },
        { recurso: 'Anotações nas obras', valores: [true, true, true, true] },
        { recurso: 'Medalhas e XP', valores: [true, true, true, true] },
        {
          recurso: 'Ser aluno de um professor',
          valores: [true, true, true, true],
        },
        {
          recurso: 'Envios ao acervo',
          valores: [
            `Até ${L.FREE.acervo}`,
            'Ilimitado',
            'Ilimitado',
            'Ilimitado',
          ],
        },
        {
          recurso: 'Vídeos de performance',
          valores: [
            `Até ${L.FREE.performances}`,
            'Ilimitado',
            'Ilimitado',
            'Ilimitado',
          ],
        },
        {
          recurso: 'Histórico visual (sua retrospectiva)',
          valores: [false, true, true, true],
        },
        {
          recurso: 'Recomendações de peças',
          valores: [false, true, true, true],
        },
        {
          recurso: 'Portal do professor: aulas, tarefas, calendário e agenda',
          valores: [false, false, true, true],
        },
        {
          recurso: 'Relatórios de progresso para o aluno',
          valores: [false, false, true, true],
        },
        {
          recurso: 'Alunos ativos',
          valores: [false, false, `Até ${L.MENTOR.alunos}`, 'Ilimitado'],
        },
        {
          recurso: 'Envio de vídeos nas tarefas',
          valores: [false, false, false, true],
        },
        {
          recurso: 'Seus alunos ganham o Plus',
          valores: [false, false, false, true],
        },
        {
          recurso: 'Relatórios pedagógicos avançados',
          valores: [false, false, false, true],
        },
        {
          recurso: 'Avisos por WhatsApp e e-mail',
          valores: [false, false, false, BREVE],
        },
        {
          recurso: 'Suporte prioritário',
          valores: [false, true, true, true],
        },
      ],
    },
    perguntas: {
      titulo: 'Perguntas sobre planos e cobrança',
      itens: (anual) => [
        {
          pergunta: 'A enciclopédia e as partituras são mesmo grátis?',
          resposta:
            'Sim. Ler sobre compositores e obras, ouvir as gravações e baixar partituras não pede conta nem pagamento. A conta grátis acrescenta favoritos, listas de estudo, anotações e medalhas.',
        },
        {
          pergunta: 'O que quer dizer "Em breve"?',
          resposta:
            'São recursos que estamos construindo e que **ainda não estão disponíveis**. Eles não fazem parte do que você recebe hoje ao assinar; quando ficarem prontos, passam a valer no plano indicado.',
        },
        {
          pergunta: 'O que conta como envio ao acervo?',
          resposta: `Cada compositor, obra ou partitura que você cadastra. No Free são até ${L.FREE.acervo} no total, somando os três; apagar um envio libera a vaga. Nos planos pagos, é ilimitado.`,
        },
        {
          pergunta: 'Como eu pago?',
          resposta:
            'Com cartão de crédito, pelo Stripe, em reais. Você digita os dados do cartão na página do Stripe; o Opus Atlas não recebe o número do cartão.',
        },
        {
          pergunta: 'Como funciona o plano anual?',
          resposta: anual
            ? `Você paga os doze meses de uma vez, até ${anual}% menos do que doze mensalidades. O valor exato de cada plano aparece acima, com o período "Anual" escolhido.`
            : 'Você paga os doze meses de uma vez, por menos do que doze mensalidades. O valor exato de cada plano aparece acima, com o período "Anual" escolhido.',
        },
        {
          pergunta: 'Posso cancelar quando quiser?',
          resposta:
            'Sim, sem multa, em **Meu perfil → Configurações da Conta**. O plano continua até o fim do período já pago; depois a conta volta ao Free, com favoritos, listas, anotações e histórico guardados.',
        },
        {
          pergunta: 'E se eu me arrepender da assinatura?',
          resposta: `Em até 7 dias da assinatura você pode desistir e receber de volta o valor integral, pelo direito de arrependimento do Código de Defesa do Consumidor. Escreva para ${CONTATO.suporte}. Os detalhes estão nos [Termos de Uso](/terms#planos-cancelamento).`,
        },
        {
          pergunta: 'Como eu viro professor no Opus Atlas?',
          resposta:
            'Assinando o Mentor ou o Maestro. A conta vira professor na hora, sem análise: o portal abre e você já pode convidar alunos pelo e-mail deles.',
        },
        {
          pergunta: 'Meus alunos precisam pagar?',
          resposta:
            'Não. O aluno aceita o seu convite com uma conta grátis e acompanha as aulas, as tarefas e os relatórios que você compartilha.',
        },
        {
          pergunta: 'E se eu passar para um plano com menos alunos?',
          resposta:
            'Nada se perde: alunos, aulas e histórico continuam. O limite só impede convidar alunos novos além do que o plano permite.',
        },
        {
          pergunta: 'Há plano para escolas e conservatórios?',
          resposta: `Ainda não há um plano pronto para instituições. Escreva para ${CONTATO.contato} contando o tamanho da escola, e conversamos.`,
        },
      ],
    },
    fecho: {
      titulo: 'Ainda com dúvida?',
      texto: `Escreva para ${CONTATO.suporte}, ou veja a [central de ajuda](/help).`,
    },
    confirmar: {
      titulo: (p) => `Assinar o ${p}`,
      periodo: 'Cobrança',
      total: 'Total',
      cupom: 'Cupom de desconto',
      cupomAjuda: 'Opcional.',
      aplicar: 'Aplicar',
      original: 'Preço',
      desconto: 'Desconto',
      pagar: 'Ir para o pagamento',
      cancelar: 'Cancelar',
      nota: 'O pagamento é feito no Stripe, com cartão de crédito. O Opus Atlas não recebe o número do cartão.',
      teste: (dias) =>
        `Teste grátis de ${dias} dias, na sua primeira assinatura. O cartão é pedido agora e a primeira cobrança só acontece quando o teste acaba: cancele antes e nada é cobrado.`,
      totalDepois: 'Cobrado depois do teste',
      entrar: 'Entre na sua conta para assinar.',
      erroCupom: 'Não foi possível conferir o cupom.',
      erroPagamento: 'Não foi possível abrir o pagamento. Tente de novo.',
    },
  },
  en: {
    meta: {
      titulo: 'Plans and pricing | Opus Atlas — free, Plus, Mentor and Maestro',
      descricao: (p) =>
        p
          ? `The classical music encyclopedia and the sheet music are free. Plus for ${p.PLUS}/month with unlimited uploads; for teachers, Mentor (${p.MENTOR}/month, up to ${L.MENTOR.alunos} students) and Maestro (${p.MAESTRO}/month, unlimited students), with a portal for lessons, assignments and reports.`
          : 'The classical music encyclopedia and the sheet music are free. Plus for unlimited contributions; Mentor and Maestro for teachers, with a portal for lessons, assignments and reports.',
    },
    migalha: 'Plans',
    titulo:
      'Ever imagined holding the whole world of classical music in your hands?',
    abertura:
      'Record as many performance videos as you like and add to the library without limits. If you teach, bring your class to the portal, with a schedule, assignments with deadlines and each student’s progress.',
    pagos: {
      rotulo: 'What the plans unlock',
      itens: {
        videos: 'Unlimited performance videos',
        envios: 'Unlimited uploads to the archive',
        portal: 'Teacher portal',
        relatorios: 'Progress reports',
      },
      chamada: (p) =>
        p
          ? `Many more features for your practice, from **${p}/month**`
          : 'Many more features for your practice',
    },
    periodo: {
      rotulo: 'Billing',
      mensal: 'Monthly',
      anual: 'Yearly',
      ate: (pct) => `up to ${pct}% off`,
    },
    grupos: {
      estudar: {
        titulo: 'To study',
        texto: 'For those who read, play and contribute to the collection.',
      },
      ensinar: {
        titulo: 'To teach',
        texto:
          'Subscribe and your account becomes a teacher account right away — no review. Your students pay nothing.',
      },
    },
    carrossel: {
      rotulo: 'Plans',
      plano: (n) => `See the ${n} plan`,
    },
    emBreve: 'Coming soon',
    teste: {
      selo: (dias) =>
        dias === 1 ? '1-day free trial' : `${dias}-day free trial`,
      detalhe:
        'On your first subscription. Cancel before it ends and you pay nothing.',
    },
    comparar: 'Compare all features',
    acoesTopo: {
      planos: 'See the plans',
      criarConta: 'Create a free account',
      seuPlano: 'See my subscription',
    },
    planos: {
      FREE: {
        nome: 'Free',
        paraQuem: 'To read, listen and start organizing your practice.',
        inclui: null,
        recursos: [
          'Encyclopedia, sheet music and blog',
          'Favorites, study lists and notes',
          'Be a teacher’s student',
          `Up to ${L.FREE.acervo} uploads and ${L.FREE.performances} performance videos`,
        ],
        emBreve: [],
        acao: 'Create a free account',
      },
      PLUS: {
        nome: 'Plus',
        paraQuem:
          'For those who contribute to the collection and record their own practice.',
        inclui: 'Everything in Free, plus:',
        recursos: [
          'Unlimited uploads to the collection',
          'Unlimited performance videos',
          'Your study year in review',
          'Piece recommendations to study next',
          'Priority support',
        ],
        emBreve: [],
        acao: 'Subscribe to Plus',
      },
      MENTOR: {
        nome: 'Mentor',
        paraQuem: 'For the teacher getting a class organized.',
        inclui: 'Everything in Plus, plus:',
        recursos: [
          'Teacher portal: lessons, assignments and schedule',
          'Progress reports for the student',
          'Reminders before lessons and deadlines',
          `Up to ${L.MENTOR.alunos} active students`,
        ],
        emBreve: [],
        acao: 'Subscribe to Mentor',
      },
      MAESTRO: {
        nome: 'Maestro',
        paraQuem: 'For those who teach many students.',
        inclui: 'Everything in Mentor, plus:',
        recursos: [
          'Unlimited active students',
          'Video submissions in assignments',
          'Your students get Plus',
          'Teaching reports with skill progress',
        ],
        emBreve: ['WhatsApp and e-mail reminders'],
        acao: 'Subscribe to Maestro',
      },
    },
    preco: {
      gratis: 'Free',
      porMes: '/month',
      porAno: (t) => `${t} a year, billed at once`,
      economia: (v) => `you save ${v}`,
      anualDisponivel: (m) => `or ${m}/month on the yearly plan`,
      soMensal: 'Monthly billing only',
      indisponivel: 'Currently unavailable',
    },
    estado: {
      seuPlano: 'Your plan',
      planoAtual: 'Your current plan',
      gerenciar: 'Manage subscription',
      voltarAoFree:
        'To go back to Free, cancel your subscription in My profile → Account Settings.',
    },
    comparacao: {
      titulo: 'The plans side by side',
      recurso: 'Feature',
      sim: 'Included',
      nao: 'Not included',
      linhas: [
        {
          recurso: 'Encyclopedia, sheet music and blog',
          valores: [true, true, true, true],
        },
        {
          recurso: 'Favorites, "Want to learn" and "Already learned"',
          valores: [true, true, true, true],
        },
        { recurso: 'Notes on works', valores: [true, true, true, true] },
        { recurso: 'Medals and XP', valores: [true, true, true, true] },
        {
          recurso: 'Be a teacher’s student',
          valores: [true, true, true, true],
        },
        {
          recurso: 'Uploads to the collection',
          valores: [
            `Up to ${L.FREE.acervo}`,
            'Unlimited',
            'Unlimited',
            'Unlimited',
          ],
        },
        {
          recurso: 'Performance videos',
          valores: [
            `Up to ${L.FREE.performances}`,
            'Unlimited',
            'Unlimited',
            'Unlimited',
          ],
        },
        {
          recurso: 'Visual history (your year in review)',
          valores: [false, true, true, true],
        },
        {
          recurso: 'Piece recommendations',
          valores: [false, true, true, true],
        },
        {
          recurso:
            'Teacher portal: lessons, assignments, calendar and schedule',
          valores: [false, false, true, true],
        },
        {
          recurso: 'Progress reports for the student',
          valores: [false, false, true, true],
        },
        {
          recurso: 'Active students',
          valores: [false, false, `Up to ${L.MENTOR.alunos}`, 'Unlimited'],
        },
        {
          recurso: 'Video submissions in assignments',
          valores: [false, false, false, true],
        },
        {
          recurso: 'Your students get Plus',
          valores: [false, false, false, true],
        },
        {
          recurso: 'Advanced teaching reports',
          valores: [false, false, false, true],
        },
        {
          recurso: 'WhatsApp and e-mail reminders',
          valores: [false, false, false, BREVE],
        },
        {
          recurso: 'Priority support',
          valores: [false, true, true, true],
        },
      ],
    },
    perguntas: {
      titulo: 'Questions about plans and billing',
      itens: (anual) => [
        {
          pergunta: 'Are the encyclopedia and the sheet music really free?',
          resposta:
            'Yes. Reading about composers and works, listening to recordings and downloading sheet music needs no account and no payment. A free account adds favorites, study lists, notes and medals.',
        },
        {
          pergunta: 'What does "Coming soon" mean?',
          resposta:
            'These are features we are building that are **not available yet**. They are not part of what you get today when you subscribe; once ready, they apply to the plan shown.',
        },
        {
          pergunta: 'What counts as an upload to the collection?',
          resposta: `Each composer, work or score you add. On Free you get up to ${L.FREE.acervo} in total, all three combined; deleting an upload frees the slot. Paid plans are unlimited.`,
        },
        {
          pergunta: 'How do I pay?',
          resposta:
            'By credit card, through Stripe, in Brazilian reais (BRL). You enter your card details on Stripe’s page; Opus Atlas never receives the card number.',
        },
        {
          pergunta: 'How does the yearly plan work?',
          resposta: anual
            ? `You pay for twelve months at once, up to ${anual}% less than twelve monthly payments. The exact amount for each plan is shown above with "Yearly" selected.`
            : 'You pay for twelve months at once, for less than twelve monthly payments. The exact amount for each plan is shown above with "Yearly" selected.',
        },
        {
          pergunta: 'Can I cancel anytime?',
          resposta:
            'Yes, with no fee, in **My profile → Account Settings**. The plan stays active until the end of the period already paid; then the account goes back to Free, keeping favorites, lists, notes and history.',
        },
        {
          pergunta: 'What if I change my mind?',
          resposta: `Within 7 days of subscribing you can withdraw and get a full refund, under the right of withdrawal in the Brazilian Consumer Protection Code. Write to ${CONTATO.suporte}. Details are in the [Terms of Use](/terms#planos-cancelamento).`,
        },
        {
          pergunta: 'How do I become a teacher on Opus Atlas?',
          resposta:
            'By subscribing to Mentor or Maestro. Your account becomes a teacher account right away, with no review: the portal opens and you can invite students by e-mail.',
        },
        {
          pergunta: 'Do my students need to pay?',
          resposta:
            'No. A student accepts your invitation with a free account and follows the lessons, assignments and reports you share.',
        },
        {
          pergunta: 'What if I move to a plan with fewer students?',
          resposta:
            'Nothing is lost: students, lessons and history stay. The limit only prevents inviting new students beyond what the plan allows.',
        },
        {
          pergunta: 'Is there a plan for schools and conservatories?',
          resposta: `There is no ready-made plan for institutions yet. Write to ${CONTATO.contato} with the size of your school and we will talk.`,
        },
      ],
    },
    fecho: {
      titulo: 'Still have questions?',
      texto: `Write to ${CONTATO.suporte}, or visit the [help center](/help).`,
    },
    confirmar: {
      titulo: (p) => `Subscribe to ${p}`,
      periodo: 'Billing',
      total: 'Total',
      cupom: 'Discount coupon',
      cupomAjuda: 'Optional.',
      aplicar: 'Apply',
      original: 'Price',
      desconto: 'Discount',
      pagar: 'Go to payment',
      cancelar: 'Cancel',
      nota: 'Payment is made on Stripe, by credit card. Opus Atlas never receives the card number.',
      teste: (dias) =>
        `Free ${dias}-day trial, on your first subscription. We ask for the card now and the first charge only happens when the trial ends: cancel before and you are not charged.`,
      totalDepois: 'Charged after the trial',
      entrar: 'Sign in to subscribe.',
      erroCupom: 'We could not check the coupon.',
      erroPagamento: 'We could not open the payment page. Please try again.',
    },
  },
};
