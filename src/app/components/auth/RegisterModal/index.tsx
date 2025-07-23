// components/auth/RegisterModal.tsx - VERSÃO COM LOGIN AUTOMÁTICO
'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import {
  FiMail,
  FiLock,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiAlertTriangle,
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { GiGrandPiano } from 'react-icons/gi';

import { registerUser } from '@/app/actions/auth';
import { toast } from 'react-hot-toast';
import { useOnboardingModal, useRegisterModal } from '@/app/stores/authStore';
import Modal from '../../Modal';
import Button from '../../Common/Button';
import Input from '../../Common/Inputs';

interface RegisterStep {
  step: 'form' | 'success' | 'confirmation-sent';
  userData?: {
    firstName?: string;
    email?: string;
    isLoggedIn?: boolean; // 🆕 NOVO: Indicar se já fez login automático
  };
}

const RegisterModal: React.FC = () => {
  const { isOpen, close, switchToLogin } = useRegisterModal();
  const { open: openOnboarding } = useOnboardingModal();

  const [registerStep, setRegisterStep] = useState<RegisterStep>({
    step: 'form',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 🆕 NOVO: Estado para erro específico de conflito de email
  const [emailConflictError, setEmailConflictError] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // 🆕 NOVO: Limpar erro de conflito ao digitar
    if (emailConflictError) {
      setEmailConflictError(null);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Nome de usuário é obrigatório';
    } else if (formData.username.trim().length < 2) {
      newErrors.username = 'Nome de usuário deve ter pelo menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🆕 NOVO: Função para fazer login automático após registro
  const performAutoLogin = async (email: string, password: string) => {
    try {
      console.log('🔄 Fazendo login automático após registro...');

      const result = await signIn('credentials', {
        email: email.trim(),
        password: password,
        redirect: false,
      });

      if (result?.error) {
        console.error('❌ Erro no login automático:', result.error);
        toast.error(
          'Conta criada, mas erro no login automático. Faça login manualmente.'
        );
        return false;
      } else {
        console.log('✅ Login automático realizado com sucesso!');
        toast.success('Conta criada e login realizado com sucesso!');
        return true;
      }
    } catch (error) {
      console.error('❌ Erro no login automático:', error);
      toast.error(
        'Conta criada, mas erro no login automático. Faça login manualmente.'
      );
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setEmailConflictError(null); // Limpar erro anterior

    try {
      const result = await registerUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (result.success) {
        // 🆕 NOVO: Fazer login automático após registro bem-sucedido
        const loginSuccess = await performAutoLogin(
          formData.email.trim(),
          formData.password
        );

        setRegisterStep({
          step: 'confirmation-sent',
          userData: {
            firstName: formData.username.trim(),
            email: formData.email.trim(),
            isLoggedIn: loginSuccess, // 🆕 NOVO: Indicar se fez login
          },
        });
      } else {
        setErrors({ general: result.message });
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Erro interno. Tente novamente.' });
      toast.error('Erro interno. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setEmailConflictError(null); // Limpar erro anterior

    try {
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/',
      });

      if (result?.error) {
        // 🆕 NOVO: Verificar se é erro de conflito específico
        if (result.error === 'Callback') {
          console.log(
            '❌ Erro de callback Google no registro - provavelmente conflito de email'
          );

          setEmailConflictError(
            'Este email já está cadastrado com senha. Use "Fazer Login" para acessar sua conta.'
          );
          toast.error('Este email já possui uma conta com senha');
        } else {
          toast.error('Erro ao registrar com Google');
        }
      } else {
        close();
        // Google users will also need onboarding
        setTimeout(() => {
          openOnboarding();
        }, 500);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Erro ao registrar com Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleClose = () => {
    // Reset all state
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setEmailConflictError(null); // 🆕 NOVO: Limpar erro de conflito
    setRegisterStep({ step: 'form' });
    close();
  };

  const handleBackToLogin = () => {
    handleClose();
    switchToLogin();
  };

  // 🆕 NOVO: Função para prosseguir para o onboarding
  const handleProceedToOnboarding = () => {
    close();
    setTimeout(() => {
      openOnboarding();
    }, 300);
  };

  // Renderizar tela de confirmação de email - VERSÃO ATUALIZADA
  const renderConfirmationSent = () => (
    <>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-full flex items-center justify-center shadow-theme-glow animate-pulse">
            <FiCheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
          🎉 Bem-vindo à Opus Atlas!
        </h2>
        <p className="text-theme-secondary">
          {registerStep.userData?.isLoggedIn
            ? 'Conta criada e você já está logado!'
            : 'Conta criada com sucesso!'}
        </p>
      </div>

      <div className="space-y-6">
        {/* 🆕 NOVO: Status de login */}
        {registerStep.userData?.isLoggedIn ? (
          <></>
        ) : (
          <div className="bg-accent-amber bg-opacity-10 border border-accent-amber rounded-lg p-4">
            <div className="flex items-start">
              <FiAlertTriangle className="w-5 h-5 text-accent-amber mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-accent-amber mb-1">
                  Login manual necessário
                </h4>
                <p className="text-sm text-accent-amber opacity-80">
                  Houve um problema no login automático. Faça login manualmente
                  para continuar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informações sobre confirmação de email */}
        <div className="bg-accent-blue bg-opacity-10 border border-accent-blue rounded-lg p-4">
          <div className="flex items-start">
            <div>
              <h4 className="font-medium text-accent-blue mb-1">
                📧 Email de Confirmação Enviado
              </h4>
              <p className="text-sm text-accent-blue opacity-80 mb-2">
                Enviamos um link de confirmação para{' '}
                <strong>{registerStep.userData?.email}</strong>
              </p>
              <div className="text-xs text-accent-blue opacity-70 space-y-1">
                <p>
                  • <strong>Para usar normalmente:</strong> Não é necessário
                  confirmar agora
                </p>
                <p>
                  • <strong>Para uploads:</strong> Confirme seu email para fazer
                  uploads de arquivos
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-theme-secondary rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium text-theme-primary flex items-center">
            <FiCheckCircle className="w-4 h-4 mr-2" />
            Próximos passos:
          </h4>
          <ul className="text-sm text-theme-tertiary space-y-2">
            <li className="flex items-start">
              <span className="text-brand-primary mr-2 font-medium">1.</span>
              Complete seu perfil musical (recomendado)
            </li>
            <li className="flex items-start">
              <span className="text-brand-primary mr-2 font-medium">2.</span>
              Comece a explorar compositores e obras
            </li>
            <li className="flex items-start">
              <span className="text-brand-primary mr-2 font-medium">3.</span>
              Confirme seu email quando puder (para uploads)
            </li>
            <li className="flex items-start">
              <span className="text-brand-primary mr-2 font-medium">4.</span>
              Aproveite sua jornada musical!
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          {/* 🆕 NOVO: Botão dinâmico baseado no status de login */}
          {registerStep.userData?.isLoggedIn ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleProceedToOnboarding}
            >
              Completar Perfil Musical
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleBackToLogin}
            >
              Ir para Login
            </Button>
          )}

          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={handleClose}
          >
            {registerStep.userData?.isLoggedIn ? 'Explorar Agora' : 'Fechar'}
          </Button>
        </div>

        {/* 🆕 NOVO: Informação adicional sobre confirmação */}
        <div className="text-center pt-4 border-t border-theme-secondary">
          <p className="text-xs text-theme-tertiary">
            💡 <strong>Dica:</strong> Você pode usar o site normalmente sem
            confirmar o email.
            <br />A confirmação é necessária apenas para fazer uploads de
            partituras e compositores.
          </p>
        </div>
      </div>
    </>
  );

  // Renderizar formulário de registro original
  const renderRegistrationForm = () => (
    <>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-brand-gradient rounded-full flex items-center justify-center shadow-theme-glow">
            <GiGrandPiano className="w-8 h-8 text-theme-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
          Junte-se à Opus Atlas
        </h2>
        <p className="text-theme-secondary">
          Crie sua conta e comece sua jornada na música clássica
        </p>
      </div>

      {/* 🆕 NOVO: Aviso de conflito de email */}
      {emailConflictError && (
        <div className="mb-6 p-4 rounded-lg bg-accent-amber bg-opacity-10 border border-accent-amber">
          <div className="flex items-start">
            <FiAlertTriangle className="w-5 h-5 text-accent-amber mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-accent-amber mb-1">
                Email já cadastrado
              </h4>
              <p className="text-sm text-accent-amber opacity-90">
                {emailConflictError}
              </p>
              <div className="mt-3">
                <button
                  onClick={() => {
                    handleClose();
                    switchToLogin();
                  }}
                  className="text-sm text-accent-amber hover:text-accent-amber opacity-80 hover:opacity-100 underline transition-opacity"
                >
                  Ir para Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Sign Up */}
      <Button
        variant="google"
        size="lg"
        onClick={handleGoogleSignIn}
        isLoading={isGoogleLoading}
        leftIcon={<FcGoogle />}
        className="w-full mb-6"
        disabled={isLoading}
      >
        Continuar com Google
      </Button>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-theme-secondary" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-theme-elevated text-theme-tertiary">
            ou registre-se com email
          </span>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="p-3 rounded-lg bg-accent-red bg-opacity-10 border border-accent-red text-accent-red text-sm">
            {errors.general}
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Nome de usuário"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            leftIcon={<FiUser className="w-4 h-4" />}
            placeholder="Seu nome de usuário"
            error={errors.username}
            disabled={isLoading || isGoogleLoading}
            autoComplete="username"
          />
        </div>

        {/* Email */}
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          leftIcon={<FiMail className="w-4 h-4" />}
          placeholder="seu@email.com"
          error={errors.email}
          disabled={isLoading || isGoogleLoading}
          autoComplete="email"
        />

        {/* Password */}
        <Input
          label="Senha"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          leftIcon={<FiLock className="w-4 h-4" />}
          placeholder="Crie uma senha segura"
          isPassword
          error={errors.password}
          disabled={isLoading || isGoogleLoading}
          autoComplete="new-password"
        />

        {/* Confirm Password */}
        <Input
          label="Confirmar Senha"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          leftIcon={<FiLock className="w-4 h-4" />}
          placeholder="Confirme sua senha"
          isPassword
          error={errors.confirmPassword}
          disabled={isLoading || isGoogleLoading}
          autoComplete="new-password"
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
          disabled={isGoogleLoading}
        >
          Criar Conta
        </Button>
      </form>

      {/* Login Link */}
      <div className="mt-8 text-center">
        <p className="text-theme-secondary">
          Já tem uma conta?{' '}
          <button
            onClick={switchToLogin}
            className="text-brand-primary hover:text-brand-secondary font-medium transition-colors"
            disabled={isLoading || isGoogleLoading}
          >
            Fazer login
          </button>
        </p>
      </div>

      {/* Terms and Privacy Notice */}
      <div className="mt-6 text-center">
        <p className="text-xs text-theme-tertiary">
          Ao criar uma conta, você concorda com nossos{' '}
          <a href="/terms" className="text-brand-primary hover:underline">
            Termos de Uso
          </a>{' '}
          e{' '}
          <a href="/privacy" className="text-brand-primary hover:underline">
            Política de Privacidade
          </a>
        </p>
      </div>
    </>
  );

  const renderContent = () => {
    switch (registerStep.step) {
      case 'confirmation-sent':
        return renderConfirmationSent();
      case 'form':
      default:
        return renderRegistrationForm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="lg"
      showCloseButton={true}
    >
      {renderContent()}
    </Modal>
  );
};

export default RegisterModal;
