// app/utils/accountValidation.ts - Utility functions for account validation
import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(1, 'Email é obrigatório')
  .max(254, 'Email muito longo')
  .refine((email) => {
    // Additional email validation rules
    const domain = email.split('@')[1];

    // Block some common disposable email domains
    const disposableDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
      'yopmail.com',
    ];

    return !disposableDomains.includes(domain?.toLowerCase());
  }, 'Email temporário não é permitido');

// Password validation schema
export const passwordSchema = z
  .string()
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .max(128, 'Senha muito longa')
  .refine((password) => {
    // Check for at least one letter and one number
    return /^(?=.*[A-Za-z])(?=.*\d)/.test(password);
  }, 'Senha deve conter pelo menos uma letra e um número');

// User type validation
export const userTypeSchema = z.enum(
  ['MUSIC_STUDENT', 'CASUAL_USER', 'PROFESSIONAL', 'TEACHER'],
  {
    errorMap: () => ({ message: 'Tipo de usuário inválido' }),
  }
);

// Account validation utilities
export class AccountValidator {
  // Validate email format and rules
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    try {
      emailSchema.parse(email);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.errors[0]?.message };
      }
      return { isValid: false, error: 'Email inválido' };
    }
  }

  // Validate password strength
  static validatePassword(password: string): {
    isValid: boolean;
    error?: string;
    strength: 'weak' | 'medium' | 'strong';
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    try {
      passwordSchema.parse(password);

      // Calculate strength
      let score = 0;

      if (password.length >= 8) score += 1;
      if (password.length >= 12) score += 1;
      if (/[A-Z]/.test(password)) score += 1;
      if (/[a-z]/.test(password)) score += 1;
      if (/\d/.test(password)) score += 1;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

      if (score >= 5) strength = 'strong';
      else if (score >= 3) strength = 'medium';
      else strength = 'weak';

      // Generate suggestions
      if (password.length < 8) suggestions.push('Use pelo menos 8 caracteres');
      if (!/[A-Z]/.test(password))
        suggestions.push('Adicione letras maiúsculas');
      if (!/[a-z]/.test(password))
        suggestions.push('Adicione letras minúsculas');
      if (!/\d/.test(password)) suggestions.push('Adicione números');
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
        suggestions.push('Adicione símbolos especiais');

      return { isValid: true, strength, suggestions };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.errors[0]?.message,
          strength: 'weak',
          suggestions: [
            'Senha deve ter pelo menos 6 caracteres com letras e números',
          ],
        };
      }
      return {
        isValid: false,
        error: 'Senha inválida',
        strength: 'weak',
        suggestions: [],
      };
    }
  }

  // Validate user type
  static validateUserType(userType: string): {
    isValid: boolean;
    error?: string;
  } {
    try {
      userTypeSchema.parse(userType);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.errors[0]?.message };
      }
      return { isValid: false, error: 'Tipo de usuário inválido' };
    }
  }

  // Check if emails match
  static emailsMatch(email1: string, email2: string): boolean {
    return email1.toLowerCase().trim() === email2.toLowerCase().trim();
  }

  // Check if passwords match
  static passwordsMatch(password1: string, password2: string): boolean {
    return password1 === password2;
  }

  // Generate random secure password
  static generateSecurePassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*(),.?":{}|<>';

    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';

    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  // Sanitize email
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  // Check if user type change is allowed
  static canChangeUserType(
    currentType: string,
    newType: string,
    accountAge: number
  ): {
    canChange: boolean;
    reason?: string;
  } {
    // Allow change if account is older than 7 days
    if (accountAge < 7) {
      return {
        canChange: false,
        reason: 'Conta deve ter pelo menos 7 dias para alterar o tipo',
      };
    }

    // Don't allow same type
    if (currentType === newType) {
      return {
        canChange: false,
        reason: 'Este já é seu tipo de conta atual',
      };
    }

    return { canChange: true };
  }

  // Get user type description
  static getUserTypeDescription(userType: string): {
    label: string;
    description: string;
    features: string[];
  } {
    switch (userType) {
      case 'MUSIC_STUDENT':
        return {
          label: 'Estudante de Música',
          description:
            'Para estudantes que estão aprendendo música formalmente',
          features: [
            'Foco em materiais didáticos',
            'Ferramentas de estudo avançadas',
            'Progresso de aprendizado',
            'Recursos para prática',
          ],
        };
      case 'CASUAL_USER':
        return {
          label: 'Entusiasta',
          description: 'Para amantes da música clássica como hobby',
          features: [
            'Exploração livre do catálogo',
            'Descoberta de novas obras',
            'Listas de favoritos',
            'Experiência simplificada',
          ],
        };
      case 'PROFESSIONAL':
        return {
          label: 'Profissional',
          description: 'Para músicos e intérpretes profissionais',
          features: [
            'Partituras de alta qualidade',
            'Ferramentas de performance',
            'Análise musical avançada',
            'Recursos para concertos',
          ],
        };
      case 'TEACHER':
        return {
          label: 'Professor',
          description: 'Para educadores e instrutores musicais',
          features: [
            'Materiais didáticos',
            'Recursos para ensino',
            'Organização de repertório',
            'Ferramentas pedagógicas',
          ],
        };
      default:
        return {
          label: 'Não definido',
          description: 'Tipo de conta não especificado',
          features: [],
        };
    }
  }

  // Rate limiting check for sensitive operations
  static checkRateLimit(
    lastAttempt: Date | null,
    maxAttempts: number,
    windowMinutes: number
  ): {
    allowed: boolean;
    resetTime?: Date;
    attemptsRemaining?: number;
  } {
    if (!lastAttempt) {
      return { allowed: true, attemptsRemaining: maxAttempts - 1 };
    }

    const now = new Date();
    const windowMs = windowMinutes * 60 * 1000;
    const timeSinceLastAttempt = now.getTime() - lastAttempt.getTime();

    if (timeSinceLastAttempt > windowMs) {
      return { allowed: true, attemptsRemaining: maxAttempts - 1 };
    }

    const resetTime = new Date(lastAttempt.getTime() + windowMs);
    return {
      allowed: false,
      resetTime,
      attemptsRemaining: 0,
    };
  }
}

