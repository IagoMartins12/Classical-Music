/**
 * Os canais de contato do Opus Atlas — **a única fonte** de e-mail e telefone
 * do front. Página, rodapé, modal, fatura e modelo de e-mail importam daqui;
 * ninguém escreve um endereço à mão.
 *
 * Hoje um único endereço responde por tudo. Quando cada assunto ganhar o seu,
 * basta trocar o valor aqui: as chaves já separam os assuntos.
 */
export const CONTATO = {
  /** Fale-conosco geral. */
  contato: 'contato@opusatlas.com.br',
  /** Dúvida de uso, problema técnico, conta. */
  suporte: 'suporte@opusatlas.com.br',
  /** Dados pessoais e LGPD — o canal do encarregado de dados. */
  privacidade: 'privacidade@opusatlas.com.br',
  /** Notificação de violação de direito autoral. */
  direitosAutorais: 'direitos@opusatlas.com.br',
  /** Remetente dos e-mails automáticos (não recebe resposta). */
  semResposta: 'noreply@opusatlas.com',
  /**
   * Telefone público. `null` enquanto não houver um número de atendimento:
   * quem mostra telefone confere antes e some com a linha.
   */
  telefone: null as string | null,
  /** Cidade exibida no rodapé e no contato. */
  cidade: 'São Paulo, SP, Brasil',
} as const;

export type CanalDeContato = keyof typeof CONTATO;

/** `mailto:` pronto para um dos canais. */
export const mailto = (
  canal: 'contato' | 'suporte' | 'privacidade' | 'direitosAutorais',
  assunto?: string
) =>
  `mailto:${CONTATO[canal]}${assunto ? `?subject=${encodeURIComponent(assunto)}` : ''}`;

/** As redes do Opus Atlas — rodapé e dados estruturados leem daqui. */
export const REDES = {
  instagram: 'https://www.instagram.com/opusatlas/',
  x: 'https://x.com/Opus_Atlas',
  linkedin: 'https://www.linkedin.com/company/opus-atlas/about/',
  tiktok: 'https://www.tiktok.com/@opusatlas5',
} as const;
