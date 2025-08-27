// app/libs/tokenUtils.ts - VERSÃO CORRIGIDA
import crypto from 'crypto';
import prisma from './prismadb';

export type TokenType =
  | 'EMAIL_CONFIRMATION'
  | 'PASSWORD_RESET'
  | 'NEWSLETTER_CONFIRMATION'
  | 'EMAIL_CHANGE'
  | 'TEACHER_INVITATION_ACCEPT'
  | 'TEACHER_INVITATION_DECLINE'
  | 'STUDENT_INVITATION_ACCEPT'
  | 'STUDENT_INVITATION_DECLINE'
  | 'STUDENT_INVITATION'
  | 'NEWSLETTER_UNSUBSCRIBE';

interface CreateTokenOptions {
  userId?: string; // 🆕 OPCIONAL agora
  type: TokenType;
  expiresInHours?: number;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  anonymousEmail?: string; // 🆕 Para tokens anônimos (newsletter)
}

interface TokenValidationResult {
  valid: boolean;
  token?: any;
  error?: string;
  expired?: boolean;
  used?: boolean;
}

/**
 * Gerar token criptograficamente seguro
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Criar token no banco de dados
 */
export async function createToken(
  options: CreateTokenOptions
): Promise<string> {
  const {
    userId,
    type,
    expiresInHours = 24,
    metadata,
    ipAddress,
    userAgent,
    anonymousEmail,
  } = options;

  // Gerar token único
  const token = generateSecureToken();

  // Calcular data de expiração
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  // 🆕 INVALIDAR TOKENS ANTIGOS - Só se tiver userId
  if (userId) {
    await prisma.userToken.updateMany({
      where: {
        userId,
        type: type as any,
        used: false,
      },
      data: {
        used: true,
      },
    });
  } else if (anonymousEmail && type === 'NEWSLETTER_CONFIRMATION') {
    // 🆕 Para tokens anônimos de newsletter, invalidar por email
    await prisma.userToken.updateMany({
      where: {
        anonymousEmail,
        type: type as any,
        used: false,
      },
      data: {
        used: true,
      },
    });
  }

  // Criar novo token
  await prisma.userToken.create({
    data: {
      userId: userId || undefined, // 🆕 undefined se não tiver userId
      type: type as any,
      token,
      expiresAt,
      metadata: metadata || {},
      ipAddress,
      userAgent,
      anonymousEmail, // 🆕 Email anônimo se fornecido
    },
  });

  return token;
}

/**
 * Validar token
 */
export async function validateToken(
  token: string,
  type: TokenType
): Promise<TokenValidationResult> {
  try {
    // Buscar token no banco
    const tokenRecord = await prisma.userToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Token não encontrado
    if (!tokenRecord) {
      return {
        valid: false,
        error: 'Token inválido',
      };
    }

    // Verificar tipo
    if (tokenRecord.type !== type) {
      return {
        valid: false,
        error: 'Tipo de token incorreto',
      };
    }

    // Token já usado
    if (tokenRecord.used) {
      return {
        valid: false,
        used: true,
        error: 'Token já foi utilizado',
      };
    }

    // Token expirado
    if (new Date() > tokenRecord.expiresAt) {
      return {
        valid: false,
        expired: true,
        error: 'Token expirado',
      };
    }

    return {
      valid: true,
      token: tokenRecord,
    };
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return {
      valid: false,
      error: 'Erro interno',
    };
  }
}

/**
 * Marcar token como usado
 */
export async function markTokenAsUsed(token: string): Promise<void> {
  await prisma.userToken.update({
    where: { token },
    data: { used: true },
  });
}

/**
 * Limpar tokens expirados (função de limpeza)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.userToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}

/**
 * 🆕 ATUALIZADO: Revogar todos os tokens de um usuário (com suporte a anônimos)
 */
export async function revokeAllUserTokens(
  userId?: string,
  type?: TokenType,
  anonymousEmail?: string
): Promise<number> {
  const where: any = {
    used: false,
  };

  // Se tem userId, buscar por userId
  if (userId) {
    where.userId = userId;
  }
  // Se não tem userId mas tem email anônimo, buscar por email
  else if (anonymousEmail) {
    where.anonymousEmail = anonymousEmail;
  }
  // Se não tem nenhum dos dois, não fazer nada
  else {
    return 0;
  }

  if (type) {
    where.type = type;
  }

  const result = await prisma.userToken.updateMany({
    where,
    data: { used: true },
  });

  return result.count;
}

