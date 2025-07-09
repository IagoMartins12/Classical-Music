// components/auth/LoginModal.tsx
'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { GiGrandPiano } from 'react-icons/gi';

import { toast } from 'react-hot-toast';
import { useLoginModal } from '@/app/stores/authStore';
import Modal from '../../Modal';
import Button from '../../Common/Button';
import Input from '../../Common/Inputs';
import { useRouter } from 'next/navigation';

const LoginModal: React.FC = () => {
  const { isOpen, close, switchToRegister } = useLoginModal();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { refresh } = useRouter();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: 'Email ou senha incorretos' });
        toast.error('Email ou senha incorretos');
      } else {
        toast.success('Login realizado com sucesso!');

        // Check if user needs onboarding
        // This will be handled by the session callback
        close();
        refresh();
        // The onboarding check will be handled by the AuthProvider
        // based on the session data
      }
    } catch (error) {
      console.error('Login error:', error);
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
        toast.error('Erro ao fazer login com Google');
      } else {
        toast.success('Login realizado com sucesso!');
        close();
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Erro ao fazer login com Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', password: '' });
    setErrors({});
    close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="lg"
      showCloseButton={true}
    >
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-brand-gradient rounded-full flex items-center justify-center shadow-theme-glow">
            <GiGrandPiano className="w-8 h-8 text-theme-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
          Bem-vindo de volta!
        </h2>
        <p className="text-theme-secondary">
          Entre na sua conta para continuar sua jornada musical
        </p>
      </div>

      {/* Google Sign In */}
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
            ou continue com email
          </span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="p-3 rounded-lg bg-accent-red bg-opacity-10 border border-accent-red text-accent-red text-sm">
            {errors.general}
          </div>
        )}

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
          placeholder="Digite sua senha"
          isPassword
          error={errors.password}
          disabled={isLoading || isGoogleLoading}
          autoComplete="current-password"
        />

        {/* Forgot Password Link */}
        <div className="text-right">
          <button
            type="button"
            className="text-sm text-brand-primary hover:text-brand-secondary transition-colors"
            disabled={isLoading || isGoogleLoading}
          >
            Esqueceu sua senha?
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
          disabled={isGoogleLoading}
        >
          Entrar
        </Button>
      </form>

      {/* Register Link */}
      <div className="mt-8 text-center">
        <p className="text-theme-secondary">
          Ainda não tem uma conta?{' '}
          <button
            onClick={switchToRegister}
            className="text-brand-primary hover:text-brand-secondary font-medium transition-colors"
            disabled={isLoading || isGoogleLoading}
          >
            Criar conta
          </button>
        </p>
      </div>

      {/* Terms */}
      <div className="mt-6 text-center">
        <p className="text-xs text-theme-tertiary">
          Ao continuar, você concorda com nossos{' '}
          <a href="/terms" className="text-brand-primary hover:underline">
            Termos de Uso
          </a>{' '}
          e{' '}
          <a href="/privacy" className="text-brand-primary hover:underline">
            Política de Privacidade
          </a>
        </p>
      </div>
    </Modal>
  );
};

export default LoginModal;
