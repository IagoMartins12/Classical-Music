import type { Idioma } from '../legal/tipos';

/**
 * Completing a composer or work (sketch `contribuir.tsx`, 06/10): biography,
 * curiosity, video or a detail. Live at once, with the author's name; the
 * XP arrives after seven days without an upheld report.
 */
const pt = {
  action: 'Contribuir',
  title: (target: string) => `Completar ${target}`,
  intro:
    'Entra no ar na hora, com o seu nome. Se alguém denunciar e a equipe concordar, sai.',
  tabs: 'O que você quer acrescentar',
  kinds: {
    bio: 'Biografia',
    curiosity: 'Curiosidade',
    video: 'Vídeo',
    data: 'Dado da ficha',
  },
  xpLater: (xp: number) => `+${xp} XP após 7 dias sem denúncia`,
  bio: {
    label: (language: string) => `Biografia em ${language}`,
    placeholder:
      'Quem foi, onde viveu, o que escreveu e por que importa. De 3 a 5 parágrafos.',
    count: (n: number) => `${n} caracteres · o texto enviado substitui o atual`,
    min: 'A biografia precisa ter pelo menos 300 caracteres.',
    source: 'Fonte',
    sourceHint: '(link ou livro)',
    sourcePlaceholder: 'https://… ou Grove Music Online',
  },
  curiosity: {
    label: 'A curiosidade, em uma ou duas frases',
    placeholder:
      'Ex.: Deu só cerca de trinta concertos públicos na vida inteira.',
    min: 'Conte numa frase completa (pelo menos 20 caracteres).',
    source: 'Fonte',
    sourcePlaceholder: 'Onde você leu isso?',
    showName: 'Mostrar meu nome',
    showNameHint:
      'Aparece como “Contada por você”. Sem marcar, a curiosidade entra sem assinatura.',
  },
  video: {
    label: 'Link do YouTube',
    hint: 'Documentário, aula ou gravação. Vídeo seu tocando vai em “Já aprendi” da obra.',
    invalid: 'Use um link do YouTube.',
  },
  data: {
    nothing: 'Mude pelo menos um dado antes de publicar.',
  },
  fields: {
    birthDate: 'Data de nascimento',
    deathDate: 'Data de morte',
    nationality: 'Nacionalidade',
    wikipediaLink: 'Link da Wikipédia',
    compositionYear: 'Ano de composição',
    firstPublishDate: 'Primeira publicação',
    tone: 'Tonalidade',
    dedicateTo: 'Dedicatória',
    instrumentation: 'Instrumentação',
    subtitle: 'Subtítulo',
  } as Record<string, string>,
  languages: { pt: 'português', en: 'inglês' },
  cancel: 'Cancelar',
  publish: 'Publicar',
  published: 'Publicado. Obrigado!',
  failed: 'Não foi possível publicar. Tente de novo.',
  leaveTitle: 'Descartar a contribuição?',
  leaveText: 'O que você escreveu aqui se perde.',
  leaveConfirm: 'Descartar',
  verify: {
    title: 'Confirme seu e-mail para contribuir',
    intro:
      'Biografias e vídeos aparecem para todo mundo com o seu nome (a curiosidade, só se você quiser), por isso pedimos o e-mail confirmado.',
    body: (email: string) =>
      `O link chegou em ${email}. Não achou? Olhe o spam, ou reenvie.`,
    later: 'Agora não',
    resend: 'Reenviar o e-mail',
    sent: (email: string) => `Enviamos o link para ${email}.`,
  },
  invite: {
    title: (target: string) => `Ajude a completar ${target}`,
    body: (missing: string) =>
      `Falta ${missing}. Cada informação aceita vale XP e aparece para todo mundo.`,
    unverified: 'Precisa do e-mail confirmado.',
    how: 'Como confirmar',
    missing: {
      bio: 'biografia',
      video: 'vídeo',
      curiosity: 'curiosidades',
      compositionYear: 'ano de composição',
      tone: 'tonalidade',
      instrumentation: 'instrumentação',
    } as Record<string, string>,
    and: ' e ',
  },
  composerTarget: 'este compositor',
  workTarget: 'esta obra',
  wrong: {
    lead: 'Algo errado nesta página?',
    fix: 'Corrija um dado',
    or: 'ou',
    upload: 'envie uma obra que falta',
  },
  credit: (name: string) => `Revisto por ${name}`,
  reportContribution: 'Denunciar esta contribuição',
  curiosities: {
    add: 'Acrescentar',
    by: (name: string) => `Contada por ${name}`,
    you: 'Contada por você',
    youUnsigned: 'Sua curiosidade, sem assinatura',
    held: 'Fora do ar enquanto a equipe analisa uma denúncia',
    report: 'Denunciar esta curiosidade',
    remove: 'Apagar sua curiosidade',
    removed: 'Curiosidade apagada.',
    first: (name: string) =>
      `Ninguém contou uma curiosidade sobre ${name} ainda. A primeira vale XP.`,
  },
};

