// app/newsletter/unsubscribe/[token]/pageclient.tsx
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { FiX, FiCheck, FiArrowRight } from 'react-icons/fi';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
} from '../../../../components/animation/AnimatedComponents';
import Input from '@/app/components/Common/Inputs';
import { useTranslation } from '@/app/context/TranslationContext';

export default function UnsubscribePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { t } = useTranslation({ sections: ['pages/newsletter'] });

  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'confirm' | 'feedback' | 'completed'>(
    'confirm'
  );

  const unsubscribeReasons = [
    { id: 'too_frequent', label: t('unsubscribe_reason_too_frequent') },
    { id: 'not_relevant', label: t('unsubscribe_reason_not_relevant') },
    { id: 'never_signed', label: t('unsubscribe_reason_never_signed') },
    { id: 'technical_issues', label: t('unsubscribe_reason_technical_issues') },
    { id: 'changed_email', label: t('unsubscribe_reason_changed_email') },
    { id: 'other', label: t('unsubscribe_reason_other') },
  ];

  const handleUnsubscribe = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          reason,
          feedback,
        }),
      });

      if (response.ok) {
        setStep('completed');
      } else {
        const data = await response.json();
        alert(data.error || t('error_unsubscribe_default'));
      }
    } catch (error) {
      console.error('Erro:', error);
      alert(t('error_general'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedWithFeedback = () => {
    setStep('feedback');
  };

  const handleQuickUnsubscribe = () => {
    setReason('not_specified');
    handleUnsubscribe();
  };

  if (step === 'completed') {
    return (
      <PageContainer showBackground={true}>
        <section className="py-20">
          <AnimatedContainer delay={0.1}>
            <div className="section-wrap">
              <div className="max-w-2xl mx-auto text-center">
                <AnimatedItem direction="scale" springType="bouncy">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-green/10 rounded-full mb-8">
                    <FiCheck className="w-10 h-10 text-accent-green" />
                  </div>
                </AnimatedItem>

                <h1 className="text-4xl font-bold classical-title text-theme-primary mb-4">
                  {t('unsubscribe_completed_title')}
                </h1>

                <p className="text-xl text-theme-secondary mb-8">
                  {t('unsubscribe_completed_message')}
                </p>

                <button
                  onClick={() => router.push('/')}
                  className="btn-classical-primary inline-flex items-center space-x-3"
                >
                  <span>{t('unsubscribe_completed_button')}</span>
                  <FiArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </AnimatedContainer>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true} className="classical-theme">
      <section className="py-20">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="section-wrap">
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <AnimatedItem direction="scale" springType="bouncy">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-red/10 to-accent-amber/10 rounded-full mb-6">
                    <FiX className="w-10 h-10 text-accent-red" />
                  </div>
                </AnimatedItem>

                <AnimatedItem direction="up" springType="gentle">
                  <h1 className="text-4xl lg:text-5xl font-bold classical-title text-theme-primary mb-4">
                    {t('unsubscribe_page_title')}
                  </h1>
                </AnimatedItem>

                <AnimatedItem direction="up" springType="gentle">
                  <p className="text-lg text-theme-secondary">
                    {t('unsubscribe_page_subtitle')}
                  </p>
                </AnimatedItem>
              </div>

              {/* Content based on step */}
              {step === 'confirm' && (
                <AnimatedCard
                  hover="lift"
                  className="classical-card p-8 text-center"
                >
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-theme-primary mb-4">
                        {t('unsubscribe_before_title')}
                      </h3>
                      <p className="text-theme-secondary">
                        {t('unsubscribe_before_message')}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={handleProceedWithFeedback}
                        className="btn-classical-primary w-full"
                      >
                        {t('unsubscribe_with_feedback_button')}
                      </button>

                      <button
                        onClick={handleQuickUnsubscribe}
                        disabled={isSubmitting}
                        className="btn-classical-secondary w-full"
                      >
                        {isSubmitting
                          ? t('unsubscribe_quick_button_loading')
                          : t('unsubscribe_quick_button')}
                      </button>

                      <button
                        onClick={() => router.push('/')}
                        className="w-full text-theme-secondary hover:text-brand-primary transition-colors"
                      >
                        {t('unsubscribe_keep_button')}
                      </button>
                    </div>
                  </div>
                </AnimatedCard>
              )}

              {step === 'feedback' && (
                <AnimatedCard hover="lift" className="classical-card p-8">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-theme-primary mb-2">
                        {t('unsubscribe_feedback_title')}
                      </h3>
                      <p className="text-theme-secondary">
                        {t('unsubscribe_feedback_subtitle')}
                      </p>
                    </div>

                    {/* Reason Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-theme-secondary">
                        {t('unsubscribe_reason_label')}
                      </label>
                      <div className="space-y-2">
                        {unsubscribeReasons.map((reasonOption) => (
                          <label
                            key={reasonOption.id}
                            className="flex items-center space-x-3 p-3 rounded-lg border border-theme-secondary cursor-pointer hover:bg-theme-secondary transition-colors"
                          >
                            <Input
                              type="radio"
                              name="reason"
                              value={reasonOption.id}
                              checked={reason === reasonOption.id}
                              onChange={(e) => setReason(e.target.value)}
                              className="text-brand-primary focus:ring-brand-primary"
                            />
                            <span className="text-theme-primary">
                              {reasonOption.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Feedback */}
                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        {t('unsubscribe_feedback_label')}
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={4}
                        className="input-classical-2 w-full resize-none"
                        placeholder={t('unsubscribe_feedback_placeholder')}
                      />
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <button
                        onClick={handleUnsubscribe}
                        disabled={isSubmitting}
                        className="btn-classical-primary w-full"
                      >
                        {isSubmitting
                          ? t('unsubscribe_quick_button_loading')
                          : t('unsubscribe_confirm_button')}
                      </button>

                      <button
                        onClick={() => setStep('confirm')}
                        className="w-full text-theme-secondary hover:text-brand-primary transition-colors"
                      >
                        {t('unsubscribe_back_button')}
                      </button>
                    </div>
                  </div>
                </AnimatedCard>
              )}
            </div>
          </div>
        </AnimatedContainer>
      </section>
    </PageContainer>
  );
}
