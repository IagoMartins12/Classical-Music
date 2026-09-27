// app/newsletter/success/[token]/pageClient.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GiGrandPiano } from 'react-icons/gi';
import {
  PiArrowRight,
  PiCheckCircle,
  PiEnvelopeSimple,
  PiHeart,
  PiHouse,
  PiMusicNotes,
} from 'react-icons/pi';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  FloatingElement,
} from '../../../../components/animation/AnimatedComponents';
import { useTranslation } from '@/app/context/TranslationContext';
import { Text } from '@/app/components/ui/Text';

export default function NewsletterSuccessContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation({ sections: ['pages/newsletter'] });
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
          icon: <PiCheckCircle className="w-16 h-16 text-ok" />,
          title: t('success_confirmed_title'),
          subtitle: t('success_confirmed_subtitle'),
          message: t('success_confirmed_message'),
          buttonText: t('success_confirmed_button'),
          buttonHref: '/composers',
        };

      case 'subscribed':
        return {
          icon: <PiEnvelopeSimple className="w-16 h-16 text-aviso" />,
          title: t('success_subscribed_title'),
          subtitle: t('success_subscribed_subtitle'),
          message: t('success_subscribed_message'),
          buttonText: t('success_subscribed_button'),
          buttonHref: '#',
          showResend: true,
        };

      case 'already_unsubscribed':
        return {
          icon: <PiEnvelopeSimple className="w-16 h-16 text-atencao" />,
          title: t('success_already_unsubscribed_title'),
          subtitle: t('success_already_unsubscribed_subtitle'),
          message: t('success_already_unsubscribed_message'),
          buttonText: t('success_already_unsubscribed_button'),
          buttonHref: '/',
        };

      default:
        return {
          icon: <PiCheckCircle className="w-16 h-16 text-ok" />,
          title: t('success_default_title'),
          subtitle: t('success_default_subtitle'),
          message: t('success_default_message'),
          buttonText: t('success_default_button'),
          buttonHref: '/',
        };
    }
  };

  const content = getContent();

  if (!mounted) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse">{t('success_loading')}</div>
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
                <div className="inline-flex items-center justify-center w-24 h-24 bg-ouro/10 rounded-full mb-8">
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
                    <PiArrowRight className="w-5 h-5" />
                  </Link>

                  {content.showResend && (
                    <div className="pt-4">
                      <button
                        onClick={() => {
                          /* Implementar reenvio */
                        }}
                        className="text-brand-primary hover:text-ouro-texto font-medium"
                      >
                        {t('success_subscribed_resend')}
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
                      className="group classical-card p-6 hover:bg-sup-1 transition-all"
                    >
                      <PiMusicNotes className="w-8 h-8 text-brand-primary mb-3 mx-auto group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-theme-primary mb-2">
                        {t('success_explore_composers_title')}
                      </h3>
                      <Text papel="rotulo" tom="suave" as="p">
                        {t('success_explore_composers_description')}
                      </Text>
                    </Link>

                    <Link
                      href="/works"
                      className="group classical-card p-6 hover:bg-sup-1 transition-all"
                    >
                      <GiGrandPiano className="w-8 h-8 text-ouro-texto mb-3 mx-auto group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-theme-primary mb-2">
                        {t('success_works_title')}
                      </h3>
                      <Text papel="rotulo" tom="suave" as="p">
                        {t('success_works_description')}
                      </Text>
                    </Link>

                    <Link
                      href="/"
                      className="group classical-card p-6 hover:bg-sup-1 transition-all"
                    >
                      <PiHouse className="w-8 h-8 text-aviso mb-3 mx-auto group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-theme-primary mb-2">
                        {t('success_home_title')}
                      </h3>
                      <Text papel="rotulo" tom="suave" as="p">
                        {t('success_home_description')}
                      </Text>
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
        className="top-20 left-20 text-6xl text-ouro-texto/5"
        delay={0}
      >
        <PiMusicNotes />
      </FloatingElement>
      <FloatingElement
        className="bottom-20 right-20 text-5xl text-ok/5"
        delay={2}
      >
        <PiHeart />
      </FloatingElement>
    </PageContainer>
  );
}
