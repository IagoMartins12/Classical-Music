import type { Idioma } from '../legal/tipos';

/** Copy shared by components used across the public site. */
const pt = {
  favorite: {
    add: (name: string) => `Favoritar ${name}`,
    remove: (name: string) => `Tirar ${name} dos favoritos`,
    added: (name: string) => `${name} nos favoritos`,
    removed: (name: string) => `${name} saiu dos favoritos`,
    failed: 'Não foi possível salvar o favorito. Tente de novo.',
    labelOn: 'Favoritado',
    labelOff: 'Favoritar',
  },
  verified: 'Verificado',
  curation: { edit: 'Editar', verify: 'Verificação' },
  more: 'Mais ações',
  share: {
    action: 'Compartilhar',
    title: 'Compartilhar',
    shareOn: 'Compartilhar em',
    copyLink: 'Copiar o link',
    copied: 'Link copiado',
    email: 'E-mail',
  },
  report: {
    action: 'Reportar',
    title: (name: string) => `Reportar ${name}`,
    intro:
      'A equipe lê cada report. Se você estiver certo, a página é corrigida e você recebe um aviso.',
    question: 'O que está errado?',
    details: 'Detalhes',
    required: '(obrigatório)',
    optional: '(opcional)',
    placeholder: 'Ex.: a data de nascimento certa é 22 de fevereiro.',
    warning: 'Report falso de propósito pode suspender a conta.',
    cancel: 'Cancelar',
    send: 'Enviar report',
    sent: 'Recebemos sua denúncia. Vamos analisar, e o resultado chega nas suas notificações.',
    /** The API already explains in Portuguese; this is the fallback. */
    duplicate: 'Você já denunciou este item.',
    failed: 'Não foi possível enviar. Tente de novo.',
    reasons: {
      false_information: [
        'Informação errada',
        'Data, local, obra ou foto que não confere',
      ],
      inappropriate_content: ['Conteúdo inadequado', 'Ofensivo ou impróprio'],
      copyright_violation: [
        'Direitos autorais',
        'Material protegido usado sem autorização',
      ],
      duplicate_content: ['Duplicado', 'Já existe outra página para isto'],
      spam: ['Spam', 'Repetitivo ou sem relação'],
      other: ['Outros', 'Conte o que aconteceu'],
    } as Record<string, [string, string]>,
  },
};

const en: typeof pt = {
  favorite: {
    add: (name: string) => `Add ${name} to favorites`,
    remove: (name: string) => `Remove ${name} from favorites`,
    added: (name: string) => `${name} added to favorites`,
    removed: (name: string) => `${name} removed from favorites`,
    failed: 'Could not save the favorite. Try again.',
    labelOn: 'Favorited',
    labelOff: 'Favorite',
  },
  verified: 'Verified',
  curation: { edit: 'Edit', verify: 'Verification' },
  more: 'More actions',
  share: {
    action: 'Share',
    title: 'Share',
    shareOn: 'Share on',
    copyLink: 'Copy the link',
    copied: 'Link copied',
    email: 'Email',
  },
  report: {
    action: 'Report',
    title: (name: string) => `Report ${name}`,
    intro:
      'The team reads every report. If you are right, the page is fixed and you get a notice.',
    question: 'What is wrong?',
    details: 'Details',
    required: '(required)',
    optional: '(optional)',
    placeholder: 'E.g.: the correct birth date is February 22.',
    warning: 'Deliberately false reports can suspend the account.',
    cancel: 'Cancel',
    send: 'Send report',
    sent: 'We got your report. We will look into it, and the result will arrive in your notifications.',
    duplicate:
      'You have already reported this item, or reached the limit for it.',
    failed: 'Could not send. Try again.',
    reasons: {
      false_information: [
        'Wrong information',
        'A date, place, work or photo that does not match',
      ],
      inappropriate_content: ['Inappropriate content', 'Offensive or improper'],
      copyright_violation: [
        'Copyright',
        'Protected material used without permission',
      ],
      duplicate_content: ['Duplicate', 'Another page already exists for this'],
      spam: ['Spam', 'Repetitive or unrelated'],
      other: ['Other', 'Tell us what happened'],
    } as Record<string, [string, string]>,
  },
};

export const COMMON: Record<Idioma, typeof pt> = { pt, en };
export type CommonCopy = typeof pt;
