// app/newsletter/success/NewsletterSuccessContent.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FiCheckCircle,
  FiMail,
  FiHeart,
  FiMusic,
  FiArrowRight,
  FiHome,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  FloatingElement,
} from '../../../../components/animation/AnimatedComponents';

export default function NewsletterSuccessContent() {
  const searchParams = useSearchParams();
  const [type, setType] = useState('confirmed');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const typeParam = searchParams.get('type');
    if (typeParam) {
      setType(typeParam);
    }
  }, [searchParams]);

  const getContent = () => {
    switch (type) {
      case 'confirmed':
        return {
          icon: <FiCheckCircle className="w-16 h-16 text-accent-green" />,
          title: 'Email Confirmado!',
          subtitle: 'Sua inscrição foi ativada com sucesso',
          message:
            'Agora você receberá nossa newsletter com as melhores novidades sobre música clássica, novos compositores, obras e dicas de estudo.',
          buttonText: 'Explorar a Plataforma',
          buttonHref: '/composers',
        };

      case 'subscribed':
        return {
          icon: <FiMail className="w-16 h-16 text-accent-blue" />,
          title: 'Inscrição Realizada!',
          subtitle: 'Verifique seu email para confirmar',
          message:
            'Enviamos um email de confirmação. Clique no link para ativar sua inscrição e começar a receber nossa newsletter.',
          buttonText: 'Verificar Email',
          buttonHref: '#',
          showResend: true,
        };

      case 'already_unsubscribed':
        return {
          icon: <FiMail className="w-16 h-16 text-accent-amber" />,
          title: 'Já Cancelado',
          subtitle: 'Esta inscrição já foi cancelada anteriormente',
          message:
            'Se deseja receber nossa newsletter novamente, você pode se inscrever na página inicial.',
          buttonText: 'Voltar ao Início',
          buttonHref: '/',
        };

      default:
        return {
          icon: <FiCheckCircle className="w-16 h-16 text-accent-green" />,
          title: 'Sucesso!',
          subtitle: 'Operação realizada com sucesso',
          message: 'Sua solicitação foi processada.',
          buttonText: 'Voltar ao Início',
          buttonHref: '/',
        };
    }
  };

  const content = getContent();

  if (!mounted) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse">Carregando...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true} className="classical-theme">
      <section className="py-20">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="section-wrap">
            <div className="max-w-3xl mx-auto text-center">
              {/* Icon */}
              <AnimatedItem direction="scale" springType="bouncy">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-brand-primary/10 to-accent-green/10 rounded-full mb-8">
                  {content.icon}
                </div>
              </AnimatedItem>

              {/* Title */}
              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-5xl font-bold classical-title text-theme-primary mb-4">
                  {content.title}
                </h1>
              </AnimatedItem>

              {/* Subtitle */}
              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-brand-primary font-medium mb-6">
                  {content.subtitle}
                </p>
              </AnimatedItem>

              {/* Message */}
              <AnimatedItem direction="up" springType="gentle">
                <p className="text-lg text-theme-secondary leading-relaxed mb-8 max-w-2xl mx-auto">
                  {content.message}
                </p>
              </AnimatedItem>

              {/* Actions */}
              <AnimatedItem direction="up" springType="gentle">
                <div className="space-y-4">
                  <Link
                    href={content.buttonHref}
                    className="btn-classical-primary inline-flex items-center space-x-3 px-8 py-4"
                  >
                    <span>{content.buttonText}</span>
                    <FiArrowRight className="w-5 h-5" />
                  </Link>

                  {content.showResend && (
                    <div className="pt-4">
                      <button
                        onClick={() => {
                          /* Implementar reenvio */
                        }}
                        className="text-brand-primary hover:text-brand-secondary font-medium"
                      >
                        Não recebeu o email? Reenviar
                      </button>
                    </div>
                  )}
                </div>
              </AnimatedItem>

              {/* Additional Links */}
              <AnimatedItem direction="up" springType="gentle">
                <div className="mt-12 pt-8 border-t border-theme-secondary">
                  <div className="grid md:grid-cols-3 gap-6">
                    <Link
                      href="/composers"
                      className="group classical-card p-6 hover:bg-theme-secondary transition-all"
                    >
                      <FiMusic className="w-8 h-8 text-brand-primary mb-3 mx-auto group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-theme-primary mb-2">
                        Explorar Compositores
                      </h3>
                      <p className="text-sm text-theme-secondary">
                        Descubra grandes mestres da música clássica
                      </p>
                    </Link>

                    <Link
                      href="/works"
                      className="group classical-card p-6 hover:bg-theme-secondary transition-all"
                    >
                      <GiGrandPiano className="w-8 h-8 text-accent-purple mb-3 mx-auto group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-theme-primary mb-2">
                        Obras Clássicas
                      </h3>
                      <p className="text-sm text-theme-secondary">
                        Explore nossa coleção de partituras
                      </p>
                    </Link>

                    <Link
                      href="/"
                      className="group classical-card p-6 hover:bg-theme-secondary transition-all"
                    >
                      <FiHome className="w-8 h-8 text-accent-blue mb-3 mx-auto group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-theme-primary mb-2">
                        Página Inicial
                      </h3>
                      <p className="text-sm text-theme-secondary">
                        Voltar para a página principal
                      </p>
                    </Link>
                  </div>
                </div>
              </AnimatedItem>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Floating Elements */}
      <FloatingElement
        className="top-20 left-20 text-6xl text-brand-primary/5"
        delay={0}
      >
        <GiMusicalNotes />
      </FloatingElement>
      <FloatingElement
        className="bottom-20 right-20 text-5xl text-accent-green/5"
        delay={2}
      >
        <FiHeart />
      </FloatingElement>
    </PageContainer>
  );
}
