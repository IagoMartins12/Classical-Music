// components/Portal/help/steps.ts — o roteiro do tour de cada tela
//
// Cada parte de tela que tem explicação leva `data-ajuda="chave"`; o tour
// pula as chaves que a tela (ou o tamanho de tela) atual não mostra.
import type { Role } from '@/app/requests/portal/api';
import type { ScreenId } from '../navigation';

export interface Step {
  target: string;
  title: string;
  text: string;
}

/** Telas sem item no menu, mas com tour próprio. */
export type HelpScreen = ScreenId | 'lesson-new' | 'student-page' | 'invite';

const SHELL: Step[] = [
  {
    target: 'nav',
    title: 'Todas as telas',
    text: 'O portal inteiro mora aqui. O número ao lado de uma tela é o que espera por você nela.',
  },
  {
    target: 'papel',
    title: 'Dou aula · Estudo',
    text: 'Quem dá aula e também estuda troca de papel aqui, sem sair do portal. Os avisos dos dois papéis chegam juntos.',
  },
  {
    target: 'avisos',
    title: 'Avisos',
    text: 'O ponto dourado diz que há aviso não lido. Toque para ver os últimos; por onde eles chegam (e-mail e, no Maestro, WhatsApp) você escolhe no Perfil.',
  },
  {
    target: 'ajuda',
    title: 'Ajuda em toda tela',
    text: 'Este botão mostra o tour da tela em que você estiver. Volte quando quiser.',
  },
];

