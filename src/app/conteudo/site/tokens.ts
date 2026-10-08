import type { Idioma } from '../legal/tipos';

/** Copy for the pages opened from e-mail links (one-time tokens). */
const pt = {
  errors: {
    EXPIRED_TOKEN: [
      'Este link venceu',
      'Os links de e-mail valem por pouco tempo, por segurança.',
    ],
    USED_TOKEN: [
      'Este link já foi usado',
      'Cada link vale uma vez. Se você já confirmou, está tudo certo.',
    ],
    INVALID_TOKEN: [
      'Este link não é válido',
      'Confira se ele chegou inteiro no e-mail, sem quebra de linha.',
    ],
    EMAIL_TAKEN: [
      'Este e-mail já tem conta',
      'Entre com ele ou use outro endereço.',
    ],
    RATE_LIMITED: [
      'Muitas tentativas seguidas',
      'Espere alguns minutos e tente de novo.',
    ],
    CONNECTION_ERROR: [
      'Sem conexão com o Opus Atlas',
      'Confira a internet e tente de novo.',
    ],
    NO_TOKEN: [
      'Faltou o código do link',
      'Abra o link direto do e-mail que enviamos.',
    ],
  } as Record<string, [string, string]>,
  resend: 'Enviar um link novo',
  resent: 'Enviamos um link novo. Confira a caixa de entrada.',
  retry: 'Tentar de novo',
  home: 'Voltar ao início',
  studies: 'Ir para os seus estudos',
  account: {
    meta: 'Confirmar conta',
    loading: 'Confirmando a sua conta…',
    success: 'E-mail confirmado',
    successText: (name: string) =>
      `Pronto${name ? `, ${name}` : ''}: sua conta está confirmada. Se ainda não respondeu as perguntas das boas-vindas, dá tempo agora.`,
    already: 'Esta conta já estava confirmada',
    alreadyText: 'Pode entrar e continuar de onde parou.',
    welcome: 'Responder as boas-vindas',
    signIn: 'Entrar',
  },
  emailChange: {
    meta: 'Confirmar e-mail novo',
    loading: 'Confirmando o e-mail novo…',
    success: 'E-mail trocado',
    successText:
      'Entre de novo com o endereço novo. Por segurança, encerramos as sessões abertas.',
    signIn: 'Entrar com o e-mail novo',
  },
  studentInvite: {
    meta: 'Convite de aluno',
    loading: 'Aceitando o convite…',
    success: (teacher: string) => `Você agora estuda com ${teacher}`,
    successText:
      'As aulas, as tarefas e o calendário aparecem no seu portal. Avisamos quem convidou.',
    portal: 'Abrir o portal do aluno',
  },
  studentDecline: {
    meta: 'Recusar convite',
    loading: 'Recusando o convite…',
    success: 'Convite recusado',
    successText: (teacher: string) =>
      `Avisamos ${teacher || 'quem convidou'}. Se mudar de ideia, peça um convite novo.`,
  },
  teacherInvite: {
    meta: 'Convite de professor',
    loading: 'Aceitando o convite…',
    success: 'Convite aceito',
    successText:
      'Seu acesso de professor está liberado. O portal já mostra a agenda e os alunos.',
    portal: 'Abrir o portal do professor',
  },
  teacherDecline: {
    meta: 'Recusar convite',
    loading: 'Recusando o convite…',
    success: 'Convite recusado',
    successText:
      'Tudo certo. Se mudar de ideia, peça um convite novo à equipe.',
  },
  reset: {
    meta: 'Nova senha',
    title: 'Escolha uma senha nova',
    password: 'Senha nova',
    confirm: 'Repita a senha',
    rule: 'Pelo menos 8 caracteres.',
    short: (n: number) => `Faltam ${n} caracteres.`,
    mismatch: 'As duas senhas não são iguais.',
    show: 'Mostrar a senha',
    hide: 'Esconder a senha',
    save: 'Salvar a senha nova',
    success: 'Senha trocada',
    successText: 'Use a senha nova da próxima vez que entrar.',
    signIn: 'Entrar agora',
    requestNew: 'Pedir um link novo',
  },
};

const en: typeof pt = {
  errors: {
    EXPIRED_TOKEN: [
      'This link has expired',
      'E-mail links last a short time, for security.',
    ],
    USED_TOKEN: [
      'This link was already used',
      'Each link works once. If you already confirmed, you are all set.',
    ],
    INVALID_TOKEN: [
      'This link is not valid',
      'Check that it arrived whole in the e-mail, without a line break.',
    ],
    EMAIL_TAKEN: [
      'This e-mail already has an account',
      'Sign in with it or use another address.',
    ],
    RATE_LIMITED: [
      'Too many tries in a row',
      'Wait a few minutes and try again.',
    ],
    CONNECTION_ERROR: [
      'Cannot reach Opus Atlas',
      'Check your connection and try again.',
    ],
    NO_TOKEN: [
      'The link is missing its code',
      'Open the link straight from the e-mail we sent.',
    ],
  },
  resend: 'Send a new link',
  resent: 'We sent a new link. Check your inbox.',
  retry: 'Try again',
  home: 'Back to the home page',
  studies: 'Go to your studies',
  account: {
    meta: 'Confirm account',
    loading: 'Confirming your account…',
    success: 'E-mail confirmed',
    successText: (name: string) =>
      `Done${name ? `, ${name}` : ''}: your account is confirmed. If you have not answered the welcome questions yet, now is a good time.`,
    already: 'This account was already confirmed',
    alreadyText: 'Sign in and carry on where you left off.',
    welcome: 'Answer the welcome questions',
    signIn: 'Sign in',
  },
  emailChange: {
    meta: 'Confirm new e-mail',
    loading: 'Confirming your new e-mail…',
    success: 'E-mail changed',
    successText:
      'Sign in again with the new address. For security, we closed your open sessions.',
    signIn: 'Sign in with the new e-mail',
  },
  studentInvite: {
    meta: 'Student invite',
    loading: 'Accepting the invite…',
    success: (teacher: string) => `You now study with ${teacher}`,
    successText:
      'Lessons, assignments and the calendar show up in your portal. We let your teacher know.',
    portal: 'Open the student portal',
  },
  studentDecline: {
    meta: 'Decline invite',
    loading: 'Declining the invite…',
    success: 'Invite declined',
    successText: (teacher: string) =>
      `We let ${teacher || 'the sender'} know. If you change your mind, ask for a new invite.`,
  },
  teacherInvite: {
    meta: 'Teacher invite',
    loading: 'Accepting the invite…',
    success: 'Invite accepted',
    successText:
      'Your teacher access is on. The portal already shows the calendar and students.',
    portal: 'Open the teacher portal',
  },
  teacherDecline: {
    meta: 'Decline invite',
    loading: 'Declining the invite…',
    success: 'Invite declined',
    successText:
      'All set. If you change your mind, ask the team for a new invite.',
  },
  reset: {
    meta: 'New password',
    title: 'Choose a new password',
    password: 'New password',
    confirm: 'Repeat the password',
    rule: 'At least 8 characters.',
    short: (n: number) => `${n} characters to go.`,
    mismatch: 'The two passwords do not match.',
    show: 'Show the password',
    hide: 'Hide the password',
    save: 'Save the new password',
    success: 'Password changed',
    successText: 'Use the new password next time you sign in.',
    signIn: 'Sign in now',
    requestNew: 'Ask for a new link',
  },
};

export const TOKENS: Record<Idioma, typeof pt> = { pt, en };
export type TokensCopy = typeof pt;
