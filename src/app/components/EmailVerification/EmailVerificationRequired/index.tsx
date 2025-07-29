// app/components/EmailVerificationRequired.tsx
'use client';

import Link from 'next/link';
import {
  FiMail,
  FiShield,
  FiHome,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertTriangle,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from '../../animation/AnimatedComponents';
import AnimatedMusicalNotes from '../../AnimatedMusicalNotes';
import Button from '../../Common/Button';
import { useEmailVerification } from '@/app/hooks/useEmailVerification';
import {
  useEmailRefresh,
  useEmailRefreshSimple,
} from '@/app/hooks/useEmailRefresh';

interface EmailVerificationRequiredProps {
  userEmail: string;
  userName?: string;
}

export default function EmailVerificationRequired({
  userEmail,
  userName,
}: EmailVerificationRequiredProps) {
  const { isSending, emailSent, resendEmail } = useEmailVerification({
    userEmail,
  });
  const { isRefreshing, refreshEmailStatus } = useEmailRefreshSimple();

  return (
    <div className="classical-theme min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <AnimatedMusicalNotes />

      <div className="section-wrap relative z-10">
        <AnimatedContainer
          staggerSpeed="normal"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Main Icon */}
          <AnimatedItem direction="scale" springType="bouncy">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-accent-amber/20 to-accent-blue/20 rounded-full flex items-center justify-center classical-card border-2 border-accent-amber/30 shadow-theme-glow">
                <FiShield className="w-16 h-16 text-accent-amber" />
              </div>
            </div>
          </AnimatedItem>

          {/* Title */}
          <AnimatedItem direction="up" springType="bouncy">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-6">
              Verificação de Email Necessária
            </h1>
          </AnimatedItem>

          {/* Subtitle */}
          <AnimatedItem direction="up" springType="smooth">
            <p className="text-xl md:text-2xl text-theme-secondary mb-8 leading-relaxed">
              Para fazer uploads de compositores e partituras, você precisa
              confirmar seu email 📧
            </p>
          </AnimatedItem>

          {/* Main Info Card */}
          <AnimatedCard
            hover="lift"
            className="classical-card p-8 mb-8 max-w-2xl mx-auto"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-blue/20 to-accent-green/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiMail className="w-6 h-6 text-accent-blue" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-bold text-theme-primary mb-3 classical-title">
                  {userName ? `Olá, ${userName}!` : 'Confirmação Pendente'}
                </h3>
                <div className="space-y-3">
                  <p className="text-theme-secondary">
                    <strong className="text-brand-primary">Seu Email:</strong>{' '}
                    {userEmail}
                  </p>
                  <p className="text-theme-secondary text-sm">
                    Por motivos de segurança, apenas usuários com email
                    confirmado podem fazer uploads de conteúdo musical. Isso nos
                    ajuda a manter a qualidade e autenticidade do acervo.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Email Status */}
          {emailSent && (
            <AnimatedItem direction="scale" springType="bouncy">
              <div className="bg-accent-green bg-opacity-10 border border-accent-green rounded-lg p-4 mb-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center space-x-3">
                  <FiCheckCircle className="w-5 h-5 text-accent-green" />
                  <p className="text-accent-green font-medium">
                    Email de confirmação enviado com sucesso!
                  </p>
                </div>
                <p className="text-accent-green text-sm mt-2 opacity-80">
                  Verifique sua caixa de entrada e spam. O link é válido por 24
                  horas.
                </p>
              </div>
            </AnimatedItem>
          )}

          {/* Action Buttons */}
          <AnimatedContainer
            staggerSpeed="fast"
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <AnimatedItem hover="scale" springType="bouncy">
              <Button
                onClick={resendEmail}
                variant="primary"
                size="lg"
                isLoading={isSending}
                leftIcon={
                  <FiRefreshCw
                    className={`w-5 h-5 ${
                      isSending ? 'animate-spin' : 'group-hover:rotate-180'
                    } transition-transform duration-500`}
                  />
                }
                className="px-8 py-4"
              >
                {emailSent ? 'Reenviar Email' : 'Enviar Email de Confirmação'}
              </Button>
            </AnimatedItem>
            <AnimatedItem hover="scale" springType="bouncy">
              <Button
                onClick={refreshEmailStatus}
                variant="secondary"
                size="lg"
                isLoading={isRefreshing}
                leftIcon={<FiCheckCircle />}
              >
                {isRefreshing ? 'Verificando...' : 'Já Confirmei'}
              </Button>
            </AnimatedItem>
            <AnimatedItem hover="scale" springType="bouncy">
              <Link href="/">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={
                    <FiHome className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  }
                  className="px-8 py-4"
                >
                  Voltar ao Início
                </Button>
              </Link>
            </AnimatedItem>
          </AnimatedContainer>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* What you can do */}
            <AnimatedCard hover="lift" className="classical-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                  <FiCheckCircle className="w-5 h-5 text-accent-green" />
                </div>
                <h3 className="text-xl font-bold text-theme-primary classical-title">
                  O que você pode fazer agora
                </h3>
              </div>

              <div className="text-left space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                  <span className="text-theme-secondary text-sm">
                    Explorar compositores e obras
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                  <span className="text-theme-secondary text-sm">
                    Descobrir partituras gratuitas
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                  <span className="text-theme-secondary text-sm">
                    Criar listas de favoritos
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                  <span className="text-theme-secondary text-sm">
                    Personalizar seu perfil
                  </span>
                </div>
              </div>
            </AnimatedCard>

            {/* After verification */}
            <AnimatedCard hover="lift" className="classical-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-amber/20 to-accent-purple/20 rounded-xl flex items-center justify-center">
                  <FiShield className="w-5 h-5 text-accent-amber" />
                </div>
                <h3 className="text-xl font-bold text-theme-primary classical-title">
                  Após a confirmação
                </h3>
              </div>

              <div className="text-left space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                  <span className="text-theme-secondary text-sm">
                    Adicionar novos compositores
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                  <span className="text-theme-secondary text-sm">
                    Fazer upload de partituras
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                  <span className="text-theme-secondary text-sm">
                    Contribuir com obras musicais
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                  <span className="text-theme-secondary text-sm">
                    Acesso completo ao sistema
                  </span>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Help Info */}
          <AnimatedCard
            hover="lift"
            className="classical-card p-6 max-w-3xl mx-auto"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiAlertTriangle className="w-5 h-5 text-accent-blue" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-bold text-theme-primary mb-3 classical-title">
                  Precisa de ajuda?
                </h3>
                <div className="space-y-2 text-sm text-theme-secondary">
                  <p>• Verifique sua pasta de spam/lixo eletrônico</p>
                  <p>• O email pode levar alguns minutos para chegar</p>
                  <p>• Use o mesmo navegador onde fez o registro</p>
                  <p>• Entre em contato conosco se o problema persistir</p>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Quote */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="mt-12 p-6 classical-card-simple max-w-2xl mx-auto">
              <blockquote className="text-lg text-theme-secondary italic mb-4 leading-relaxed">
                &quot;A música é a arte mais direta, ela entra pelos ouvidos e
                vai ao coração.&quot;
              </blockquote>
              <cite className="text-brand-primary font-semibold">
                — Magdalena Tagliaferro
              </cite>
            </div>
          </AnimatedItem>
        </AnimatedContainer>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 left-4 w-12 h-12 bg-accent-amber/10 rounded-2xl flex items-center justify-center opacity-40">
        <GiMusicalNotes className="w-6 h-6 text-accent-amber" />
      </div>

      <div className="absolute bottom-4 right-4 w-16 h-16 bg-brand-gradient/10 rounded-3xl flex items-center justify-center opacity-50">
        <FiMail className="w-8 h-8 text-brand-primary" />
      </div>
    </div>
  );
}
