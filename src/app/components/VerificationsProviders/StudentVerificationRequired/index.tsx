// app/components/StudentVerificationRequired.tsx
'use client';

import Link from 'next/link';
import {
  PiArrowsClockwise,
  PiCaretRight,
  PiChatCircle,
  PiClock,
  PiEnvelopeSimple,
  PiHouse,
  PiMusicNotes,
  PiUserCheck,
  PiWarning,
} from 'react-icons/pi';
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
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

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
                  <PiClock className="w-16 h-16 text-accent-amber" />
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
                  <PiEnvelopeSimple className="w-6 h-6 text-accent-amber" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-bold text-theme-primary mb-3 classical-title">
                    {userName ? `Olá, ${userName}!` : 'Convite Pendente'}
                  </h3>
                  <Stack gap={3}>
                    <p className="text-theme-secondary">
                      <strong className="text-brand-primary">Seu Email:</strong>{' '}
                      {userEmail}
                    </p>
                    <Text papel="rotulo" tom="suave" as="p">
                      Você foi adicionado como aluno por um professor da
                      plataforma Opus Atlas. Para acessar sua área do aluno, é
                      necessário que o você aprove seu convite. Isso garante que
                      apenas alunos autorizados tenham acesso às informações
                      pedagógicas.
                    </Text>
                  </Stack>
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
                    <PiArrowsClockwise
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
                    leftIcon={<PiChatCircle className="w-5 h-5" />}
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
                      <PiHouse className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
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
                <Inline gap={3} className="mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-amber/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                    <PiClock className="w-5 h-5 text-accent-amber" />
                  </div>
                  <h3 className="text-xl font-bold text-theme-primary classical-title">
                    Status Atual
                  </h3>
                </Inline>

                <Stack gap={3} className="text-left">
                  <Inline gap={2}>
                    <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                    <Text papel="rotulo" tom="suave">
                      Você foi adicionado pelo professor
                    </Text>
                  </Inline>
                  <Inline gap={2}>
                    <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                    <Text papel="rotulo" tom="suave">
                      Aguardando aprovação do convite
                    </Text>
                  </Inline>
                  <Inline gap={2}>
                    <div className="w-2 h-2 bg-theme-tertiary rounded-full"></div>
                    <Text papel="rotulo" tom="suave">
                      Acesso à área do aluno
                    </Text>
                  </Inline>
                  <Inline gap={2}>
                    <div className="w-2 h-2 bg-theme-tertiary rounded-full"></div>
                    <Text papel="rotulo" tom="suave">
                      Funcionalidades completas
                    </Text>
                  </Inline>
                </Stack>
              </AnimatedCard>

              {/* After approval */}
              <AnimatedCard hover="lift" className="classical-card p-6">
                <Inline gap={3} className="mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                    <PiUserCheck className="w-5 h-5 text-accent-green" />
                  </div>
                  <h3 className="text-xl font-bold text-theme-primary classical-title">
                    Após a Aprovação
                  </h3>
                </Inline>

                <Stack gap={2} className="text-left">
                  <Inline gap={2}>
                    <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                    <Text papel="rotulo" tom="suave">
                      Visualizar cronograma de aulas
                    </Text>
                  </Inline>
                  <Inline gap={2}>
                    <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                    <Text papel="rotulo" tom="suave">
                      Acompanhar seu progresso musical
                    </Text>
                  </Inline>
                  <Inline gap={2}>
                    <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                    <Text papel="rotulo" tom="suave">
                      Receber tarefas e feedbacks
                    </Text>
                  </Inline>
                  <Inline gap={2}>
                    <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                    <Text papel="rotulo" tom="suave">
                      Acesso completo à plataforma
                    </Text>
                  </Inline>
                </Stack>
              </AnimatedCard>
            </div>

            {/* Process Steps */}
            <AnimatedCard
              hover="lift"
              className="classical-card p-6 max-w-3xl mx-auto mb-8"
            >
              <Inline gap={3} className="mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl flex items-center justify-center">
                  <PiCaretRight className="w-5 h-5 text-accent-blue" />
                </div>
                <h3 className="text-lg font-bold text-theme-primary classical-title">
                  Como Funciona o Processo
                </h3>
              </Inline>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-theme-elevated to-interactive-hover rounded-lg border border-accent-green/20">
                  <div className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <h4 className="font-medium text-theme-primary text-sm mb-1">
                    Professor Adiciona
                  </h4>
                  <Text papel="legenda" tom="fraco" as="p">
                    Você foi cadastrado como aluno
                  </Text>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-theme-elevated to-interactive-hover rounded-lg border border-accent-amber/20">
                  <div className="w-8 h-8 bg-accent-amber rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <h4 className="font-medium text-theme-primary text-sm mb-1">
                    Convite Pendente
                  </h4>
                  <Text papel="legenda" tom="fraco" as="p">
                    Aguardando aprovação
                  </Text>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-theme-elevated to-interactive-hover rounded-lg border border-theme-secondary/20">
                  <div className="w-8 h-8 bg-theme-tertiary rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <h4 className="font-medium text-theme-primary text-sm mb-1">
                    Professor Aprova
                  </h4>
                  <Text papel="legenda" tom="fraco" as="p">
                    Convite aceito pelo professor
                  </Text>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-theme-elevated to-interactive-hover rounded-lg border border-accent-blue/20">
                  <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-sm font-bold">4</span>
                  </div>
                  <h4 className="font-medium text-theme-primary text-sm mb-1">
                    Acesso Liberado
                  </h4>
                  <Text papel="legenda" tom="fraco" as="p">
                    Aluno ativo!
                  </Text>
                </div>
              </div>
            </AnimatedCard>

            {/* What you can do now */}
            <AnimatedCard
              hover="lift"
              className="classical-card p-6 max-w-3xl mx-auto mb-8"
            >
              <Inline gap={3} className="mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                  <PiUserCheck className="w-5 h-5 text-accent-green" />
                </div>
                <h3 className="text-lg font-bold text-theme-primary classical-title">
                  O que você pode fazer enquanto aguarda
                </h3>
              </Inline>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Stack gap={3} className="text-left">
                  <h4 className="font-semibold text-theme-primary">
                    Na plataforma:
                  </h4>
                  <Stack gap={2}>
                    <Inline gap={2}>
                      <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                      <Text papel="rotulo" tom="suave">
                        Explorar compositores e obras
                      </Text>
                    </Inline>
                    <Inline gap={2}>
                      <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                      <Text papel="rotulo" tom="suave">
                        Descobrir partituras gratuitas
                      </Text>
                    </Inline>
                    <Inline gap={2}>
                      <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                      <Text papel="rotulo" tom="suave">
                        Criar sua lista de favoritos
                      </Text>
                    </Inline>
                    <Inline gap={2}>
                      <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                      <Text papel="rotulo" tom="suave">
                        Personalizar seu perfil
                      </Text>
                    </Inline>
                  </Stack>
                </Stack>

                <Stack gap={3} className="text-left">
                  <h4 className="font-semibold text-theme-primary">
                    Para acelerar o processo:
                  </h4>
                  <Stack gap={2}>
                    <Inline gap={2}>
                      <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                      <Text papel="rotulo" tom="suave">
                        Entre em contato com seu professor
                      </Text>
                    </Inline>
                    <Inline gap={2}>
                      <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                      <Text papel="rotulo" tom="suave">
                        Confirme que ele tem seu email correto
                      </Text>
                    </Inline>
                    <Inline gap={2}>
                      <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                      <Text papel="rotulo" tom="suave">
                        Peça para ele aprovar seu convite
                      </Text>
                    </Inline>
                    <Inline gap={2}>
                      <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                      <Text papel="rotulo" tom="suave">
                        Aguarde a notificação de aprovação
                      </Text>
                    </Inline>
                  </Stack>
                </Stack>
              </div>
            </AnimatedCard>

            {/* Help Info */}
            <AnimatedCard
              hover="lift"
              className="classical-card p-6 max-w-3xl mx-auto"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-purple/20 to-accent-red/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PiWarning className="w-5 h-5 text-accent-purple" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-bold text-theme-primary mb-3 classical-title">
                    Precisa de ajuda?
                  </h3>
                  <Text
                    papel="rotulo"
                    tom="suave"
                    as="div"
                    className="space-y-2"
                  >
                    <p>• O processo depende da aprovação do seu professor</p>
                    <p>• Entre em contato diretamente com ele se possível</p>
                    <p>• Verifique se ele tem o email correto</p>
                    <p>• Nossa equipe pode ajudar em casos especiais</p>
                  </Text>
                  <div className="mt-4">
                    <Link
                      href="/contact"
                      className="inline-flex items-center space-x-2 text-brand-primary hover:text-brand-secondary transition-colors font-medium"
                    >
                      <PiChatCircle className="w-4 h-4" />
                      <span>Entrar em contato com suporte</span>
                      <PiCaretRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Quote */}
            <AnimatedItem direction="up" springType="gentle">
              <Card nivel={2} className="mt-12 max-w-2xl mx-auto">
                <blockquote className="text-lg text-theme-secondary italic mb-4 leading-relaxed">
                  &quot;A música não é apenas um entretenimento, é um meio de
                  conhecimento que nos ensina sobre nós mesmos e sobre o
                  mundo.&quot;
                </blockquote>
                <cite className="text-brand-primary font-semibold">
                  — Daniel Barenboim
                </cite>
              </Card>
            </AnimatedItem>
          </AnimatedContainer>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 w-12 h-12 bg-accent-amber/10 rounded-2xl flex items-center justify-center opacity-40">
          <PiMusicNotes className="w-6 h-6 text-accent-amber" />
        </div>

        <div className="absolute bottom-4 right-4 w-16 h-16 bg-brand-gradient/10 rounded-3xl flex items-center justify-center opacity-50">
          <PiClock className="w-8 h-8 text-brand-primary" />
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
