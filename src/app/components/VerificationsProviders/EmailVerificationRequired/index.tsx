// app/components/VerificationsProviders/EmailVerificationRequired.tsx
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
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiShield className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              {t('page_title')}
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
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
              <div className="w-12 h-12 bg-gradient-to-br from-accent-blue/20 to-accent-green/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiMail className="w-6 h-6 text-accent-blue" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-bold text-theme-primary mb-3 classical-title">
                  {userName
                    ? t('greeting_with_name', { userName })
                    : t('greeting_without_name')}
                </h3>
                <div className="space-y-3">
                  <p className="text-theme-secondary">
                    <strong className="text-brand-primary">
                      {t('user_email_label')}
                    </strong>{' '}
                    {userEmail}
                  </p>
                  <p className="text-theme-secondary text-sm">
                    {t('security_message')}
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </AnimatedItem>

        {/* Email Status */}
        {emailSent && (
          <AnimatedItem direction="up" springType="bouncy">
            <div className="bg-theme-elevated border-accent-green rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <FiCheckCircle className="w-5 h-5 text-accent-green" />
                <p className="text-accent-green font-medium">
                  {t('email_sent_success')}
                </p>
              </div>
              <p className="text-accent-green text-sm text-center mt-2 opacity-80">
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
                <FiRefreshCw
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
              leftIcon={<FiCheckCircle />}
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
                  <FiHome className="w-5 h-5 group-hover:scale-110 self-center transition-transform duration-300" />
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
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                  <FiCheckCircle className="w-5 h-5 text-accent-green" />
                </div>
                <h3 className="text-xl font-bold text-theme-primary classical-title">
                  {t('current_permissions_title')}
                </h3>
              </div>

              <div className="text-left space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                  <span className="text-theme-secondary text-sm">
                    {t('current_permission_explore')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                  <span className="text-theme-secondary text-sm">
                    {t('current_permission_discover')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                  <span className="text-theme-secondary text-sm">
                    {t('current_permission_favorites')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                  <span className="text-theme-secondary text-sm">
                    {t('current_permission_profile')}
                  </span>
                </div>
              </div>
            </AnimatedCard>
          </AnimatedItem>

          {/* After verification */}
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard hover="lift" className="classical-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-amber/20 to-accent-purple/20 rounded-xl flex items-center justify-center">
                  <FiShield className="w-5 h-5 text-accent-amber" />
                </div>
                <h3 className="text-xl font-bold text-theme-primary classical-title">
                  {t('after_verification_title')}
                </h3>
              </div>

              <div className="text-left space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                  <span className="text-theme-secondary text-sm">
                    {t('after_verification_composers')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                  <span className="text-theme-secondary text-sm">
                    {t('after_verification_scores')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                  <span className="text-theme-secondary text-sm">
                    {t('after_verification_works')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
                  <span className="text-theme-secondary text-sm">
                    {t('after_verification_full_access')}
                  </span>
                </div>
              </div>
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
              <div className="w-10 h-10 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiAlertTriangle className="w-5 h-5 text-accent-blue" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-bold text-theme-primary mb-3 classical-title">
                  {t('help_title')}
                </h3>
                <div className="space-y-2 text-sm text-theme-secondary">
                  <p>• {t('help_check_spam')}</p>
                  <p>• {t('help_wait_minutes')}</p>
                  <p>• {t('help_same_browser')}</p>
                  <p>• {t('help_contact_support')}</p>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </AnimatedItem>

        {/* Quote */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="mt-12 p-6 classical-card-simple max-w-2xl mx-auto">
            <blockquote className="text-lg text-theme-secondary italic mb-4 leading-relaxed">
              &quot;{t('quote_text')}&quot;
            </blockquote>
            <cite className="text-brand-primary font-semibold">
              — {t('quote_author')}
            </cite>
          </div>
        </AnimatedItem>
      </AnimatedContainer>

      {/* Decorative Elements */}
      <div className="absolute top-4 left-4 w-12 h-12 bg-accent-amber/10 rounded-2xl flex items-center justify-center opacity-40">
        <GiMusicalNotes className="w-6 h-6 text-accent-amber" />
      </div>

      <div className="absolute bottom-4 right-4 w-16 h-16 bg-brand-gradient/10 rounded-3xl flex items-center justify-center opacity-50">
        <FiMail className="w-8 h-8 text-brand-primary" />
      </div>
    </PageContainer>
  );
}