/**
 * Obter estatísticas de tokens
 */
export async function getTokenStats() {
  const [total, used, expired, active] = await Promise.all([
    prisma.userToken.count(),
    prisma.userToken.count({ where: { used: true } }),
    prisma.userToken.count({
      where: { expiresAt: { lt: new Date() } },
    }),
    prisma.userToken.count({
      where: {
        used: false,
        expiresAt: { gte: new Date() },
      },
    }),
  ]);

  return {
    total,
    used,
    expired,
    active,
  };
}

/**
 * Configurações específicas por tipo de token
 */
export const TOKEN_CONFIG = {
  EMAIL_CONFIRMATION: {
    expiresInHours: 24,
    description: 'Confirmação de email da conta',
  },
  PASSWORD_RESET: {
    expiresInHours: 1,
    description: 'Reset de senha',
  },
  NEWSLETTER_CONFIRMATION: {
    expiresInHours: 48,
    description: 'Confirmação de inscrição na newsletter',
  },
  EMAIL_CHANGE: {
    expiresInHours: 48,
    description: 'Confirmação de mudança de Email',
  },
  TEACHER_INVITATION_ACCEPT: {
    expiresInHours: 48,
    description: 'Confirmação de convite para professor',
  },
  TEACHER_INVITATION_DECLINE: {
    expiresInHours: 48,
    description: 'Declinio de convite para professor',
  },
  STUDENT_INVITATION_ACCEPT: {
    expiresInHours: 48,
    description: 'Confirmação de convite para aluno',
  },

  STUDENT_INVITATION_DECLINE: {
    expiresInHours: 48,
    description: 'Declinio de convite para aluno',
  },
  STUDENT_INVITATION: {
    expiresInHours: 48,
    description: 'Convite para aluno.',
  },
  NEWSLETTER_UNSUBSCRIBE: {
    expiresInHours: 72,
    description: 'Cancelamento de newsletter.',
  },
} as const;

/**
 * Obter configuração do token por tipo
 */
export function getTokenConfig(type: TokenType) {
  return TOKEN_CONFIG[type];
}

/**
 * Criar URL de confirmação/reset
 */
export function createTokenUrl(
  baseUrl: string,
  path: string,
  token: string
): string {
  // Remove trailing slash do baseUrl se existir
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  // Remove leading slash do path se existir
  const cleanPath = path.replace(/^\//, '');

  return `${cleanBaseUrl}/${cleanPath}/${token}`;
}

/**
 * Validar força de senha (para reset)
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  let score = 0;

  // Comprimento mínimo
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  } else {
    score += 1;
  }

  // Letra minúscula
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  } else {
    score += 1;
  }

  // Letra maiúscula
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  } else {
    score += 1;
  }

  // Número
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  } else {
    score += 1;
  }

  // Símbolo especial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Senha deve conter pelo menos um símbolo especial');
  } else {
    score += 1;
  }

  // Comprimento extra (bonus)
  if (password.length >= 12) {
    score += 1;
  }

  return {
    valid: errors.length === 0,
    errors,
    score,
  };
}

/**
 * 🆕 ATUALIZADO: Rate limiting para criação de tokens (com suporte a anônimos)
 */
export async function checkTokenRateLimit(
  userIdOrEmail: string,
  type: TokenType,
  maxTokensPerHour: number = 3,
  isAnonymous: boolean = false
): Promise<{ allowed: boolean; remainingAttempts: number }> {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const where: any = {
    type: type as any,
    createdAt: {
      gte: oneHourAgo,
    },
  };

  // Se é anônimo, buscar por email
  if (isAnonymous) {
    where.anonymousEmail = userIdOrEmail;
  } else {
    where.userId = userIdOrEmail;
  }

  const recentTokens = await prisma.userToken.count({ where });

  const remainingAttempts = Math.max(0, maxTokensPerHour - recentTokens);

  return {
    allowed: recentTokens < maxTokensPerHour,
    remainingAttempts,
  };
}

/**
 * Utilitários para logging de segurança
 */
export function logSecurityEvent(
  event: string,
  userId: string,
  details: Record<string, any>
) {
  // Log de segurança (implementar conforme necessário)
  console.log(`[SECURITY] ${event}:`, {
    userId,
    timestamp: new Date().toISOString(),
    ...details,
  });
}
