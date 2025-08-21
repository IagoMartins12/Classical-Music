// components/auth/RegisterModal.tsx - VERSÃO COM ACEITAÇÃO DE TERMOS LGPD
'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import {
  FiMail,
  FiLock,
  FiUser,
  FiCheckCircle,
  FiAlertTriangle,
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { GiGrandPiano } from 'react-icons/gi';
import { registerUser } from '@/app/actions/auth';
import { toast } from 'react-hot-toast';
import {
  useOnboardingModal,
  usePromptModal,
  useRegisterModal,
} from '@/app/stores/authStore';
import Modal from '../../Modal';
import Button from '../../Common/Button';
import Input from '../../Common/Inputs';
import TermsAcceptance from '../TermsAcceptance';

interface RegisterStep {
  step: 'form' | 'success' | 'confirmation-sent';
  userData?: {
    firstName?: string;
    email?: string;
    isLoggedIn?: boolean;
    registrationMethod?: 'credentials' | 'google';
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

  // Estado para erro específico de conflito de email
  const [emailConflictError, setEmailConflictError] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // 🆕 NOVO: Estado para aceitação de termos
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Verificar se retornou de um registro Google
  useEffect(() => {
    if (isOpen) {
      checkGoogleRegistrationReturn();
      checkUrlErrors();
    }
  }, [isOpen]);

  // Verificar retorno do registro Google
  const checkGoogleRegistrationReturn = () => {
    if (typeof window === 'undefined') return;

    // 🔧 VERIFICAR ERRO NA URL PRIMEIRO
    const currentUrl = new URL(window.location.href);
    const urlError = currentUrl.searchParams.get('error');

    if (urlError) {
      console.log(
        '❌ Erro na URL detectado, não processando como sucesso:',
        urlError
      );

      // Limpar todas as flags de sucesso em caso de erro
      sessionStorage.removeItem('google-register-pending');
      sessionStorage.removeItem('google-register-email');
      sessionStorage.removeItem('google-register-name');
      sessionStorage.removeItem('google-register-timestamp');

      // Não processar como sucesso - o checkUrlErrors() irá lidar com o erro
      return;
    }

    // Verificar flags apenas se NÃO há erro
    const googleRegisterFlag = sessionStorage.getItem(
      'google-register-pending'
    );
    const googleRegisterEmail = sessionStorage.getItem('google-register-email');
    const googleRegisterName = sessionStorage.getItem('google-register-name');
    const googleRegisterTimestamp = sessionStorage.getItem(
      'google-register-timestamp'
    );

    // 🔧 LÓGICA MAIS RIGOROSA: Só processar como sucesso se:
    // 1. Há flag de pending
    // 2. Há timestamp recente (últimos 5 minutos)
    // 3. NÃO há erro na URL
    // 4. Há dados válidos
    if (googleRegisterFlag === 'true' && googleRegisterTimestamp && !urlError) {
      const now = Date.now();
      const timestamp = parseInt(googleRegisterTimestamp);
      const timeDiff = now - timestamp;

      // Verificar se é recente (últimos 5 minutos)
      if (timeDiff < 5 * 60 * 1000) {
        console.log('✅ Retorno de registro Google válido detectado');

        // Limpar flags antes de processar
        sessionStorage.removeItem('google-register-pending');
        sessionStorage.removeItem('google-register-email');
        sessionStorage.removeItem('google-register-name');
        sessionStorage.removeItem('google-register-timestamp');

        // Mostrar tela de confirmação para usuário Google
        setRegisterStep({
          step: 'confirmation-sent',
          userData: {
            firstName: googleRegisterName || 'Usuário',
            email: googleRegisterEmail || '',
            isLoggedIn: true,
            registrationMethod: 'google',
          },
        });

        toast.success('Conta criada com Google! Bem-vindo à Opus Atlas!');
      } else {
        console.log('⏰ Timestamp muito antigo, limpando flags:', timeDiff);

        // Timestamp muito antigo - limpar flags
        sessionStorage.removeItem('google-register-pending');
        sessionStorage.removeItem('google-register-email');
        sessionStorage.removeItem('google-register-name');
        sessionStorage.removeItem('google-register-timestamp');
      }
    }
  };

  // 🔧 FUNÇÃO CORRIGIDA - checkUrlErrors
  const checkUrlErrors = () => {
    if (typeof window === 'undefined') return;

    const currentUrl = new URL(window.location.href);
    const error = currentUrl.searchParams.get('error');
    const errorDescription = currentUrl.searchParams.get('error_description');

    if (error) {
      console.log('🔍 Erro detectado na URL (Register):', {
        error,
        errorDescription,
      });

      // 🆕 NOVO: Limpar flags de sucesso quando há erro
      sessionStorage.removeItem('google-register-pending');
      sessionStorage.removeItem('google-register-email');
      sessionStorage.removeItem('google-register-name');
      sessionStorage.removeItem('google-register-timestamp');

      let errorMessage = '';
      let shouldShowConflictError = false;

      switch (error) {
        case 'Callback':
          errorMessage =
            'Este email já está cadastrado com senha. Use "Fazer Login" para acessar sua conta.';
          shouldShowConflictError = true;
          break;
        case 'OAuthCallback':
          errorMessage = 'Erro na autenticação com Google. Tente novamente.';
          break;
        case 'OAuthSignin':
          errorMessage =
            'Erro ao iniciar registro com Google. Verifique suas permissões.';
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
        case 'AccessDenied':
          errorMessage =
            'Acesso negado pelo Google. Verifique suas permissões.';
          break;
        case 'Verification':
          errorMessage = 'Erro na verificação com Google. Tente novamente.';
          break;
        default:
          errorMessage =
            errorDescription || 'Erro no registro. Tente novamente.';
      }

      if (shouldShowConflictError) {
        setEmailConflictError(errorMessage);
      } else {
        toast.error(errorMessage);
      }

      // Limpar URL dos parâmetros de erro
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('error');
      cleanUrl.searchParams.delete('error_description');
      cleanUrl.searchParams.delete('code');
      cleanUrl.searchParams.delete('state');
      window.history.replaceState({}, '', cleanUrl.toString());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    const cleanedValue =
      name === 'username' || name === 'email'
        ? value.replace(/\s/g, '')
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : cleanedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (emailConflictError) {
      setEmailConflictError(null);
    }
  };

  // 🆕 ATUALIZADO: Validação incluindo termos
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Nome de usuário é obrigatório';
    } else if (formData.username.trim().length < 2) {
      newErrors.username = 'Nome de usuário deve ter pelo menos 2 caracteres';
    } else if (formData.username.includes(' ')) {
      newErrors.username = 'Nome de usuário não pode conter espaços';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username =
        'Nome de usuário só pode conter letras, números, _ e -';
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

    // 🆕 NOVO: Validação de termos obrigatória
    if (!termsAccepted) {
      newErrors.terms =
        'Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    setEmailConflictError(null);

    try {
      const result = await registerUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (result.success) {
        const loginSuccess = await performAutoLogin(
          formData.email.trim(),
          formData.password
        );

        setRegisterStep({
          step: 'confirmation-sent',
          userData: {
            firstName: formData.username.trim(),
            email: formData.email.trim(),
            isLoggedIn: loginSuccess,
            registrationMethod: 'credentials',
          },
        });
      } else {
        if (
          result.message.includes('já existe') ||
          result.message.includes('já cadastrado')
        ) {
          setEmailConflictError(result.message);
        } else {
          setErrors({ general: result.message });
        }
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

  // 🆕 ATUALIZADO: handleGoogleSignIn com verificação de termos
  const handleGoogleSignIn = async () => {
    // 🆕 NOVA VALIDAÇÃO: Verificar termos antes do Google
    if (!termsAccepted) {
      setErrors({
        terms:
          'Você deve aceitar os Termos de Uso e a Política de Privacidade antes de continuar com o Google',
      });
      toast.error('Aceite os termos para continuar');
      return;
    }

    setIsGoogleLoading(true);
    setEmailConflictError(null);

    try {
      console.log('🔄 Iniciando registro com Google...');

      // Salvar flags no sessionStorage antes do redirect
      sessionStorage.setItem('google-register-pending', 'true');
      sessionStorage.setItem(
        'google-register-timestamp',
        Date.now().toString()
      );

      // Fazer o signIn com redirect
      const result = await signIn('google', {
        redirect: true,
        callbackUrl: window.location.origin + '/?google-register=true',
      });

      if (result?.error) {
        console.error('❌ Erro no Google SignUp:', result.error);

        // Limpar flags em caso de erro
        sessionStorage.removeItem('google-register-pending');
        sessionStorage.removeItem('google-register-timestamp');

        switch (result.error) {
          case 'Callback':
            setEmailConflictError(
              'Este email já está cadastrado com senha. Use "Fazer Login" para acessar sua conta.'
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
              'Este email já está em uso. Tente fazer login com esse email.'
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
            toast.error('Erro ao registrar com Google. Tente novamente.');
        }
      }
    } catch (error) {
      console.error('❌ Erro no Google SignUp:', error);

      // Limpar flags em caso de erro
      sessionStorage.removeItem('google-register-pending');
      sessionStorage.removeItem('google-register-timestamp');

      toast.error('Erro ao registrar com Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const { open } = usePromptModal();
  const handleClose = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setTermsAccepted(false); // 🆕 NOVO: Reset dos termos
    open();
    setErrors({});
    setEmailConflictError(null);
    setRegisterStep({ step: 'form' });
    close();
  };

  const handleBackToLogin = () => {
    handleClose();
    switchToLogin();
  };

  const handleProceedToOnboarding = () => {
    close();
    setTimeout(() => {
      openOnboarding();
    }, 300);
  };

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
          {registerStep.userData?.registrationMethod === 'google'
            ? 'Conta criada com Google'
            : 'Conta criada com sucesso'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Status de login - não mostrar para usuários Google */}
        {!registerStep.userData?.isLoggedIn &&
          registerStep.userData?.registrationMethod !== 'google' && (
            <div className="bg-accent-amber bg-opacity-10 border border-accent-amber rounded-lg p-4">
              <div className="flex items-start">
                <FiAlertTriangle className="w-5 h-5 text-accent-amber mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-accent-amber mb-1">
                    Login manual necessário
                  </h4>
                  <p className="text-sm text-accent-amber opacity-80">
                    Houve um problema no login automático. Faça login
                    manualmente para continuar.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Informações específicas para Google vs Email */}
        {registerStep.userData?.registrationMethod === 'google' ? (
          <div className="bg-accent-blue bg-opacity-10 border border-accent-blue rounded-lg p-4">
            <div className="flex items-start">
              <div>
                <h4 className="font-medium text-accent-blue mb-1">
                  ✅ Conta Google Verificada
                </h4>
                <p className="text-sm text-accent-blue opacity-80 mb-2">
                  Sua conta foi criada e verificada automaticamente com{' '}
                  <strong>{registerStep.userData?.email}</strong>
                </p>
                <div className="text-xs text-accent-blue opacity-70 space-y-1">
                  <p>
                    • Conta já verificada - nenhuma confirmação adicional
                    necessária
                  </p>
                  <p>
                    • Você pode usar todos os recursos da plataforma
                    imediatamente
                  </p>
                  <p>• Login rápido com Google nas próximas vezes</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
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
                    • <strong>Para uploads:</strong> Confirme seu email para
                    fazer uploads de arquivos
                  </p>
                  <p>
                    • <strong>Para alterar seu perfil:</strong> Confirme seu
                    email para fazer alterações no seu perfil
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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
            {registerStep.userData?.registrationMethod !== 'google' && (
              <li className="flex items-start">
                <span className="text-brand-primary mr-2 font-medium">3.</span>
                Confirme seu email quando puder (para uploads)
              </li>
            )}
            <li className="flex items-start">
              <span className="text-brand-primary mr-2 font-medium">
                {registerStep.userData?.registrationMethod === 'google'
                  ? '3.'
                  : '4.'}
              </span>
              Aproveite sua jornada musical!
            </li>
          </ul>
        </div>

        <div className="space-y-3">
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

        {/* Informação adicional - adaptada para Google */}
        <div className="text-center pt-4 border-t border-theme-secondary">
          {registerStep.userData?.registrationMethod === 'google' ? (
            <p className="text-xs text-theme-tertiary">
              🎵 <strong>Dica:</strong> Use &quot;Continuar com Google&quot;
              para entrar rapidamente nas próximas vezes!
            </p>
          ) : (
            <p className="text-xs text-theme-tertiary">
              💡 <strong>Dica:</strong> Você pode usar o site normalmente sem
              confirmar o email.
              <br />A confirmação é necessária apenas para fazer uploads de
              partituras e compositores.
            </p>
          )}
        </div>
      </div>
    </>
  );

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="p-3 rounded-lg bg-accent-red bg-opacity-10 border border-accent-red text-accent-red text-sm">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div>
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
            <p className="text-xs text-theme-tertiary mt-1">
              Apenas letras, números, _ e - (sem espaços)
            </p>
          </div>
        </div>

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          leftIcon={<FiMail className="w-4 h-4" />}
          placeholder="seu@email.com"
          error={errors.email || emailConflictError}
          disabled={isLoading || isGoogleLoading}
          autoComplete="email"
        />

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

        {/* 🆕 NOVO: Componente de Aceitação de Termos */}
        <TermsAcceptance
          accepted={termsAccepted}
          onChange={setTermsAccepted}
          error={errors.terms}
          disabled={isLoading || isGoogleLoading}
        />

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

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-theme-secondary" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-theme-elevated text-theme-tertiary">
            ou registre-se com
          </span>
        </div>
      </div>

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
