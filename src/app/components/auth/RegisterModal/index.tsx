// components/auth/RegisterModal.tsx - VERSÃO ATUALIZADA
'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import {
  FiMail,
  FiLock,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await registerUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (result.success) {
        // 🆕 NOVO: Após criar conta, mostrar tela de confirmação
        setRegisterStep({
          step: 'confirmation-sent',
          userData: {
            firstName: formData.username.trim(),
            email: formData.email.trim(),
          },
        });

        toast.success('Conta criada! Verifique seu email para confirmar.');
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

    try {
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/',
      });

      if (result?.error) {
        toast.error('Erro ao registrar com Google');
      } else {
        toast.success('Conta criada com Google!');
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
    setRegisterStep({ step: 'form' });
    close();
  };

  const handleBackToLogin = () => {
    handleClose();
    switchToLogin();
  };

  // 🆕 NOVO: Renderizar tela de confirmação de email
  const renderConfirmationSent = () => (
    <>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-full flex items-center justify-center shadow-theme-glow animate-pulse">
            <FiMail className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
          🎉 Conta Criada!
        </h2>
        <p className="text-theme-secondary">
          Verifique seu email para confirmar sua conta
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-accent-green bg-opacity-10 border border-accent-green rounded-lg p-4">
          <div className="flex items-start">
            <FiCheckCircle className="w-5 h-5 text-accent-green mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-accent-green mb-1">
                Email de Confirmação Enviado
              </h4>
              <p className="text-sm text-accent-green opacity-80">
                Enviamos um link de confirmação para{' '}
                <strong>{registerStep.userData?.email}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-theme-secondary rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium text-theme-primary flex items-center">
            <FiMail className="w-4 h-4 mr-2" />
            Próximos passos:
          </h4>
          <ul className="text-sm text-theme-tertiary space-y-2">
            <li className="flex items-start">
              <span className="text-brand-primary mr-2 font-medium">1.</span>
              Verifique sua caixa de entrada (e spam)
            </li>
            <li className="flex items-start">
              <span className="text-brand-primary mr-2 font-medium">2.</span>
              Clique no link "Confirmar Conta"
            </li>
            <li className="flex items-start">
              <span className="text-brand-primary mr-2 font-medium">3.</span>
              Complete seu perfil musical
            </li>
            <li className="flex items-start">
              <span className="text-brand-primary mr-2 font-medium">4.</span>
              Comece a explorar a música clássica!
            </li>
          </ul>
        </div>

        <div className="bg-accent-blue bg-opacity-10 border border-accent-blue rounded-lg p-4">
          <div className="flex items-start">
            <FiAlertCircle className="w-5 h-5 text-accent-blue mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-accent-blue mb-1">
                Não recebeu o email?
              </h4>
              <ul className="text-sm text-accent-blue opacity-80 space-y-1">
                <li>• Verifique sua caixa de spam/lixo eletrônico</li>
                <li>• Aguarde alguns minutos</li>
                <li>• Verifique se digitou o email corretamente</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleBackToLogin}
          >
            Ir para Login
          </Button>

          <button
            onClick={handleClose}
            className="w-full text-sm text-theme-tertiary hover:text-theme-primary transition-colors"
          >
            Fechar
          </button>
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
          Junte-se à Classical Hub
        </h2>
        <p className="text-theme-secondary">
          Crie sua conta e comece sua jornada na música clássica
        </p>
      </div>

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
