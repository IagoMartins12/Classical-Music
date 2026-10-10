import { CONTATO } from '@/app/utils/contato';
import type { Idioma } from './legal/tipos';

/**
 * O texto da página "Sobre" (`/about-us`).
 *
 * **Só o que o sistema faz hoje.** Cada frase aqui foi conferida contra a API
 * em 28/09/2026 — e o que ainda não existe não entra, nem como promessa. A
 * versão anterior falava em "conservatório virtual" e em recursos que nenhum
 * plano entrega. Se um recurso mudar, mude o texto junto (ver
 * `cerebro-negocio/Produto/Promessas e realidade`).
 *
 * Os números do acervo não moram aqui: a página os busca na API e os passa
 * para `abertura` **arredondados para baixo** ("10k+", "200k+"), e sem eles a
 * frase continua de pé.
 */
export type Numeros = { compositores: number; obras: number } | null;

type Camada = {
  id: string;
  nome: string;
  acesso: string;
  texto: string;
  pontos: string[];
  links: { rotulo: string; href: string }[];
};

export type ConteudoSobre = {
  meta: { titulo: string; descricao: string };
  migalha: string;
  titulo: string;
  abertura: (n: Numeros, formatar: (x: number) => string) => string;
  acoes: { explorar: string; criarConta: string; seuPerfil: string };
  /** Legenda dos retratos do topo: "Bach, Mozart… e mais 19 mil". */
  retratos: {
    rotulo: string;
    mais: (quantos: string) => string;
  };
  /** O quadro "O que você encontra aqui": troca sozinho, sempre. */
  quadro: {
    rotulo: string;
    ilustracao: string;
  };
  camadas: { titulo: string; itens: Camada[] };
  porque: { titulo: string; frase: string; paragrafos: string[] };
  acervo: {
    titulo: string;
    abertura: string;
    itens: { titulo: string; texto: string }[];
  };
  fecho: {
    titulo: string;
    texto: string;
    links: { rotulo: string; href: string }[];
  };
};

