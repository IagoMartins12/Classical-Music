// app/hooks/usePasswordReset.ts
import { useState, useCallback } from 'react';

interface PasswordResetState {
  loading: boolean;
  success: boolean;
  error: string | null;
  remainingAttempts?: number;
  tokenValid?: boolean;
  tokenData?: {
    email: string;
    firstName: string;
    expiresAt: string;
    minutesLeft: number;
  };
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

interface PasswordValidation {
  valid: boolean;
  errors: string[];
  score: number;
}

export const usePasswordReset = () => {
  const [state, setState] = useState<PasswordResetState>({
    loading: false,
    success: false,
    error: null,
  });

  // Solicitar reset de senha
  const requestReset = useCallback(async (data: ForgotPasswordData) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }));

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setState((prev) => ({
          ...prev,
          loading: false,
          success: true,
          remainingAttempts: result.remainingAttempts,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.error || 'Erro ao processar solicitação',
          remainingAttempts: result.remainingAttempts,
        }));
      }

      return result;
    } catch (error) {
      const errorMessage = 'Erro de conexão. Tente novamente.';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  }, []);

  // Validar token de reset
  const validateResetToken = useCallback(async (token: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`/api/auth/reset-password?token=${token}`);
      const result = await response.json();

      if (result.valid) {
        setState((prev) => ({
          ...prev,
          loading: false,
          tokenValid: true,
          tokenData: result.user
            ? {
                email: result.user.email,
                firstName: result.user.firstName,
                expiresAt: result.expiresAt,
                minutesLeft: result.minutesLeft,
              }
            : undefined,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          tokenValid: false,
          error: result.error || 'Token inválido',
        }));
      }

      return result;
    } catch (error) {
      const errorMessage = 'Erro ao validar token';
      setState((prev) => ({
        ...prev,
        loading: false,
        tokenValid: false,
        error: errorMessage,
      }));

      return { valid: false, error: errorMessage };
    }
  }, []);

  // Processar reset de senha
  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }));

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setState((prev) => ({
          ...prev,
          loading: false,
          success: true,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.error || 'Erro ao redefinir senha',
        }));
      }

      return result;
    } catch (error) {
      const errorMessage = 'Erro de conexão. Tente novamente.';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  }, []);

  // Validar força da senha no frontend
  const validatePasswordStrength = useCallback(
    (password: string): PasswordValidation => {
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
    },
    []
  );

  // Obter cor da força da senha
  const getPasswordStrengthColor = useCallback((score: number): string => {
    if (score <= 2) return 'text-accent-red';
    if (score <= 3) return 'text-accent-amber';
    if (score <= 4) return 'text-accent-blue';
    return 'text-accent-green';
  }, []);

  // Obter texto da força da senha
  const getPasswordStrengthText = useCallback((score: number): string => {
    if (score <= 2) return 'Fraca';
    if (score <= 3) return 'Média';
    if (score <= 4) return 'Boa';
    return 'Forte';
  }, []);

  // Reset do estado
  const reset = useCallback(() => {
    setState({
      loading: false,
      success: false,
      error: null,
    });
  }, []);

  return {
    // Estado
    loading: state.loading,
    success: state.success,
    error: state.error,
    remainingAttempts: state.remainingAttempts,
    tokenValid: state.tokenValid,
    tokenData: state.tokenData,

    // Ações
    requestReset,
    validateResetToken,
    resetPassword,
    validatePasswordStrength,
    reset,

    // Utilitários
    getPasswordStrengthColor,
    getPasswordStrengthText,
  };
};

// Hook separado para gerenciar estado do formulário de reset
export const useResetPasswordForm = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormData({ password: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const validateForm = useCallback((): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.password) {
      errors.push('Senha é obrigatória');
    }

    if (!formData.confirmPassword) {
      errors.push('Confirmação de senha é obrigatória');
    }

    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      errors.push('Senhas não coincidem');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }, [formData]);

  return {
    formData,
    showPassword,
    showConfirmPassword,
    updateField,
    setShowPassword,
    setShowConfirmPassword,
    resetForm,
    validateForm,
  };
};
