import type { Idioma } from '../legal/tipos';

/** Contributing to a composer or work, and the curiosities block. */
const pt = {
  action: 'Contribuir',
  title: (name: string) => `Melhorar ${name}`,
  intro:
    'Sua contribuição entra no ar na hora e vale XP. Se algo sair errado, qualquer pessoa pode denunciar e a equipe desfaz.',
  what: 'O que você quer melhorar?',
  kinds: {
    bio: 'Biografia',
    video: 'Vídeo',
    correction: 'Corrigir um dado',
  },
  bio: {
    label: 'Biografia',
    help: (language: string) =>
      `Em ${language}. Revise o texto inteiro: o que você enviar substitui o atual.`,
    min: 'A biografia precisa ter pelo menos 300 caracteres.',
  },
  video: {
    label: 'Link do YouTube',
    help: 'Uma boa gravação ou um documentário sobre a vida e a obra.',
    invalid: 'Use um link do YouTube.',
  },
  correction: {
    field: 'Qual dado',
    value: 'Valor correto',
    help: 'Confira numa fonte confiável antes de publicar.',
    same: 'O valor é igual ao atual.',
    empty: 'Escreva o valor correto.',
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
  published: (xp: number) =>
    xp > 0 ? `Publicado. Você ganhou ${xp} XP.` : 'Publicado. Obrigado!',
  failed: 'Não foi possível publicar. Tente de novo.',
  leaveTitle: 'Descartar a contribuição?',
  leaveText: 'O que você escreveu aqui se perde.',
  leaveConfirm: 'Descartar',
  credit: (name: string) => `Revisto por ${name}`,
  reportContribution: 'Denunciar esta contribuição',
  curiosities: {
    add: 'Contar uma curiosidade',
    sheetTitle: (name: string) => `Uma curiosidade sobre ${name}`,
    sheetIntro:
      'Um fato curto e verdadeiro, que faça alguém querer ouvir mais. Entra no ar na hora e vale XP.',
    label: 'Curiosidade',
    placeholder: 'Ex.: Escreveu a primeira sinfonia aos oito anos.',
    min: 'Conte numa frase completa (pelo menos 20 caracteres).',
    by: (name: string) => `Contada por ${name}`,
    you: 'Contada por você',
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
  title: (name) => `Improve ${name}`,
  intro:
    'Your contribution goes live right away and earns XP. If something goes wrong, anyone can report it and the team undoes it.',
  what: 'What do you want to improve?',
  kinds: {
    bio: 'Biography',
    video: 'Video',
    correction: 'Fix a detail',
  },
  bio: {
    label: 'Biography',
    help: (language) =>
      `In ${language}. Revise the whole text: what you send replaces the current one.`,
    min: 'The biography needs at least 300 characters.',
  },
  video: {
    label: 'YouTube link',
    help: 'A good recording or a documentary about the life and work.',
    invalid: 'Use a YouTube link.',
  },
  correction: {
    field: 'Which detail',
    value: 'Correct value',
    help: 'Check it against a reliable source before publishing.',
    same: 'That is the current value.',
    empty: 'Write the correct value.',
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
  published: (xp) =>
    xp > 0 ? `Published. You earned ${xp} XP.` : 'Published. Thank you!',
  failed: 'Could not publish. Try again.',
  leaveTitle: 'Discard your contribution?',
  leaveText: 'What you wrote here will be lost.',
  leaveConfirm: 'Discard',
  credit: (name) => `Revised by ${name}`,
  reportContribution: 'Report this contribution',
  curiosities: {
    add: 'Share a curiosity',
    sheetTitle: (name) => `A curiosity about ${name}`,
    sheetIntro:
      'A short, true fact that makes someone want to listen. It goes live right away and earns XP.',
    label: 'Curiosity',
    placeholder: 'E.g. Wrote his first symphony at eight.',
    min: 'Tell it in a full sentence (at least 20 characters).',
    by: (name) => `Shared by ${name}`,
    you: 'Shared by you',
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
