// app/components/StudentVerificationRequired.tsx
'use client';

import Link from 'next/link';
import {
  FiMail,
  FiUserCheck,
  FiHome,
  FiRefreshCw,
  FiAlertTriangle,
  FiMessageCircle,
  FiChevronRight,
  FiClock,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from '../../animation/AnimatedComponents';
import AnimatedMusicalNotes from '../../AnimatedMusicalNotes';
import Button from '../../Common/Button';
import { useEmailRefreshSimple } from '@/app/hooks/useEmailRefresh';
import { Toaster } from 'react-hot-toast';
import Navbar from '../../Navbar';

interface StudentVerificationRequiredProps {
  userEmail?: string | null;
  userName?: string | null;
}

export default function StudentVerificationRequired({
  userEmail,
  userName,
}: StudentVerificationRequiredProps) {
  const { isRefreshing, refreshEmailStatus } = useEmailRefreshSimple();

  return (
    <>
      <Navbar />
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
                  <FiClock className="w-16 h-16 text-accent-amber" />
                </div>
              </div>
            </AnimatedItem>

            {/* Title */}
            <AnimatedItem direction="up" springType="bouncy">
              <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-6">
                Aguardando Aprovação do Convite
              </h1>
            </AnimatedItem>

            {/* Subtitle */}
            <AnimatedItem direction="up" springType="smooth">
              <p className="text-xl md:text-2xl text-theme-secondary mb-8 leading-relaxed">
                Você precisa aprovar seu convite para acessar a área do aluno.
              </p>
            </AnimatedItem>

            {/* Main Info Card */}
            <AnimatedCard
              hover="lift"
              className="classical-card p-8 mb-8 max-w-2xl mx-auto"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-amber/20 to-accent-blue/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiMail className="w-6 h-6 text-accent-amber" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-bold text-theme-primary mb-3 classical-title">
                    {userName ? `Olá, ${userName}!` : 'Convite Pendente'}
                  </h3>
                  <div className="space-y-3">
                    <p className="text-theme-secondary">
                      <strong className="text-brand-primary">Seu Email:</strong>{' '}
                      {userEmail}
                    </p>
                    <p className="text-theme-secondary text-sm">
                      Você foi adicionado como aluno por um professor da
                      plataforma Opus Atlas. Para acessar sua área do aluno, é
                      necessário que o você aprove seu convite. Isso garante que
                      apenas alunos autorizados tenham acesso às informações
                      pedagógicas.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Action Buttons */}
            <AnimatedContainer
              staggerSpeed="fast"
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            >
              <AnimatedItem hover="scale" springType="bouncy">
                <Button
                  onClick={refreshEmailStatus}
                  variant="primary"
                  size="lg"
                  isLoading={isRefreshing}
                  leftIcon={
                    <FiRefreshCw
                      className={`w-5 h-5 ${
                        isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'
                      } transition-transform duration-500`}
                    />
                  }
                  className="px-8 py-4"
                >
                  {isRefreshing ? 'Verificando...' : 'Verificar Status'}
                </Button>
              </AnimatedItem>

              <AnimatedItem hover="scale" springType="bouncy">
                <Link href="/contact">
                  <Button
                    variant="secondary"
                    size="lg"
                    leftIcon={<FiMessageCircle className="w-5 h-5" />}
                    className="px-8 py-4"
                  >
                    Entrar em Contato
                  </Button>
                </Link>
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
              {/* Current Status */}
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-amber/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                    <FiClock className="w-5 h-5 text-accent-amber" />
                  </div>
                  <h3 className="text-xl font-bold text-theme-primary classical-title">
                    Status Atual
                  </h3>
                </div>

                <div className="text-left space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                    <span className="text-theme-secondary text-sm">
                      Você foi adicionado pelo professor
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                    <span className="text-theme-secondary text-sm">
                      Aguardando aprovação do convite
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-theme-tertiary rounded-full"></div>
                    <span className="text-theme-secondary text-sm">
                      Acesso à área do aluno
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-theme-tertiary rounded-full"></div>
                    <span className="text-theme-secondary text-sm">
                      Funcionalidades completas
                    </span>
                  </div>
                </div>
              </AnimatedCard>

              {/* After approval */}
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                    <FiUserCheck className="w-5 h-5 text-accent-green" />
                  </div>
                  <h3 className="text-xl font-bold text-theme-primary classical-title">
                    Após a Aprovação
                  </h3>
                </div>

                <div className="text-left space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                    <span className="text-theme-secondary text-sm">
                      Visualizar cronograma de aulas
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                    <span className="text-theme-secondary text-sm">
                      Acompanhar seu progresso musical
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                    <span className="text-theme-secondary text-sm">
                      Receber tarefas e feedbacks
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                    <span className="text-theme-secondary text-sm">
                      Acesso completo à plataforma
                    </span>
                  </div>
                </div>
              </AnimatedCard>
            </div>

            {/* Process Steps */}
            <AnimatedCard
              hover="lift"
              className="classical-card p-6 max-w-3xl mx-auto mb-8"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl flex items-center justify-center">
                  <FiChevronRight className="w-5 h-5 text-accent-blue" />
                </div>
                <h3 className="text-lg font-bold text-theme-primary classical-title">
                  Como Funciona o Processo
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-theme-elevated to-interactive-hover rounded-lg border border-accent-green/20">
                  <div className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <h4 className="font-medium text-theme-primary text-sm mb-1">
                    Professor Adiciona
                  </h4>
                  <p className="text-xs text-theme-tertiary">
                    Você foi cadastrado como aluno
                  </p>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-theme-elevated to-interactive-hover rounded-lg border border-accent-amber/20">
                  <div className="w-8 h-8 bg-accent-amber rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <h4 className="font-medium text-theme-primary text-sm mb-1">
                    Convite Pendente
                  </h4>
                  <p className="text-xs text-theme-tertiary">
                    Aguardando aprovação
                  </p>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-theme-elevated to-interactive-hover rounded-lg border border-theme-secondary/20">
                  <div className="w-8 h-8 bg-theme-tertiary rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <h4 className="font-medium text-theme-primary text-sm mb-1">
                    Professor Aprova
                  </h4>
                  <p className="text-xs text-theme-tertiary">
                    Convite aceito pelo professor
                  </p>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-theme-elevated to-interactive-hover rounded-lg border border-accent-blue/20">
                  <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-sm font-bold">4</span>
                  </div>
                  <h4 className="font-medium text-theme-primary text-sm mb-1">
                    Acesso Liberado
                  </h4>
                  <p className="text-xs text-theme-tertiary">Aluno ativo!</p>
                </div>
              </div>
            </AnimatedCard>

            {/* What you can do now */}
            <AnimatedCard
              hover="lift"
              className="classical-card p-6 max-w-3xl mx-auto mb-8"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                  <FiUserCheck className="w-5 h-5 text-accent-green" />
                </div>
                <h3 className="text-lg font-bold text-theme-primary classical-title">
                  O que você pode fazer enquanto aguarda
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-left">
                  <h4 className="font-semibold text-theme-primary mb-3">
                    Na plataforma:
                  </h4>
                  <div className="space-y-2">
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
                        Criar sua lista de favoritos
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                      <span className="text-theme-secondary text-sm">
                        Personalizar seu perfil
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <h4 className="font-semibold text-theme-primary mb-3">
                    Para acelerar o processo:
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                      <span className="text-theme-secondary text-sm">
                        Entre em contato com seu professor
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                      <span className="text-theme-secondary text-sm">
                        Confirme que ele tem seu email correto
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                      <span className="text-theme-secondary text-sm">
                        Peça para ele aprovar seu convite
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                      <span className="text-theme-secondary text-sm">
                        Aguarde a notificação de aprovação
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Help Info */}
            <AnimatedCard
              hover="lift"
              className="classical-card p-6 max-w-3xl mx-auto"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-purple/20 to-accent-red/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiAlertTriangle className="w-5 h-5 text-accent-purple" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-bold text-theme-primary mb-3 classical-title">
                    Precisa de ajuda?
                  </h3>
                  <div className="space-y-2 text-sm text-theme-secondary">
                    <p>• O processo depende da aprovação do seu professor</p>
                    <p>• Entre em contato diretamente com ele se possível</p>
                    <p>• Verifique se ele tem o email correto</p>
                    <p>• Nossa equipe pode ajudar em casos especiais</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/contact"
                      className="inline-flex items-center space-x-2 text-brand-primary hover:text-brand-secondary transition-colors font-medium"
                    >
                      <FiMessageCircle className="w-4 h-4" />
                      <span>Entrar em contato com suporte</span>
                      <FiChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Quote */}
            <AnimatedItem direction="up" springType="gentle">
              <div className="mt-12 p-6 classical-card-simple max-w-2xl mx-auto">
                <blockquote className="text-lg text-theme-secondary italic mb-4 leading-relaxed">
                  &quot;A música não é apenas um entretenimento, é um meio de
                  conhecimento que nos ensina sobre nós mesmos e sobre o
                  mundo.&quot;
                </blockquote>
                <cite className="text-brand-primary font-semibold">
                  — Daniel Barenboim
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
          <FiClock className="w-8 h-8 text-brand-primary" />
        </div>
      </div>
      <Toaster
        position="top-center"
        containerClassName="toast-container"
        toastOptions={{
          duration: 4000,
          className: 'toast-item',
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            backdropFilter: 'blur(8px)',
            maxWidth: '400px',
          },
          success: {
            iconTheme: {
              primary: 'var(--accent-green)',
              secondary: 'white',
            },
            style: {
              border: '1px solid var(--accent-green)',
              background:
                'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(34, 197, 94, 0.05) 100%)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--accent-red)',
              secondary: 'white',
            },
            style: {
              border: '1px solid var(--accent-red)',
              background:
                'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(239, 68, 68, 0.05) 100%)',
            },
          },
          loading: {
            iconTheme: {
              primary: 'var(--brand-primary)',
              secondary: 'white',
            },
            style: {
              border: '1px solid var(--brand-primary)',
              background:
                'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(99, 102, 241, 0.05) 100%)',
            },
          },
        }}
      />
    </>
  );
}