export const SOBRE: Record<Idioma, ConteudoSobre> = {
  pt: {
    meta: {
      titulo:
        'Sobre o Opus Atlas | Enciclopédia de música clássica e partituras grátis',
      descricao:
        'O Opus Atlas é uma enciclopédia de música clássica gratuita: compositores, obras e partituras de domínio público para baixar, um espaço para organizar o estudo e um portal para professores de música.',
    },
    migalha: 'Sobre',
    titulo:
      'O Opus Atlas é uma enciclopédia de música clássica aberta a quem quiser ler.',
    abertura: (n, f) =>
      n
        ? `Reunimos ${f(n.compositores)} compositores e ${f(n.obras)} peças, com partituras de domínio público para baixar de graça, um lugar para organizar o próprio estudo e um portal para professores acompanharem seus alunos.`
        : 'Reunimos milhares de compositores e obras, com partituras de domínio público para baixar de graça, um lugar para organizar o próprio estudo e um portal para professores acompanharem seus alunos.',
    acoes: {
      explorar: 'Explorar compositores',
      criarConta: 'Criar conta grátis',
      seuPerfil: 'Ir para o meu perfil',
    },
    retratos: {
      rotulo: 'Alguns dos compositores do acervo',
      mais: (n) => `e outros ${n} compositores`,
    },
    quadro: {
      rotulo: 'Partes do Opus Atlas',
      ilustracao: 'Ilustração',
    },
    camadas: {
      titulo: 'O que você encontra aqui',
      itens: [
        {
          id: 'enciclopedia',
          nome: 'A enciclopédia',
          acesso: 'Grátis, sem conta',
          texto:
            'O verbete do compositor traz biografia, datas, nacionalidade e época. O da obra traz catálogo, gênero, instrumentação e as partituras separadas em completas, partes e arranjos. Na página da obra, as gravações do Spotify e do YouTube tocam ali mesmo.',
          pontos: [
            'Partituras em PDF, de domínio público',
            'Épocas, gêneros e instrumentos para navegar',
            'A história da música, da Idade Média ao contemporâneo',
          ],
          links: [
            { rotulo: 'Compositores', href: '/composers' },
            { rotulo: 'Obras', href: '/works' },
            { rotulo: 'Instrumentos', href: '/instruments' },
            { rotulo: 'História da música', href: '/music-history' },
          ],
        },
        {
          id: 'estudo',
          nome: 'O seu estudo',
          acesso: 'Conta grátis',
          texto:
            'Com uma conta, a enciclopédia vira o seu caderno. Você guarda o que quer tocar, marca o que já aprendeu e deixa notas sobre as obras — para você ou para todo mundo.',
          pontos: [
            'Favoritos: compositores, obras e partituras específicas',
            '"Quero aprender", com prioridade e a partitura escolhida',
            '"Já aprendi", com o seu nível de domínio',
            'Anotações de interpretação e técnica, privadas ou públicas',
            'Medalhas e XP pelo que você estuda e contribui',
          ],
          links: [],
        },
        {
          id: 'ensino',
          nome: 'O ensino',
          acesso: 'Planos Mentor e Maestro',
          texto:
            'Quem assina um plano para professores tem, na hora, um portal para dar aula. O aluno entra por convite no e-mail e não paga nada para isso.',
          pontos: [
            'Aulas avulsas ou recorrentes, com objetivos e tarefa de casa',
            'Tarefas com prazo, entregas e retorno do professor',
            'Calendário comum e agenda com os horários livres',
            'Relatórios de progresso compartilhados com o aluno',
            'Avisos automáticos antes da aula e do prazo',
          ],
          links: [
            { rotulo: 'Planos para professores', href: '/pricing#ensinar' },
          ],
        },
        {
          id: 'blog',
          nome: 'O blog',
          acesso: 'Grátis, sem conta',
          texto:
            'Artigos sobre compositores, obras e história, e uma agenda com a programação das salas de concerto brasileiras — OSESP, Theatro Municipal, Sala Cecília Meireles e outras —, cada horário no fuso da sua cidade.',
          pontos: [],
          links: [
            { rotulo: 'Ler o blog', href: '/blog' },
            { rotulo: 'Agenda de concertos', href: '/blog/calendar' },
          ],
        },
      ],
    },
    porque: {
      titulo: 'Por que é grátis',
      frase:
        'Ninguém deveria precisar pagar para ler sobre Bach ou baixar a partitura de uma sonata de Beethoven.',
      paragrafos: [
        'A música clássica que está em domínio público já pertence a todos. O que faltava era um lugar organizado para encontrá-la, em português, sem cadastro no caminho. Por isso a enciclopédia e as partituras não pedem conta nem cobram nada.',
        'O que tem custo de manter fica nos planos: envios ilimitados ao acervo e o portal do professor. [Veja os planos](/pricing).',
      ],
    },
    acervo: {
      titulo: 'Como o acervo é feito',
      abertura:
        'Uma enciclopédia só vale o que se sabe sobre a origem dela. Esta é a nossa.',
      itens: [
        {
          titulo: 'As partituras vêm do IMSLP',
          texto:
            'São edições de domínio público da Petrucci Music Library (IMSLP). Quando uma obra ainda não tem os arquivos guardados aqui, a primeira visita os busca por lá. Uma denúncia de direito autoral tira a partitura do ar na hora — [veja como denunciar](/copyright).',
        },
        {
          titulo: 'A comunidade escreve junto',
          texto:
            'Quem tem conta pode cadastrar compositores, obras e partituras; colando o link do IMSLP, o sistema preenche nome, datas e época, e avisa se o registro já existe. O envio entra no ar na hora, e a moderação age a partir de denúncias.',
        },
        {
          titulo: 'O selo azul é da equipe',
          texto:
            'Compositores e obras conferidos pela equipe levam o selo de verificado. O que não tem selo ainda não foi conferido — e dizemos isso em vez de fingir o contrário.',
        },
        {
          titulo: 'Biografias com ajuda de IA',
          texto:
            'Quando um compositor chega sem biografia, ela é escrita com ajuda de inteligência artificial e traduzida entre português e inglês. Viu um erro? [Fale com a gente](/contact).',
        },
        {
          titulo: 'Seus dados são seus',
          texto:
            'Você baixa tudo o que a sua conta guarda num arquivo e apaga a conta quando quiser, pelas configurações do perfil. Os detalhes estão na [Política de Privacidade](/privacy).',
        },
        {
          titulo: 'Em português e em inglês',
          texto:
            'O site nasceu em português e tem uma versão em inglês, cada uma no seu endereço.',
        },
      ],
    },
    fecho: {
      titulo: 'Fale com a gente',
      texto: `Sugestão, correção ou parceria: escreva para ${CONTATO.contato}.`,
      links: [
        { rotulo: 'Central de ajuda', href: '/help' },
        { rotulo: 'Perguntas frequentes', href: '/faq' },
        { rotulo: 'Contato', href: '/contact' },
      ],
    },
  },
  en: {
    meta: {
      titulo:
        'About Opus Atlas | Classical music encyclopedia and free sheet music',
      descricao:
        'Opus Atlas is a free classical music encyclopedia: composers, works and public-domain sheet music to download, a place to organize your practice and a portal for music teachers.',
    },
    migalha: 'About',
    titulo:
      'Opus Atlas is a classical music encyclopedia open to anyone who wants to read.',
    abertura: (n, f) =>
      n
        ? `We bring together ${f(n.compositores)} composers and ${f(n.obras)} pieces, with public-domain sheet music to download for free, a place to organize your own practice and a portal for teachers to follow their students.`
        : 'We bring together thousands of composers and works, with public-domain sheet music to download for free, a place to organize your own practice and a portal for teachers to follow their students.',
    acoes: {
      explorar: 'Explore composers',
      criarConta: 'Create a free account',
      seuPerfil: 'Go to my profile',
    },
    retratos: {
      rotulo: 'Some of the composers in the collection',
      mais: (n) => `and ${n} more composers`,
    },
    quadro: {
      rotulo: 'Parts of Opus Atlas',
      ilustracao: 'Illustration',
    },
    camadas: {
      titulo: 'What you will find here',
      itens: [
        {
          id: 'enciclopedia',
          nome: 'The encyclopedia',
          acesso: 'Free, no account',
          texto:
            'A composer entry brings biography, dates, nationality and period. A work entry brings its catalogue number, genre, instrumentation and scores sorted into full scores, parts and arrangements. On the work page, Spotify and YouTube recordings play right there.',
          pontos: [
            'Public-domain sheet music in PDF',
            'Periods, genres and instruments to browse',
            'Music history, from the Middle Ages to today',
          ],
          links: [
            { rotulo: 'Composers', href: '/composers' },
            { rotulo: 'Works', href: '/works' },
            { rotulo: 'Instruments', href: '/instruments' },
            { rotulo: 'Music history', href: '/music-history' },
          ],
        },
        {
          id: 'estudo',
          nome: 'Your practice',
          acesso: 'Free account',
          texto:
            'With an account, the encyclopedia becomes your notebook. Keep what you want to play, mark what you have learned and leave notes on the works — for yourself or for everyone.',
          pontos: [
            'Favorites: composers, works and specific scores',
            '"Want to learn", with priority and the score you chose',
            '"Already learned", with your level of mastery',
            'Notes on interpretation and technique, private or public',
            'Medals and XP for what you study and contribute',
          ],
          links: [],
        },
        {
          id: 'ensino',
          nome: 'Teaching',
          acesso: 'Mentor and Maestro plans',
          texto:
            'Subscribing to a teacher plan gives you, right away, a portal to teach from. Students join through an e-mail invitation and pay nothing for it.',
          pontos: [
            'One-off or recurring lessons, with goals and homework',
            'Assignments with due dates, submissions and teacher feedback',
            'A shared calendar and a schedule showing free slots',
            'Progress reports shared with the student',
            'Automatic reminders before lessons and deadlines',
          ],
          links: [{ rotulo: 'Plans for teachers', href: '/pricing#ensinar' }],
        },
        {
          id: 'blog',
          nome: 'The blog',
          acesso: 'Free, no account',
          texto:
            'Articles on composers, works and history, and a calendar with the programmes of Brazilian concert halls — OSESP, Theatro Municipal, Sala Cecília Meireles and others —, each time in the city’s own time zone.',
          pontos: [],
          links: [
            { rotulo: 'Read the blog', href: '/blog' },
            { rotulo: 'Concert calendar', href: '/blog/calendar' },
          ],
        },
      ],
    },
    porque: {
      titulo: 'Why it is free',
      frase:
        'Nobody should have to pay to read about Bach or download the score of a Beethoven sonata.',
      paragrafos: [
        'Classical music in the public domain already belongs to everyone. What was missing was an organized place to find it, with no sign-up in the way. That is why the encyclopedia and the sheet music ask for no account and cost nothing.',
        'What costs money to run goes into the plans: unlimited uploads to the collection and the teacher portal. [See the plans](/pricing).',
      ],
    },
    acervo: {
      titulo: 'How the collection is made',
      abertura:
        'An encyclopedia is only worth what you know about where it comes from. This is ours.',
      itens: [
        {
          titulo: 'The scores come from IMSLP',
          texto:
            'They are public-domain editions from the Petrucci Music Library (IMSLP). When a work does not yet have its files stored here, the first visit fetches them from there. A copyright notice takes a score down immediately — [see how to report](/copyright).',
        },
        {
          titulo: 'The community writes along',
          texto:
            'Anyone with an account can add composers, works and scores; paste the IMSLP link and the system fills in name, dates and period, and warns if the entry already exists. Submissions go live immediately, and moderation acts on reports.',
        },
        {
          titulo: 'The blue seal belongs to the team',
          texto:
            'Composers and works checked by the team carry the verified seal. What has no seal has not been checked yet — and we say so instead of pretending otherwise.',
        },
        {
          titulo: 'Biographies written with AI help',
          texto:
            'When a composer arrives without a biography, one is written with the help of artificial intelligence and translated between Portuguese and English. Spotted a mistake? [Get in touch](/contact).',
        },
        {
          titulo: 'Your data is yours',
          texto:
            'You can download everything your account holds in one file and delete the account whenever you want, from your profile settings. Details are in the [Privacy Policy](/privacy).',
        },
        {
          titulo: 'In Portuguese and in English',
          texto:
            'The site was born in Portuguese and has an English version, each at its own address.',
        },
      ],
    },
    fecho: {
      titulo: 'Get in touch',
      texto: `Suggestions, corrections or partnerships: write to ${CONTATO.contato}.`,
      links: [
        { rotulo: 'Help center', href: '/help' },
        { rotulo: 'FAQ', href: '/faq' },
        { rotulo: 'Contact', href: '/contact' },
      ],
    },
  },
};