// Types for form validation
export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
  strength: 'weak' | 'medium' | 'strong';
  suggestions: string[];
}

export const UserTypeValues = [
  'MUSIC_STUDENT',
  'CASUAL_USER',
  'PROFESSIONAL',
  'TEACHER',
];

export interface UserTypeInfo {
  value: 'MUSIC_STUDENT' | 'CASUAL_USER' | 'PROFESSIONAL' | 'TEACHER';
  description: string;
  label: string;
}
export type UserTypeValueOptions =
  | 'MUSIC_STUDENT'
  | 'CASUAL_USER'
  | 'PROFESSIONAL'
  | 'TEACHER';

// Constants
export const USER_TYPE_OPTIONS: UserTypeInfo[] = [
  {
    value: 'MUSIC_STUDENT',
    label: 'Estudante de Música',
    description: 'Focado em aprendizado formal',
  },
  {
    value: 'CASUAL_USER',
    label: 'Entusiasta',
    description: 'Aprecia música como hobby',
  },
  {
    value: 'PROFESSIONAL',
    label: 'Profissional',
    description: 'Músico ou intérprete profissional',
  },
  {
    value: 'TEACHER',
    label: 'Professor',
    description: 'Educador musical',
  },
];

export const PASSWORD_STRENGTH_COLORS = {
  weak: 'text-accent-red',
  medium: 'text-accent-amber',
  strong: 'text-accent-green',
};

export const PASSWORD_STRENGTH_LABELS = {
  weak: 'Fraca',
  medium: 'Média',
  strong: 'Forte',
};
