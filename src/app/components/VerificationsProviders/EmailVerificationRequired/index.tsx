// app/components/VerificationsProviders/EmailVerificationRequired.tsx
'use client';

import Link from 'next/link';
import {
  PiArrowsClockwise,
  PiCheckCircle,
  PiEnvelopeSimple,
  PiHouse,
  PiMusicNotes,
  PiShield,
  PiWarning,
} from 'react-icons/pi';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
} from '../../animation/AnimatedComponents';
import AnimatedMusicalNotes from '../../AnimatedMusicalNotes';
import Button from '../../Common/Button';
import { useEmailVerification } from '@/app/hooks/useEmailVerification';
import { useEmailRefresh } from '@/app/hooks/useEmailRefresh';
import { useTranslation } from '@/app/context/TranslationContext';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

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
  const { isRefreshing, refreshEmailStatus } = useEmailRefresh();

  const { t } = useTranslation({
    sections: ['components/email-verification'],
  });

  return (
    <PageContainer showBackground={true}>
      {/* Background Pattern */}
      <AnimatedMusicalNotes />

      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-theme-glow">
                <PiShield className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              {t('page_title')}
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle medida-texto mx-auto">
              {t('page_subtitle')}
            </p>
          </div>
        </AnimatedItem>

        {/* Main Info Card */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard
            hover="lift"
            className="classical-card p-8 mb-8 max-w-2xl mx-auto"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <PiEnvelopeSimple className="w-6 h-6" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-bold text-theme-primary mb-3 classical-title">
                  {userName
                    ? t('greeting_with_name', { userName })
                    : t('greeting_without_name')}
                </h3>
                <Stack gap={3}>
                  <p className="text-theme-secondary">
                    <strong className="text-ouro-texto">
                      {t('user_email_label')}
                    </strong>{' '}
                    {userEmail}
                  </p>
                  <Text papel="rotulo" tom="suave" as="p">
                    {t('security_message')}
                  </Text>
                </Stack>
              </div>
            </div>
          </AnimatedCard>
        </AnimatedItem>

        {/* Email Status */}
        {emailSent && (
          <AnimatedItem direction="up" springType="bouncy">
            <div className="bg-theme-elevated rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <Inline gap={3} className="justify-center">
                <PiCheckCircle className="w-5 h-5" />
                <p className="font-medium">{t('email_sent_success')}</p>
              </Inline>
              <p className="text-sm text-center mt-2 opacity-80">
                {t('email_sent_instructions')}
              </p>
            </div>
          </AnimatedItem>
        )}

        {/* Action Buttons */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              onClick={resendEmail}
              variant="primary"
              size="lg"
              isLoading={isSending}
              leftIcon={
                <PiArrowsClockwise
                  className={`w-5 h-5 ${
                    isSending ? 'animate-spin' : 'group-hover:rotate-180'
                  } transition-transform duration-500`}
                />
              }
              className="px-8 py-4"
            >
              {emailSent ? t('button_resend_email') : t('button_send_email')}
            </Button>
            <Button
              onClick={refreshEmailStatus}
              variant="secondary"
              size="lg"
              isLoading={isRefreshing}
              leftIcon={<PiCheckCircle />}
            >
              {isRefreshing
                ? t('button_verifying')
                : t('button_already_confirmed')}
            </Button>
            <Link href="/" className="w-full md:w-auto">
              <Button
                variant="secondary"
                className="w-full"
                size="lg"
                leftIcon={
                  <PiHouse className="w-5 h-5 group-hover:scale-110 self-center transition-transform duration-300" />
                }
              >
                {t('button_back_home')}
              </Button>
            </Link>
          </div>
        </AnimatedItem>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* What you can do */}
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard hover="lift" className="classical-card p-6">
              <Inline gap={3} className="mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <PiCheckCircle className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-theme-primary classical-title">
                  {t('current_permissions_title')}
                </h3>
              </Inline>

              <Stack gap={2} className="text-left">
                <Inline gap={2}>
                  <div className="w-2 h-2 rounded-full"></div>
                  <Text papel="rotulo" tom="suave">
                    {t('current_permission_explore')}
                  </Text>
                </Inline>
                <Inline gap={2}>
                  <div className="w-2 h-2 rounded-full"></div>
                  <Text papel="rotulo" tom="suave">
                    {t('current_permission_discover')}
                  </Text>
                </Inline>
                <Inline gap={2}>
                  <div className="w-2 h-2 rounded-full"></div>
                  <Text papel="rotulo" tom="suave">
                    {t('current_permission_favorites')}
                  </Text>
                </Inline>
                <Inline gap={2}>
                  <div className="w-2 h-2 rounded-full"></div>
                  <Text papel="rotulo" tom="suave">
                    {t('current_permission_profile')}
                  </Text>
                </Inline>
              </Stack>
            </AnimatedCard>
          </AnimatedItem>

          {/* After verification */}
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard hover="lift" className="classical-card p-6">
              <Inline gap={3} className="mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <PiShield className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-theme-primary classical-title">
                  {t('after_verification_title')}
                </h3>
              </Inline>

              <Stack gap={2} className="text-left">
                <Inline gap={2}>
                  <div className="w-2 h-2 rounded-full"></div>
                  <Text papel="rotulo" tom="suave">
                    {t('after_verification_composers')}
                  </Text>
                </Inline>
                <Inline gap={2}>
                  <div className="w-2 h-2 rounded-full"></div>
                  <Text papel="rotulo" tom="suave">
                    {t('after_verification_scores')}
                  </Text>
                </Inline>
                <Inline gap={2}>
                  <div className="w-2 h-2 rounded-full"></div>
                  <Text papel="rotulo" tom="suave">
                    {t('after_verification_works')}
                  </Text>
                </Inline>
                <Inline gap={2}>
                  <div className="w-2 h-2 rounded-full"></div>
                  <Text papel="rotulo" tom="suave">
                    {t('after_verification_full_access')}
                  </Text>
                </Inline>
              </Stack>
            </AnimatedCard>
          </AnimatedItem>
        </div>

        {/* Help Info */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard
            hover="lift"
            className="classical-card p-6 max-w-3xl mx-auto"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                <PiWarning className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-bold text-theme-primary mb-3 classical-title">
                  {t('help_title')}
                </h3>
                <Text papel="rotulo" tom="suave" as="div" className="space-y-2">
                  <p>• {t('help_check_spam')}</p>
                  <p>• {t('help_wait_minutes')}</p>
                  <p>• {t('help_same_browser')}</p>
                  <p>• {t('help_contact_support')}</p>
                </Text>
              </div>
            </div>
          </AnimatedCard>
        </AnimatedItem>

        {/* Quote */}
        <AnimatedItem direction="up" springType="gentle">
          <Card nivel={2} className="mt-12 max-w-2xl mx-auto">
            <blockquote className="text-lg text-theme-secondary italic mb-4 leading-relaxed">
              &quot;{t('quote_text')}&quot;
            </blockquote>
            <cite className="text-ouro-texto font-semibold">
              — {t('quote_author')}
            </cite>
          </Card>
        </AnimatedItem>
      </AnimatedContainer>

      {/* Decorative Elements */}
      <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl flex items-center justify-center opacity-40">
        <PiMusicNotes className="w-6 h-6" />
      </div>

      <div className="absolute bottom-4 right-4 w-16 h-16 rounded-3xl flex items-center justify-center opacity-50">
        <PiEnvelopeSimple className="w-8 h-8 text-ouro-texto" />
      </div>
    </PageContainer>
  );
}