const TEACHER: Partial<Record<HelpScreen, Step[]>> = {
  dashboard: [
    {
      target: 'frase',
      title: 'O dia numa frase',
      text: 'Cada trecho sublinhado é uma ação: abre a aula, a entrega ou o pedido. Resolveu, a frase se reescreve.',
    },
    {
      target: 'acao',
      title: 'Marcar aula',
      text: 'A marcação rápida: aluno, dia e hora, com a agenda conferindo conflitos. Série, repertório e avisos ficam na criação completa.',
    },
    {
      target: 'sumario',
      title: 'Ir direto',
      text: 'Cada ícone leva a uma parte do painel. Segure o dedo (ou passe o mouse) para ver o nome.',
    },
    {
      target: 'semana',
      title: 'A semana',
      text: 'Cada dia é um compasso e as aulas são as notas: dá para ver de relance os dias cheios e os vazios. Toque numa aula para abrir.',
    },
    {
      target: 'fila',
      title: 'Esperando você',
      text: 'Aulas que passaram sem desfecho, entregas para ouvir e pedidos de aula. Resolveu, sai da lista.',
    },
    {
      target: 'atencao',
      title: 'Pedem atenção',
      text: 'Quem está praticando abaixo da meta, com tarefa atrasada, convite parado ou sem relatório — antes de virar problema.',
    },
    {
      target: 'alunos',
      title: 'Seus alunos',
      text: 'Próxima aula e prática da semana de cada um. Toque para abrir a ficha.',
    },
    {
      target: 'repertorio',
      title: 'Repertório',
      text: 'As obras das próximas aulas, com quem está tocando cada uma.',
    },
    ...SHELL,
  ],
  calendar: [
    {
      target: 'modos',
      title: 'Semana, mês ou lista',
      text: 'Troque a vista e ande com as setas. "Hoje" volta para agora.',
    },
    {
      target: 'livres',
      title: 'Horas livres',
      text: 'Seu atendimento menos bloqueios menos aulas. É o mesmo que seus alunos veem para pedir aula.',
    },
    {
      target: 'atendimento',
      title: 'Horário de atendimento',
      text: 'Quando você atende e quando não atende (férias, feriados). A agenda informa, não impede.',
    },
    {
      target: 'grade',
      title: 'A agenda',
      text: 'Toque numa aula para ver o detalhe ao lado; numa hora livre, para marcar. Tracejado em ouro é aula sem desfecho.',
    },
    {
      target: 'sincronizar',
      title: 'No seu celular',
      text: 'Assine a agenda no calendário do celular ou do computador, ou baixe as aulas num arquivo.',
    },
  ],
  lessons: [
    {
      target: 'filtros',
      title: 'Filtros',
      text: 'Próximas, sem desfecho e anteriores, e o aluno. Aula não se apaga: se cancela, e fica no histórico.',
    },
    {
      target: 'lista',
      title: 'As aulas',
      text: 'Toque numa aula para ver o detalhe. A que passou sem desfecho tem o botão de fechar ali mesmo.',
    },
    {
      target: 'acao',
      title: 'Marcar rápido ou criação completa',
      text: 'Marcar rápido resolve aluno, dia e hora. Nova aula abre a criação completa: série, repertório do acervo, objetivos e avisos.',
    },
  ],
  'lesson-new': [
    {
      target: 'aluno',
      title: 'Para quem',
      text: 'Ao escolher o aluno, o portal traz o plano dele, a prática da semana e o que ele quer aprender.',
    },
    {
      target: 'quando',
      title: 'Quando',
      text: 'O dia aparece desenhado com as aulas que já existem, para você ver onde a nova cai.',
    },
    {
      target: 'verificacao',
      title: 'A agenda confere',
      text: 'Choque com suas aulas e com as do aluno em outra turma, bloqueios, folga, deslocamento e limites. E sugere horários sem conflito.',
    },
    {
      target: 'serie',
      title: 'Séries',
      text: 'Cada data da série é conferida sozinha. A que choca pode ser pulada ou movida para a sugestão.',
    },
    {
      target: 'repertorio',
      title: 'Compositor e obra',
      text: 'Busque o compositor e depois a obra no acervo, ou puxe do "quero aprender" do aluno. A partitura vem da obra.',
    },
  ],
  assignments: [
    {
      target: 'filtros',
      title: 'Filtros',
      text: '"Esperando retorno" é o que os alunos já entregaram e espera você ouvir.',
    },
    {
      target: 'lista',
      title: 'As tarefas',
      text: 'A porcentagem é o andamento que o aluno marcou. Toque para dar retorno e nota, ou lembrar o aluno.',
    },
    {
      target: 'acao',
      title: 'Nova tarefa',
      text: 'Com passo a passo, tempo por dia e a obra do acervo.',
    },
  ],
  students: [
    {
      target: 'acao',
      title: 'Convidar',
      text: 'O convite vai por e-mail e vale 30 dias; convite pendente não ocupa vaga do plano.',
    },
    {
      target: 'abas',
      title: 'Ativos, convites, encerrados',
      text: 'Encerrar um vínculo guarda tudo: aulas, tarefas e relatórios.',
    },
    {
      target: 'lista',
      title: 'Seus alunos',
      text: 'A seta abre o gráfico de estudo do aluno; o nome abre a página dele.',
    },
  ],
  'student-page': [
    {
      target: 'numeros',
      title: 'Os números do aluno',
      text: 'Aulas, presença (só sobre aula que já aconteceu), prática e tarefas.',
    },
    {
      target: 'repertorio',
      title: 'Repertório do aluno',
      text: 'O que ele está estudando, quer aprender e já aprendeu. Sugira uma obra nova daqui.',
    },
  ],
  reports: [
    {
      target: 'acao',
      title: 'Gerar relatório',
      text: 'O servidor monta com os números do período; você escreve a mensagem e decide se o aluno vê.',
    },
    {
      target: 'proximos',
      title: 'Próximos relatórios',
      text: 'Quem está para receber e quem nunca recebeu.',
    },
    {
      target: 'lista',
      title: 'Relatórios',
      text: '"Só seu" fica com você; "compartilhado" o aluno vê e comenta. Um "só seu" pode virar compartilhado depois.',
    },
  ],
  history: [
    {
      target: 'filtros',
      title: 'Filtros',
      text: 'Aulas, tarefas, relatórios, alunos.',
    },
    { target: 'acao', title: 'Exportar', text: 'O histórico inteiro em CSV.' },
  ],
  notifications: [
    { target: 'filtros', title: 'Filtros', text: 'Não lidos e por tipo.' },
    {
      target: 'lista',
      title: 'Seus avisos',
      text: 'Toque num aviso para ir direto ao que ele fala.',
    },
    {
      target: 'acao',
      title: 'Enviar aviso',
      text: 'Para um aluno ou a turma, pelo canal que cada um aceita.',
    },
  ],
  profile: [
    {
      target: 'perfil-publico',
      title: 'Como os alunos te veem',
      text: 'Aparece no convite e na ficha que o aluno abre.',
    },
    {
      target: 'perfil-aulas',
      title: 'Seu esquema de aulas',
      text: 'Duração, folga, deslocamento e limites — a régua da verificação de conflitos.',
    },
    {
      target: 'perfil-avisos',
      title: 'Por onde você é avisado',
      text: 'Cada tipo de aviso, por e-mail ou WhatsApp (Maestro), e o horário de silêncio.',
    },
  ],
};

