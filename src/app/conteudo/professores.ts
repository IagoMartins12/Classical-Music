import { LIMITES } from './planos';
import type { Idioma } from './legal/tipos';
import type { Numeros } from './sobre';

/**
 * O texto da página para professores (`/for-teachers`).
 *
 * **Só o que o portal faz hoje** (conferido em 11/10/2026): o convite é pela
 * conta que o aluno já tem; o relatório é compartilhado com o aluno, não sai
 * em PDF; o lembrete chega antes da aula e do prazo, no próprio site (aviso
 * por e-mail e SMS ainda está "em breve" no Maestro); vídeo nas tarefas só
 * no Maestro. Preços não moram aqui: os cartões são os mesmos da `/pricing`.
 */
export type ConteudoProfessores = {
  meta: { titulo: string; descricao: string };
  migalha: string;
  titulo: string;
  abertura: string;
  /**
   * The archive the students study in, with live numbers rounded down
   * ("200k+"); without them (no API), no line at all.
   */
  acervo: (n: Numeros, formatar: (x: number) => string) => string | null;
  /** The label of the instruments beside that line. */
  instrumentos: string;
  acoes: { planos: string; criarConta: string; portal: string };
  recursos: {
    titulo: string;
    abertura: string;
    itens: { titulo: string; texto: string; maestro?: boolean }[];
    soMaestro: string;
  };
  passos: { titulo: string; itens: { titulo: string; texto: string }[] };
  planos: { titulo: string; texto: string };
  perguntas: {
    titulo: string;
    itens: { pergunta: string; resposta: string }[];
  };
  fecho: {
    titulo: string;
    texto: string;
    links: { rotulo: string; href: string }[];
  };
};

const pt: ConteudoProfessores = {
  meta: {
    titulo:
      'Para professores | Opus Atlas: aulas, tarefas e progresso dos alunos',
    descricao:
      'O portal do professor do Opus Atlas junta agenda, tarefas com prazo e relatórios de progresso dos seus alunos, ao lado das partituras e gravações do acervo.',
  },
  migalha: 'Para professores',
  titulo: 'Sua turma inteira num lugar só, da agenda ao relatório',
  abertura:
    'No portal do professor, as aulas, as tarefas com prazo e o progresso de cada aluno ficam onde ele já estuda as partituras. Antes da aula e de cada prazo, o portal manda um aviso.',
  acervo: (n, f) => (n ? `${f(n.obras)} obras para seus alunos` : null),
  instrumentos: 'Instrumentos que se ensinam aqui',
  acoes: {
    planos: 'Ver os planos',
    criarConta: 'Criar conta grátis',
    portal: 'Abrir o portal',
  },
  recursos: {
    titulo: 'O que o portal faz por você',
    abertura:
      'Tudo o que hoje fica espalhado entre o caderno, as mensagens e a memória.',
    soMaestro: 'No Maestro',
    itens: [
      {
        titulo: 'A semana num lugar só',
        texto:
          'Marque, remarque e veja quem vem hoje. A agenda mostra a semana inteira e conversa com o seu calendário.',
      },
      {
        titulo: 'Avisos na hora certa',
        texto:
          'Você e o aluno recebem o lembrete antes da aula e antes do prazo de cada tarefa, sem precisar mandar mensagem.',
      },
      {
        titulo: 'Tarefas com prazo',
        texto:
          'Peça um trecho, uma escala ou uma obra do acervo. O aluno marca o que fez e você comenta ali mesmo.',
      },
      {
        titulo: 'O aluno tocando',
        texto:
          'O aluno grava o trecho e manda junto com a tarefa. Você ouve antes da próxima aula.',
        maestro: true,
      },
      {
        titulo: 'Progresso que o aluno enxerga',
        texto:
          'Os números do período chegam prontos: aulas, tarefas e obras concluídas. Você escreve a mensagem e decide se o aluno vê.',
      },
      {
        titulo: 'O acervo à mão',
        texto:
          'Partituras, gravações e anotações de cada obra, prontas para indicar na tarefa.',
      },
    ],
  },
  passos: {
    titulo: 'Como começar',
    itens: [
      {
        titulo: 'Assine o Mentor ou o Maestro',
        texto:
          'Pelo cartão, em reais. O portal abre na hora, no mesmo login do site.',
      },
      {
        titulo: 'Traga seus alunos',
        texto:
          'Busque a conta de cada aluno no Opus Atlas (a grátis serve) e ele entra na sua turma.',
      },
      {
        titulo: 'Marque a primeira aula',
        texto:
          'Escolha o dia na agenda. O aluno recebe o aviso, e você, o lembrete antes de começar.',
      },
    ],
  },
  planos: {
    titulo: 'Dois planos, a mesma sala de aula',
    texto:
      'Escolha pelo tamanho da turma. Seus alunos continuam na conta grátis.',
  },
  perguntas: {
    titulo: 'Perguntas de quem dá aula',
    itens: [
      {
        pergunta: 'Meus alunos precisam pagar?',
        resposta:
          'Não. O aluno usa a conta grátis do Opus Atlas. Quem assina é você.',
      },
      {
        pergunta: 'Quantos alunos cabem no Mentor?',
        resposta: `Até ${LIMITES.MENTOR.alunos} alunos ativos ao mesmo tempo. Passou disso, o Maestro não tem limite.`,
      },
      {
        pergunta: 'Dou aula presencial. Serve para mim?',
        resposta:
          'Serve. A agenda, as tarefas e os relatórios valem para aula presencial ou online. O portal não faz a chamada de vídeo: para isso, use a ferramenta que você já usa.',
      },
      {
        pergunta: 'Posso trocar de plano depois?',
        resposta:
          'Pode. Para subir ao Maestro, escolha o plano na página de planos. Para voltar ao Mentor ou ao Free, use **Meu perfil → Configurações da Conta**.',
      },
      {
        pergunta: 'E se eu cancelar?',
        resposta:
          'O portal fica aberto até o fim do período pago. Depois, a sua conta volta ao Free, e os seus alunos continuam com a conta deles.',
      },
    ],
  },
  fecho: {
    titulo: 'Tem uma escola ou uma turma grande?',
    texto:
      'Conte como você dá aula e a gente ajuda a montar o portal para a sua turma.',
    links: [
      { rotulo: 'Fale com a gente', href: '/contact' },
      { rotulo: 'Comparar todos os planos', href: '/pricing?para=ensinar' },
      { rotulo: 'Central de ajuda', href: '/help' },
    ],
  },
};

