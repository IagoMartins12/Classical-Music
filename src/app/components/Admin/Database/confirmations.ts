/**
 * Os textos de confirmação do estúdio de banco do painel.
 *
 * Moravam em `libs/database/databaseConfig.ts`, ao lado do acesso direto ao
 * MongoDB que o front fazia — e saíram junto com ele na Etapa 7. São texto de
 * interface, não configuração de banco: o lugar é aqui, perto de quem os
 * desenha.
 *
 * A frase que a **API** exige para apagar é outra e continua em
 * `requests/admin/database.ts` (`deleteConfirmationPhrase`): esta é só a
 * palavra que a tela pede para digitar antes de uma alteração crítica.
 */
export const CONFIRMATION_KEYWORD = 'CONFIRMAR';

export const CONFIRMATION_MESSAGES = {
  delete: {
    title: 'Confirmar exclusão',
    message:
      'Este registro será apagado do banco. A ação não pode ser desfeita.',
  },
  deleteMultiple: {
    title: 'Confirmar exclusão em lote',
    message: (quantidade: number) =>
      `${quantidade} registro(s) serão apagados do banco. A ação não pode ser desfeita.`,
  },
} as const;
