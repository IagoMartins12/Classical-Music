import type { Idioma } from '../legal/tipos';

/**
 * Copy for the site footer. Bundled, like the header's: the footer paints on
 * every page, and fetching `/translations/components/footer.json` showed the
 * raw keys until it arrived.
 */
const pt = {
  label: 'Rodapé',
  home: 'Opus Atlas, início',
  tagline:
    'O atlas da música erudita: compositores, obras, partituras e gravações, e o estudo de quem toca.',
  columns: {
    explore: {
      title: 'Explorar',
      links: {
        history: 'História da música',
        composers: 'Compositores',
        works: 'Obras',
        instruments: 'Instrumentos',
        blog: 'Blog',
      },
    },
    atlas: {
      title: 'Opus Atlas',
      links: {
        about: 'Sobre',
        plans: 'Planos',
        teachers: 'Para professores',
        app: 'Instalar o app',
      },
    },
    help: {
      title: 'Ajuda',
      links: {
        help: 'Central de ajuda',
        faq: 'Perguntas frequentes',
        contact: 'Contato',
        support: 'Suporte técnico',
      },
    },
    legal: {
      title: 'Legal',
      links: {
        terms: 'Termos de uso',
        privacy: 'Privacidade',
        copyright: 'Direitos autorais',
      },
    },
  },
  newsletter: {
    title: 'A newsletter do Opus Atlas',
    text: 'Repertório para descobrir, compositores e as leituras do blog, no seu e-mail.',
    email: 'Seu e-mail',
    submit: 'Inscrever',
    invalid: 'Confira o e-mail.',
    consent: 'Ao se inscrever, você concorda com a',
    privacy: 'Política de privacidade',
    leave: 'Dá para sair quando quiser.',
    done: 'Inscrição feita.',
    welcomeBack: 'Que bom ter você de volta.',
    confirm: 'Confira seu e-mail para confirmar a inscrição.',
    resent: 'Enviamos a confirmação de novo.',
    another: 'Inscrever outro e-mail',
    resend: 'Reenviar a confirmação',
    errors: {
      ALREADY_SUBSCRIBED: 'Este e-mail já recebe a newsletter.',
      PENDING_CONFIRMATION:
        'Falta confirmar este e-mail. Confira sua caixa de entrada.',
      EMAIL_BOUNCED: 'Não conseguimos entregar neste e-mail. Use outro.',
      EMAIL_BLOCKED: 'Este e-mail não pode receber a newsletter.',
      CONNECTION_ERROR: 'Sem conexão com o Opus Atlas. Tente em instantes.',
      UNKNOWN: 'Não foi possível inscrever agora. Tente em instantes.',
    },
  },
  follow: 'Siga o Opus Atlas',
  rights: 'Opus Atlas. Todos os direitos reservados.',
  madeWith: ['Feito com', 'para a música clássica'],
};

const en: typeof pt = {
  label: 'Footer',
  home: 'Opus Atlas, home',
  tagline:
    'The atlas of classical music: composers, works, scores and recordings, and the practice of those who play.',
  columns: {
    explore: {
      title: 'Explore',
      links: {
        history: 'Music history',
        composers: 'Composers',
        works: 'Works',
        instruments: 'Instruments',
        blog: 'Blog',
      },
    },
    atlas: {
      title: 'Opus Atlas',
      links: {
        about: 'About',
        plans: 'Plans',
        teachers: 'For teachers',
        app: 'Install the app',
      },
    },
    help: {
      title: 'Help',
      links: {
        help: 'Help center',
        faq: 'FAQ',
        contact: 'Contact',
        support: 'Technical support',
      },
    },
    legal: {
      title: 'Legal',
      links: {
        terms: 'Terms of use',
        privacy: 'Privacy',
        copyright: 'Copyright',
      },
    },
  },
  newsletter: {
    title: 'The Opus Atlas newsletter',
    text: 'Repertoire to discover, composers and the blog’s reads, in your inbox.',
    email: 'Your email',
    submit: 'Subscribe',
    invalid: 'Check the email.',
    consent: 'By subscribing, you agree to the',
    privacy: 'Privacy policy',
    leave: 'You can leave anytime.',
    done: 'You’re subscribed.',
    welcomeBack: 'Good to have you back.',
    confirm: 'Check your inbox to confirm the subscription.',
    resent: 'We sent the confirmation again.',
    another: 'Subscribe another email',
    resend: 'Resend the confirmation',
    errors: {
      ALREADY_SUBSCRIBED: 'This email already gets the newsletter.',
      PENDING_CONFIRMATION:
        'This email still needs confirming. Check your inbox.',
      EMAIL_BOUNCED: 'We couldn’t deliver to this email. Use another one.',
      EMAIL_BLOCKED: 'This email can’t receive the newsletter.',
      CONNECTION_ERROR: 'No connection to Opus Atlas. Try again shortly.',
      UNKNOWN: 'Couldn’t subscribe right now. Try again shortly.',
    },
  },
  follow: 'Follow Opus Atlas',
  rights: 'Opus Atlas. All rights reserved.',
  madeWith: ['Made with', 'for classical music'],
};

export const FOOTER: Record<Idioma, typeof pt> = { pt, en };

export type FooterCopy = typeof pt;