const en: ConteudoProfessores = {
  meta: {
    titulo:
      'For teachers | Opus Atlas: lessons, assignments and student progress',
    descricao:
      "The Opus Atlas teacher portal brings your students' schedule, assignments with due dates and progress reports together, next to the catalog's scores and recordings.",
  },
  migalha: 'For teachers',
  titulo: 'Your whole class in one place, from schedule to report',
  abertura:
    'In the teacher portal, lessons, assignments with deadlines and each student’s progress sit where they already study the scores. Before each lesson and deadline, the portal sends a reminder.',
  acervo: (n, f) => (n ? `${f(n.obras)} works for your students` : null),
  instrumentos: 'Instruments taught here',
  acoes: {
    planos: 'See the plans',
    criarConta: 'Create a free account',
    portal: 'Open the portal',
  },
  recursos: {
    titulo: 'What the portal does for you',
    abertura:
      'Everything that today lives scattered across a notebook, your messages and your memory.',
    soMaestro: 'On Maestro',
    itens: [
      {
        titulo: 'Your week in one place',
        texto:
          'Book, reschedule and see who is coming today. The schedule shows the whole week and talks to your calendar.',
      },
      {
        titulo: 'Reminders at the right time',
        texto:
          'You and your student get a reminder before each lesson and before each due date, with no messages to send.',
      },
      {
        titulo: 'Assignments with due dates',
        texto:
          'Ask for a passage, a scale or a work from the catalog. The student marks what they did and you comment right there.',
      },
      {
        titulo: 'Hear them play',
        texto:
          'The student records the passage and sends it with the assignment. You listen before the next lesson.',
        maestro: true,
      },
      {
        titulo: 'Progress your student can see',
        texto:
          'The numbers for the period come ready: lessons, assignments and finished works. You write the message and decide whether the student sees it.',
      },
      {
        titulo: 'The catalog at hand',
        texto:
          'Scores, recordings and annotations for every work, ready to point to in an assignment.',
      },
    ],
  },
  passos: {
    titulo: 'How to start',
    itens: [
      {
        titulo: 'Subscribe to Mentor or Maestro',
        texto:
          'By card. The portal opens right away, with the same login as the site.',
      },
      {
        titulo: 'Bring your students',
        texto:
          'Find each student’s Opus Atlas account (a free one works) and they join your class.',
      },
      {
        titulo: 'Book the first lesson',
        texto:
          'Pick the day on the schedule. The student gets notified, and you get a reminder before it starts.',
      },
    ],
  },
  planos: {
    titulo: 'Two plans, the same classroom',
    texto:
      'Choose by the size of your class. Your students stay on the free account.',
  },
  perguntas: {
    titulo: 'Questions from teachers',
    itens: [
      {
        pergunta: 'Do my students need to pay?',
        resposta:
          'No. Students use the free Opus Atlas account. You are the one who subscribes.',
      },
      {
        pergunta: 'How many students fit in Mentor?',
        resposta: `Up to ${LIMITES.MENTOR.alunos} active students at a time. Beyond that, Maestro has no limit.`,
      },
      {
        pergunta: 'I teach in person. Does it work for me?',
        resposta:
          'Yes. The schedule, assignments and reports work for lessons in person or online. The portal does not run the video call: keep using the tool you already use.',
      },
      {
        pergunta: 'Can I change plans later?',
        resposta:
          'Yes. To move up to Maestro, pick it on the plans page. To go back to Mentor or Free, use **My profile → Account settings**.',
      },
      {
        pergunta: 'What if I cancel?',
        resposta:
          'The portal stays open until the end of the paid period. Then your account goes back to Free, and your students keep their own accounts.',
      },
    ],
  },
  fecho: {
    titulo: 'Running a school or a large class?',
    texto:
      'Tell us how you teach and we will help set the portal up for your class.',
    links: [
      { rotulo: 'Talk to us', href: '/contact' },
      { rotulo: 'Compare all plans', href: '/pricing?para=ensinar' },
      { rotulo: 'Help center', href: '/help' },
    ],
  },
};

export const PROFESSORES: Record<Idioma, ConteudoProfessores> = { pt, en };
