import type { Idioma } from '../legal/tipos';

export type Assunto = 'suporte' | 'bug' | 'moderacao' | 'parceria';

/**
 * The contact page. Only channels that exist. Response time (owner, 21/10):
 * up to 1 business day on paid plans (priority support, from Plus on), up to
 * 3 on Free.
 */
const pt = {
  titulo: 'Fale com a gente',
  abertura:
    'Uma dúvida, um erro que você encontrou, algo no acervo que precisa de atenção ou uma ideia de parceria. Escreva, e a resposta chega no seu e-mail: em até 1 dia útil para quem assina (suporte prioritário, do Plus em diante) e em até 3 dias úteis no plano grátis.',
  sobre: 'Sobre o quê?',
  assuntos: {
    suporte: {
      nome: 'Dúvida ou conta',
      texto: 'Como algo funciona, sua conta, sua assinatura.',
      assunto: 'Dúvida sobre o Opus Atlas',
    },
    bug: {
      nome: 'Algo não funcionou',
      texto: 'Uma tela com erro, um botão que não responde.',
      assunto: 'Encontrei um erro',
    },
    moderacao: {
      nome: 'Acervo e moderação',
      texto: 'Um envio, uma correção, uma denúncia que você fez.',
      assunto: 'Sobre o acervo',
    },
    parceria: {
      nome: 'Parcerias',
      texto: 'Escolas, conservatórios, orquestras, projetos.',
      assunto: 'Proposta de parceria',
    },
  } satisfies Record<Assunto, { nome: string; texto: string; assunto: string }>,
  nome: 'Seu nome',
  email: 'Seu e-mail',
  assunto: 'Assunto',
  mensagem: 'Mensagem',
  mensagemDica: {
    suporte: 'Conte o que você queria fazer e onde parou.',
    bug: 'Diga em que página estava, o que fez e o que apareceu. Se puder, o aparelho e o navegador.',
    moderacao: 'Diga qual compositor, obra ou envio, e o que precisa mudar.',
    parceria: 'Conte quem vocês são e o que imaginam fazer juntos.',
  } satisfies Record<Assunto, string>,
  newsletter: 'Quero receber a newsletter',
  enviar: 'Enviar mensagem',
  obrigatorio: 'Preencha este campo.',
  emailInvalido: 'Confira o e-mail.',
  curta: 'Escreva um pouco mais (pelo menos 10 caracteres).',
  enviadoTitulo: 'Mensagem enviada',
  enviadoTexto: (email: string) =>
    `A resposta vai para ${email}. Se não aparecer, olhe também a caixa de spam.`,
  protocolo: (id: string) => `Protocolo ${id}`,
  outra: 'Escrever outra mensagem',
  canais: 'Também por e-mail',
  canalContato: 'Geral',
  canalSuporte: 'Suporte',
  canalPrivacidade: 'Dados pessoais (LGPD)',
  antes: 'Antes de escrever',
  ajuda: 'Central de ajuda',
  faq: 'Perguntas frequentes',
};

const en: typeof pt = {
  titulo: 'Get in touch',
  abertura:
    'A question, a bug you found, something in the catalog that needs attention or a partnership idea. Write to us, and the answer arrives in your inbox: within 1 business day for subscribers (priority support, from Plus on) and within 3 business days on the free plan.',
  sobre: 'What is it about?',
  assuntos: {
    suporte: {
      nome: 'Question or account',
      texto: 'How something works, your account, your subscription.',
      assunto: 'Question about Opus Atlas',
    },
    bug: {
      nome: 'Something broke',
      texto: 'A screen with an error, a button that does nothing.',
      assunto: 'I found a bug',
    },
    moderacao: {
      nome: 'Catalog and moderation',
      texto: 'An upload, a correction, a report you made.',
      assunto: 'About the catalog',
    },
    parceria: {
      nome: 'Partnerships',
      texto: 'Schools, conservatories, orchestras, projects.',
      assunto: 'Partnership proposal',
    },
  },
  nome: 'Your name',
  email: 'Your email',
  assunto: 'Subject',
  mensagem: 'Message',
  mensagemDica: {
    suporte: 'Tell us what you wanted to do and where you got stuck.',
    bug: 'Say which page you were on, what you did and what appeared. If you can, the device and browser.',
    moderacao: 'Say which composer, work or upload, and what needs to change.',
    parceria: 'Tell us who you are and what you imagine doing together.',
  },
  newsletter: 'Send me the newsletter',
  enviar: 'Send message',
  obrigatorio: 'Fill in this field.',
  emailInvalido: 'Check the email.',
  curta: 'Write a little more (at least 10 characters).',
  enviadoTitulo: 'Message sent',
  enviadoTexto: (email: string) =>
    `The answer goes to ${email}. If it does not show up, check your spam folder too.`,
  protocolo: (id: string) => `Ticket ${id}`,
  outra: 'Write another message',
  canais: 'Also by email',
  canalContato: 'General',
  canalSuporte: 'Support',
  canalPrivacidade: 'Personal data (LGPD)',
  antes: 'Before you write',
  ajuda: 'Help center',
  faq: 'Frequently asked questions',
};

export const CONTACT: Record<Idioma, typeof pt> = { pt, en };
