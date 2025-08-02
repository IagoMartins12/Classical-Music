// components/auth/LoginModal.tsx - VERSÃO COM TRATAMENTO DE ERROS MELHORADO
'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { FiMail, FiLock, FiAlertTriangle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { GiGrandPiano } from 'react-icons/gi';
import { useRouter } from 'next/navigation';

import { toast } from 'react-hot-toast';
import { useLoginModal } from '@/app/stores/authStore';
import Modal from '../../Modal';
import Button from '../../Common/Button';
import Input from '../../Common/Inputs';
import ForgotPasswordModal from '../ForgotPasswordModal';

const LoginModal: React.FC = () => {
  const { isOpen, close, switchToRegister } = useLoginModal();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const router = useRouter();

  // Estado para erro específico de conflito de email
  const [emailConflictError, setEmailConflictError] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 🆕 NOVO: Verificar erros na URL quando o modal abrir
  useEffect(() => {
    checkUrlErrors();
  }, [isOpen]);

  // 🆕 NOVO: Função para verificar e processar erros na URL
  const checkUrlErrors = () => {
    if (typeof window === 'undefined') return;

    const currentUrl = new URL(window.location.href);
    const error = currentUrl.searchParams.get('error');
    const errorDescription = currentUrl.searchParams.get('error_description');

    if (error) {
      console.log('🔍 Erro detectado na URL:', { error, errorDescription });

      // Processar diferentes tipos de erro
      let errorMessage = '';
      let shouldShowConflictError = false;

      switch (error) {
        case 'Callback':
          errorMessage =
            'Este email já está cadastrado com senha. Use "Entrar com Email" ou redefina sua senha.';
          shouldShowConflictError = true;
          break;
        case 'OAuthCallback':
          errorMessage = 'Erro na autenticação com Google. Tente novamente.';
          break;
        case 'OAuthSignin':
          errorMessage =
            'Erro ao iniciar login com Google. Verifique suas permissões.';
          break;
        case 'OAuthCreateAccount':
          errorMessage =
            'Erro ao criar conta com Google. Este email pode já estar em uso.';
          shouldShowConflictError = true;
          break;
        case 'EmailCreateAccount':
          errorMessage = 'Este email já está em uso por outra conta.';
          shouldShowConflictError = true;
          break;
        case 'Signin':
          errorMessage = 'Erro no login. Verifique suas credenciais.';
          break;
        case 'SessionRequired':
          errorMessage = 'Sessão expirada. Faça login novamente.';
          break;
        case 'AccessDenied':
          errorMessage = 'Acesso negado. Verifique suas permissões.';
          break;
        case 'Verification':
          errorMessage = 'Erro na verificação. Tente fazer login novamente.';
          break;
        default:
          // Usar error_description se disponível
          errorMessage =
            errorDescription || 'Erro de autenticação. Tente novamente.';
      }

      // Mostrar erro apropriado
      if (shouldShowConflictError) {
        setEmailConflictError(errorMessage);
      } else {
        toast.error(errorMessage);
      }

      // 🆕 NOVO: Limpar URL dos parâmetros de erro
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('error');
      cleanUrl.searchParams.delete('error_description');
      cleanUrl.searchParams.delete('code');
      cleanUrl.searchParams.delete('state');

      // Atualizar URL sem recarregar a página
      window.history.replaceState({}, '', cleanUrl.toString());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Limpar erro de conflito ao digitar
    if (emailConflictError) {
      setEmailConflictError(null);
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
    setEmailConflictError(null); // Limpar erro anterior

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
        close();
        router.refresh();
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
    setEmailConflictError(null); // Limpar erro anterior

    try {
      console.log('🔄 Iniciando login com Google...');

      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/',
      });

      console.log('📊 Resultado do Google SignIn:', result);

      if (result?.error) {
        console.error('❌ Erro no Google SignIn:', result.error);

        // Tratar erros específicos do Google
        switch (result.error) {
          case 'Callback':
            setEmailConflictError(
              'Este email já está cadastrado com senha. Use "Entrar com Email" ou redefina sua senha.'
            );
            toast.error('Este email já possui uma conta com senha');
            break;
          case 'OAuthCallback':
            toast.error('Erro na autenticação com Google. Tente novamente.');
            break;
          case 'OAuthSignin':
            toast.error(
              'Erro ao conectar com Google. Verifique suas permissões.'
            );
            break;
          case 'OAuthCreateAccount':
            setEmailConflictError(
              'Este email já está em uso. Tente fazer login com email e senha.'
            );
            toast.error('Este email já está em uso');
            break;
          case 'EmailCreateAccount':
            setEmailConflictError(
              'Este email já está cadastrado. Use o login com email e senha.'
            );
            toast.error('Este email já está cadastrado');
            break;
          case 'AccessDenied':
            toast.error('Acesso negado pelo Google. Tente novamente.');
            break;
          default:
            toast.error('Erro ao fazer login com Google. Tente novamente.');
        }
      } else if (result?.url) {
        // Login bem-sucedido
        console.log('✅ Login Google bem-sucedido, redirecionando...');
        toast.success('Login realizado com sucesso!');
        close();

        // Redirecionar ou recarregar
        if (result.url !== window.location.href) {
          router.push(result.url);
        } else {
          router.refresh();
        }
      } else {
        // Caso não tenha erro nem URL, assume sucesso
        close();
        router.refresh();
      }
    } catch (error) {
      console.error('❌ Erro no Google SignIn:', error);
      toast.error('Erro ao fazer login com Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', password: '' });
    setErrors({});
    setEmailConflictError(null); // Limpar erro de conflito
    close();
  };

  const handleForgotPassword = () => {
    setForgotPasswordOpen(true);
  };

  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false);
  };

  const handleBackToLoginFromForgot = () => {
    setForgotPasswordOpen(false);
  };

  return (
    <>
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

        {/* Aviso de conflito de email */}
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
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setEmailConflictError(null);
                      // Focar no campo de email para facilitar o login
                      const emailInput = document.querySelector(
                        'input[name="email"]'
                      ) as HTMLInputElement;
                      if (emailInput) emailInput.focus();
                    }}
                    className="text-xs text-accent-amber hover:text-accent-amber opacity-80 hover:opacity-100 underline transition-opacity"
                  >
                    Fazer login com email
                  </button>
                  <span className="text-xs text-accent-amber opacity-50">
                    •
                  </span>
                  <button
                    onClick={handleForgotPassword}
                    className="text-xs text-accent-amber hover:text-accent-amber opacity-80 hover:opacity-100 underline transition-opacity"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
              onClick={handleForgotPassword}
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

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-theme-secondary" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-theme-elevated text-theme-tertiary">
              ou continue com
            </span>
          </div>
        </div>

        {/* Google Sign In */}
        <Button
          variant="google"
          size="lg"
          onClick={handleGoogleSignIn}
          isLoading={isGoogleLoading}
          leftIcon={<FcGoogle />}
          className="w-full"
          disabled={isLoading}
        >
          Continuar com Google
        </Button>

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

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={handleCloseForgotPassword}
        onBackToLogin={handleBackToLoginFromForgot}
      />
    </>
  );
};

export default LoginModal;