const STUDENT: Partial<Record<HelpScreen, Step[]>> = {
  dashboard: [
    {
      target: 'frase',
      title: 'O dia numa frase',
      text: 'Sua próxima aula e o que levar. O trecho sublinhado abre a aula.',
    },
    {
      target: 'acao',
      title: 'Registrar prática',
      text: 'Diga quanto estudou, ou use o cronômetro. Seus professores veem a semana antes da aula.',
    },
    {
      target: 'semana',
      title: 'Sua semana',
      text: 'As aulas com todos os seus professores juntas.',
    },
    {
      target: 'pratica',
      title: 'Sua prática',
      text: 'Os últimos sete dias. A linha tracejada é a sua meta.',
    },
    {
      target: 'tarefas',
      title: 'Tarefas',
      text: 'Marque o andamento e entregue a gravação por aqui.',
    },
    {
      target: 'estudo',
      title: 'Seu estudo',
      text: 'O que você quer aprender e já aprendeu — a mesma lista da sua biblioteca.',
    },
    ...SHELL,
  ],
  calendar: [
    {
      target: 'livres',
      title: 'Horários livres',
      text: 'Os horários livres do seu professor. Toque em um para pedir aula.',
    },
    {
      target: 'grade',
      title: 'Sua agenda',
      text: 'As aulas com todos os seus professores juntas.',
    },
    {
      target: 'sincronizar',
      title: 'No seu celular',
      text: 'Assine a agenda no calendário do celular ou baixe as aulas num arquivo.',
    },
  ],
  lessons: [
    {
      target: 'filtros',
      title: 'Filtros',
      text: 'Próximas e anteriores, e o professor.',
    },
    {
      target: 'lista',
      title: 'Suas aulas',
      text: 'Toque para abrir. Na aula, guarde as obras no "quero aprender" ou no "já aprendi".',
    },
  ],
  assignments: [
    {
      target: 'filtros',
      title: 'Filtros',
      text: 'Abertas, atrasadas, concluídas.',
    },
    {
      target: 'lista',
      title: 'As tarefas',
      text: 'Abra para seguir o passo a passo, marcar o andamento e entregar.',
    },
  ],
  study: [
    {
      target: 'pratica',
      title: 'Prática',
      text: 'A semana, as últimas semanas e o diário.',
    },
    {
      target: 'repertorio',
      title: 'Repertório',
      text: 'Estudando, quero aprender e já aprendi. Seus professores veem para planejar as aulas.',
    },
  ],
  reports: [
    {
      target: 'lista',
      title: 'Relatórios',
      text: 'O que seus professores escreveram sobre o período. Comente para responder.',
    },
  ],
  history: [
    {
      target: 'filtros',
      title: 'Filtros',
      text: 'Aulas, tarefas, relatórios e prática.',
    },
  ],
  notifications: [
    {
      target: 'lista',
      title: 'Seus avisos',
      text: 'Toque num aviso para ir direto ao que ele fala.',
    },
  ],
  profile: [
    {
      target: 'perfil-avisos',
      title: 'Como te avisar',
      text: 'E-mail, WhatsApp (Maestro) e o horário em que ninguém te avisa fora do portal.',
    },
  ],
  invite: [
    {
      target: 'convite',
      title: 'O convite',
      text: 'Aceite para entrar na turma: aulas, tarefas e calendário aparecem na hora.',
    },
    {
      target: 'turmas',
      title: 'Turmas antigas',
      text: 'O histórico das turmas que terminaram continua aqui.',
    },
  ],
};

export const stepsFor = (role: Role, screen: HelpScreen): Step[] =>
  (role === 'teacher' ? TEACHER : STUDENT)[screen] ?? SHELL;