const en: typeof pt = {
  action: 'Contribute',
  title: (target) => `Complete ${target}`,
  intro:
    'It goes live right away, with your name. If someone reports it and the team agrees, it comes down.',
  tabs: 'What do you want to add',
  kinds: {
    bio: 'Biography',
    curiosity: 'Curiosity',
    video: 'Video',
    data: 'Detail',
  },
  xpLater: (xp) => `+${xp} XP after 7 days without a report`,
  bio: {
    label: (language) => `Biography in ${language}`,
    placeholder:
      'Who they were, where they lived, what they wrote and why it matters. 3 to 5 paragraphs.',
    count: (n) => `${n} characters · what you send replaces the current text`,
    min: 'The biography needs at least 300 characters.',
    source: 'Source',
    sourceHint: '(link or book)',
    sourcePlaceholder: 'https://… or Grove Music Online',
  },
  curiosity: {
    label: 'The curiosity, in one or two sentences',
    placeholder:
      'E.g. Gave only about thirty public concerts in his whole life.',
    min: 'Tell it in a full sentence (at least 20 characters).',
    source: 'Source',
    sourcePlaceholder: 'Where did you read it?',
    showName: 'Show my name',
    showNameHint:
      'It reads “Shared by you”. Unchecked, the curiosity goes in unsigned.',
  },
  video: {
    label: 'YouTube link',
    hint: 'Documentary, lesson or recording. A video of you playing goes in the work’s “I learned it”.',
    invalid: 'Use a YouTube link.',
  },
  data: {
    nothing: 'Change at least one detail before publishing.',
  },
  fields: {
    birthDate: 'Date of birth',
    deathDate: 'Date of death',
    nationality: 'Nationality',
    wikipediaLink: 'Wikipedia link',
    compositionYear: 'Year of composition',
    firstPublishDate: 'First published',
    tone: 'Key',
    dedicateTo: 'Dedication',
    instrumentation: 'Instrumentation',
    subtitle: 'Subtitle',
  },
  languages: { pt: 'Portuguese', en: 'English' },
  cancel: 'Cancel',
  publish: 'Publish',
  published: 'Published. Thank you!',
  failed: 'Could not publish. Try again.',
  leaveTitle: 'Discard your contribution?',
  leaveText: 'What you wrote here will be lost.',
  leaveConfirm: 'Discard',
  verify: {
    title: 'Confirm your email to contribute',
    intro:
      'Biographies and videos show to everyone with your name (a curiosity only if you want), so we ask for a confirmed email.',
    body: (email) =>
      `The link went to ${email}. Can’t find it? Check spam, or resend it.`,
    later: 'Not now',
    resend: 'Resend the email',
    sent: (email) => `We sent the link to ${email}.`,
  },
  invite: {
    title: (target) => `Help complete ${target}`,
    body: (missing) =>
      `Missing: ${missing}. Every accepted detail earns XP and shows to everyone.`,
    unverified: 'Needs a confirmed email.',
    how: 'How to confirm',
    missing: {
      bio: 'biography',
      video: 'video',
      curiosity: 'curiosities',
      compositionYear: 'year of composition',
      tone: 'key',
      instrumentation: 'instrumentation',
    },
    and: ' and ',
  },
  composerTarget: 'this composer',
  workTarget: 'this work',
  wrong: {
    lead: 'Something wrong on this page?',
    fix: 'Fix a detail',
    or: 'or',
    upload: 'send a missing work',
  },
  credit: (name) => `Revised by ${name}`,
  reportContribution: 'Report this contribution',
  curiosities: {
    add: 'Add',
    by: (name) => `Shared by ${name}`,
    you: 'Shared by you',
    youUnsigned: 'Your curiosity, unsigned',
    held: 'Out of sight while the team reviews a report',
    report: 'Report this curiosity',
    remove: 'Delete your curiosity',
    removed: 'Curiosity deleted.',
    first: (name) =>
      `Nobody has shared a curiosity about ${name} yet. The first one earns XP.`,
  },
};

export const CONTRIBUTE: Record<Idioma, typeof pt> = { pt, en };
export type ContributeCopy = typeof pt;
