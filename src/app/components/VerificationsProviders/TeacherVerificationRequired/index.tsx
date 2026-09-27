// app/components/TeacherVerificationRequired.tsx
'use client';

import Link from 'next/link';
import {
  PiArrowsClockwise,
  PiCaretRight,
  PiChatCircle,
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
import Navbar from '../../Navbar';
import { Toaster } from 'react-hot-toast';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

interface TeacherVerificationRequiredProps {
  userEmail?: string | null;
  userName?: string | null;
}

export default function TeacherVerificationRequired({
  userEmail,
  userName,
}: TeacherVerificationRequiredProps) {
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
                <div className="w-32 h-32 mx-auto bg-aviso/20 rounded-full flex items-center justify-center classical-card border-2 border-aviso/30 shadow-theme-glow">
                  <PiUserCheck className="w-16 h-16 text-aviso" />
                </div>
              </div>
            </AnimatedItem>

            {/* Title */}
            <AnimatedItem direction="up" springType="bouncy">
              <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-6">
                Aguardando Aprovação
              </h1>
            </AnimatedItem>

            {/* Subtitle */}
            <AnimatedItem direction="up" springType="smooth">
              <p className="text-xl md:text-2xl text-theme-secondary mb-8 leading-relaxed">
                Seu convite para se tornar professor está sendo processado.
              </p>
            </AnimatedItem>

            {/* Main Info Card */}
            <AnimatedCard
              hover="lift"
              className="classical-card p-8 mb-8 max-w-2xl mx-auto"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-aviso/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PiEnvelopeSimple className="w-6 h-6 text-aviso" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-bold text-theme-primary mb-3 classical-title">
                    {userName ? `Olá, ${userName}!` : 'Aguardando Aprovação'}
                  </h3>
                  <Stack gap={3}>
                    <p className="text-theme-secondary">
                      <strong className="text-brand-primary">Seu Email:</strong>{' '}
                      {userEmail}
                    </p>
                    <Text papel="rotulo" tom="suave" as="p">
                      Você recebeu um convite para se tornar professor na
                      plataforma Opus Atlas. Para acessar todas as
                      funcionalidades da área do professor, é necessário aceitar
                      o convite que foi enviado para seu email.
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
                  {isRefreshing ? 'Verificando...' : 'Já Aceitei o Convite'}
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
                  <div className="w-10 h-10 bg-aviso/20 rounded-xl flex items-center justify-center">
                    <PiEnvelopeSimple className="w-5 h-5 text-aviso" />
                  </div>
                  <h3 className="text-xl font-bold text-theme-primary classical-title">
                    Status Atual
                  </h3>
                </Inline>

                <Stack gap={3} className="text-left">
                  <Inline gap={2}>
                    <div className="w-2 h-2 bg-aviso rounded-full"></div>
                    <Text papel="rotulo" tom="suave">
                      Convite enviado para seu email
                    </Text>
                  </Inline>
                  <Inline gap={2}>
                    <div className="w-2 h-2 bg-atencao rounded-full"></div>
                    <Text papel="rotulo" tom="suave">
                      Aguardando sua aceitação
                    </Text>
                  </Inline>
                  <Inline gap={2}>
                    <div className="w-2 h-2 bg-theme-tertiary rounded-full"></div>
                    <Text papel="rotulo" tom="suave">
                      Aprovação do administrador
                    </Text>
                  </Inline>
                  <Inline gap={2}>
                    <div className="w-2 h-2 bg-theme-tertiary rounded-full"></div>
                    <Text papel="rotulo" tom="suave">
                      Acesso completo liberado
                    </Text>
                  </Inline>
                </Stack>
              </AnimatedCard>

              {/* After approval */}
              <AnimatedCard hover="lift" className="classical-card p-6">
                <Inline gap={3} className="mb-4">
                  <div className="w-10 h-10 bg-ok/20 rounded-xl flex items-center justify-center">
                    <PiUserCheck className="w-5 h-5 text-ok" />
                  </div>
                  <h3 className="text-xl font-bold text-theme-primary classical-title">
                    Após a Aprovação
                  </h3>
                </Inline>

                <Stack gap={2} className="text-left">
                  <Inline gap={2}>
                    <div className="w-2 h-2 bg-ok rounded-full"></div>
                    <Text papel="rotulo" tom="suave">
                      Gerenciar alunos e aulas
                    </Text>
                  </Inline>
                  <Inline gap={2}>
                    <div className="w-2 h-2 bg-ok rounded-full"></div>
                    <Text papel="rotulo" tom="suave">
                      Criar cronogramas personalizados
                    </Text>
                  </Inline>
                  <Inline gap={2}>
                    <div className="w-2 h-2 bg-ok rounded-full"></div>
                    <Text papel="rotulo" tom="suave">
                      Acompanhar progresso dos alunos
                    </Text>
                  </Inline>
                  <Inline gap={2}>
                    <div className="w-2 h-2 bg-ok rounded-full"></div>
                    <Text papel="rotulo" tom="suave">
                      Sistema completo de avaliação
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
                <div className="w-10 h-10 bg-ouro/20 rounded-xl flex items-center justify-center">
                  <PiCaretRight className="w-5 h-5 text-ouro-texto" />
                </div>
                <h3 className="text-lg font-bold text-theme-primary classical-title">
                  Como Funciona o Processo
                </h3>
              </Inline>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-sup-elevada rounded-lg border border-linha/20">
                  <div className="w-8 h-8 bg-aviso rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <h4 className="font-medium text-theme-primary text-sm mb-1">
                    Convite Enviado
                  </h4>
                  <Text papel="legenda" tom="fraco" as="p">
                    Email com link de aceitação
                  </Text>
                </div>

                <div className="text-center p-4 bg-sup-elevada rounded-lg border border-atencao/20">
                  <div className="w-8 h-8 bg-atencao rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <h4 className="font-medium text-theme-primary text-sm mb-1">
                    Você Aceita
                  </h4>
                  <Text papel="legenda" tom="fraco" as="p">
                    Clique no link do email
                  </Text>
                </div>

                <div className="text-center p-4 bg-sup-elevada rounded-lg border border-linha/20">
                  <div className="w-8 h-8 bg-theme-tertiary rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <h4 className="font-medium text-theme-primary text-sm mb-1">
                    Aprovação
                  </h4>
                  <Text papel="legenda" tom="fraco" as="p">
                    Admin aprova seu perfil
                  </Text>
                </div>

                <div className="text-center p-4 bg-sup-elevada rounded-lg border border-ok/20">
                  <div className="w-8 h-8 bg-ok rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-sm font-bold">4</span>
                  </div>
                  <h4 className="font-medium text-theme-primary text-sm mb-1">
                    Acesso Liberado
                  </h4>
                  <Text papel="legenda" tom="fraco" as="p">
                    Professor ativo!
                  </Text>
                </div>
              </div>
            </AnimatedCard>

            {/* Help Info */}
            <AnimatedCard
              hover="lift"
              className="classical-card p-6 max-w-3xl mx-auto"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-ouro/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PiWarning className="w-5 h-5 text-ouro-texto" />
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
                    <p>• Verifique sua pasta de spam/lixo eletrônico</p>
                    <p>
                      • O email do convite pode ter sido enviado há alguns dias
                    </p>
                    <p>• Entre em contato conosco se não encontrar o email</p>
                    <p>• Nossa equipe estará pronta para ajudar no processo</p>
                  </Text>
                  <div className="mt-4">
                    <Link
                      href="/contact"
                      className="inline-flex items-center space-x-2 text-brand-primary hover:text-ouro-texto transition-colors font-medium"
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
                  &quot;Ensinar é um exercício de imortalidade. De alguma forma
                  continuamos a viver naqueles cujos olhos aprenderam a ver o
                  mundo pela magia da nossa palavra.&quot;
                </blockquote>
                <cite className="text-brand-primary font-semibold">
                  — Rubem Alves
                </cite>
              </Card>
            </AnimatedItem>
          </AnimatedContainer>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 w-12 h-12 bg-aviso/10 rounded-2xl flex items-center justify-center opacity-40">
          <PiMusicNotes className="w-6 h-6 text-aviso" />
        </div>

        <div className="absolute bottom-4 right-4 w-16 h-16 bg-ouro/10 rounded-3xl flex items-center justify-center opacity-50">
          <PiUserCheck className="w-8 h-8 text-brand-primary" />
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
