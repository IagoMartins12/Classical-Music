import type { Idioma } from '../legal/tipos';

/** Copy for the page that asks to confirm the email before contributing. */
const pt = {
  eyebrow: 'Falta um passo',
  title: 'Confirme seu e-mail para enviar ao acervo',
  text: 'Compositores, obras e partituras novas só entram por contas confirmadas. Assim cada envio tem alguém por trás.',
  sentTo: 'O link vai para',
  send: 'Enviar o link de confirmação',
  resend: 'Enviar de novo',
  sent: 'Link enviado. Ele vale por 24 horas.',
  confirmed: 'Já confirmei',
  home: 'Voltar ao início',
  now: 'Enquanto isso, você pode',
  nowItems: [
    'Ouvir e ler sobre compositores e obras',
    'Baixar as partituras do acervo',
    'Montar sua estante de estudos',
  ],
  after: 'Depois de confirmar',
  afterItems: [
    'Enviar compositores, obras e partituras',
    'Ganhar XP pelas contribuições aprovadas',
  ],
  help: 'O e-mail não chegou?',
  helpItems: [
    'Olhe a caixa de spam e a aba de promoções.',
    'Pode levar alguns minutos.',
    'Abra o link no mesmo navegador em que entrou.',
  ],
  contact: 'Ainda nada? Fale com a gente',
};

const en: typeof pt = {
  eyebrow: 'One step left',
  title: 'Confirm your email to contribute to the catalog',
  text: 'New composers, works and scores only come from confirmed accounts, so every contribution has someone behind it.',
  sentTo: 'The link goes to',
  send: 'Send the confirmation link',
  resend: 'Send again',
  sent: 'Link sent. It is valid for 24 hours.',
  confirmed: 'I’ve confirmed it',
  home: 'Back to home',
  now: 'Meanwhile, you can',
  nowItems: [
    'Listen to and read about composers and works',
    'Download the catalog’s scores',
    'Build your study shelf',
  ],
  after: 'Once confirmed',
  afterItems: [
    'Contribute composers, works and scores',
    'Earn XP for approved contributions',
  ],
  help: 'No email yet?',
  helpItems: [
    'Check the spam folder and the promotions tab.',
    'It can take a few minutes.',
    'Open the link in the same browser you signed in with.',
  ],
  contact: 'Still nothing? Talk to us',
};

export const EMAIL_VERIFICATION: Record<Idioma, typeof pt> = { pt, en };
