// app/libs/tokenUtils.ts
import crypto from 'crypto';
import prisma from './prismadb';

export type TokenType =
  | 'EMAIL_CONFIRMATION'
  | 'PASSWORD_RESET'
  | 'NEWSLETTER_CONFIRMATION';

interface CreateTokenOptions {
  userId: string;
  type: TokenType;
  expiresInHours?: number;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
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
  } = options;

  // Gerar token único
  const token = generateSecureToken();

  // Calcular data de expiração
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  // Invalidar tokens antigos do mesmo tipo para o usuário
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

  // Criar novo token
  await prisma.userToken.create({
    data: {
      userId,
      type: type as any,
      token,
      expiresAt,
      metadata: metadata || {},
      ipAddress,
      userAgent,
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
 * Revogar todos os tokens de um usuário (útil para logout global)
 */
export async function revokeAllUserTokens(
  userId: string,
  type?: TokenType
): Promise<number> {
  const where: any = {
    userId,
    used: false,
  };

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
 * Rate limiting para criação de tokens (prevenir spam)
 */
export async function checkTokenRateLimit(
  userId: string,
  type: TokenType,
  maxTokensPerHour: number = 3
): Promise<{ allowed: boolean; remainingAttempts: number }> {
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const recentTokens = await prisma.userToken.count({
    where: {
      userId,
      type: type as any,
      createdAt: {
        gte: oneHourAgo,
      },
    },
  });

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

/**
 * Verificar se IP está em blacklist (implementar conforme necessário)
 */
