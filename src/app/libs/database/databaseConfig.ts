// app/libs/database/databaseConfig.ts

/**
 * Configuração de segurança e permissões para campos do banco de dados
 */

export interface FieldSecurityConfig {
  sensitiveFields: string[]; // Campos que não devem ser exibidos
  nonEditableFields: string[]; // Campos que não podem ser editados
  requireConfirmation: string[]; // Campos que exigem confirmação para editar
}

export interface ModelSecurityConfig {
  [modelName: string]: FieldSecurityConfig;
}

/**
 * Configuração de segurança por modelo
 * ÚNICO LUGAR QUE PRECISA SER EDITADO MANUALMENTE
 */
export const DATABASE_SECURITY_CONFIG: ModelSecurityConfig = {
  // ===== USER =====
  User: {
    sensitiveFields: ['hashedPassword'],
    nonEditableFields: [
      'id',
      'createdAt',
      'updatedAt',
      'emailVerified',
      'lastSeen',
    ],
    requireConfirmation: ['email', 'role', 'isTeacher', 'isStudent'],
  },

  // ===== ACCOUNT =====
  Account: {
    sensitiveFields: [
      'refresh_token',
      'access_token',
      'id_token',
      'session_state',
    ],
    nonEditableFields: [
      'id',
      'userId',
      'provider',
      'providerAccountId',
      'type',
    ],
    requireConfirmation: [],
  },

  // ===== SESSION =====
  Session: {
    sensitiveFields: ['sessionToken'],
    nonEditableFields: ['id', 'userId', 'sessionToken'],
    requireConfirmation: [],
  },

  // Adicione mais modelos conforme necessário...
};

/**
 * Obtém a configuração de segurança para um modelo
 */
export function getModelSecurityConfig(modelName: string): FieldSecurityConfig {
  return (
    DATABASE_SECURITY_CONFIG[modelName] || {
      sensitiveFields: [],
      nonEditableFields: ['id', 'createdAt', 'updatedAt'],
      requireConfirmation: [],
    }
  );
}

/**
 * Verifica se um campo é sensível
 */
export function isFieldSensitive(
  modelName: string,
  fieldName: string
): boolean {
  const config = getModelSecurityConfig(modelName);
  return config.sensitiveFields.includes(fieldName);
}

/**
 * Verifica se um campo pode ser editado
 */
export function isFieldEditableByConfig(
  modelName: string,
  fieldName: string
): boolean {
  const config = getModelSecurityConfig(modelName);
  return !config.nonEditableFields.includes(fieldName);
}

/**
 * Verifica se um campo exige confirmação para edição
 */
export function doesFieldRequireConfirmation(
  modelName: string,
  fieldName: string
): boolean {
  const config = getModelSecurityConfig(modelName);
  return config.requireConfirmation.includes(fieldName);
}

/**
 * Palavra-chave de confirmação para operações críticas
 */
export const CONFIRMATION_KEYWORD = 'CONFIRMAR';

/**
 * Mensagens de confirmação por tipo de operação
 */
export const CONFIRMATION_MESSAGES = {
  delete: {
    title: 'Confirmar Exclusão',
    message:
      'Esta ação é IRREVERSÍVEL. Todos os dados relacionados podem ser perdidos.',
    keyword: CONFIRMATION_KEYWORD,
    placeholder: `Digite "${CONFIRMATION_KEYWORD}" para confirmar`,
  },
  deleteMultiple: {
    title: 'Confirmar Exclusão Múltipla',
    message: (count: number) =>
      `Você está prestes a DELETAR ${count} registro(s). Esta ação é IRREVERSÍVEL.`,
    keyword: CONFIRMATION_KEYWORD,
    placeholder: `Digite "${CONFIRMATION_KEYWORD}" para confirmar`,
  },
  updateCritical: {
    title: 'Confirmar Alteração Crítica',
    message: (fields: string[]) =>
      `Você está alterando campo(s) crítico(s): ${fields.join(', ')}. Confirme para continuar.`,
    keyword: CONFIRMATION_KEYWORD,
    placeholder: `Digite "${CONFIRMATION_KEYWORD}" para confirmar`,
  },
};
