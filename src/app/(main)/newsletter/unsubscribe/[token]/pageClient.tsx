// app/newsletter/unsubscribe/[token]/pageclient.tsx
'use client';

import React, { useState, useId } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { PiArrowRight, PiCheck, PiX } from 'react-icons/pi';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
} from '../../../../components/animation/AnimatedComponents';
import Input from '@/app/components/Common/Inputs';
import { useTranslation } from '@/app/context/TranslationContext';
import { unsubscribeFromNewsletter } from '@/app/requests/newsletter';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Field } from '@/app/components/ui/Field';
import { Button } from '@/app/components/ui/Button';

export default function UnsubscribePage() {
  const idCampo = useId();
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
      const result = await unsubscribeFromNewsletter({
        token,
        reason,
        feedback,
      });

      if (result.ok) {
        setStep('completed');
      } else {
        alert(result.error || t('error_unsubscribe_default'));
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
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8">
                    <PiCheck className="w-10 h-10" />
                  </div>
                </AnimatedItem>

                <h1 className="text-4xl font-bold classical-title text-theme-primary mb-4">
                  {t('unsubscribe_completed_title')}
                </h1>

                <p className="text-xl text-theme-secondary mb-8">
                  {t('unsubscribe_completed_message')}
                </p>

                <Button
                  variante="primario"
                  type="submit"
                  onClick={() => router.push('/')}
                  className="inline-flex items-center"
                >
                  <span>{t('unsubscribe_completed_button')}</span>
                  <PiArrowRight className="w-5 h-5" />
                </Button>
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
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6">
                    <PiX className="w-10 h-10" />
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
                  <Stack gap={6}>
                    <Stack>
                      <h3 className="text-xl font-semibold text-theme-primary">
                        {t('unsubscribe_before_title')}
                      </h3>
                      <p className="text-theme-secondary">
                        {t('unsubscribe_before_message')}
                      </p>
                    </Stack>

                    <Stack>
                      <Button
                        variante="primario"
                        type="submit"
                        onClick={handleProceedWithFeedback}
                        className="w-full"
                      >
                        {t('unsubscribe_with_feedback_button')}
                      </Button>

                      <Button
                        variante="secundario"
                        type="submit"
                        onClick={handleQuickUnsubscribe}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting
                          ? t('unsubscribe_quick_button_loading')
                          : t('unsubscribe_quick_button')}
                      </Button>

                      <button
                        onClick={() => router.push('/')}
                        className="w-full text-theme-secondary transition-colors"
                      >
                        {t('unsubscribe_keep_button')}
                      </button>
                    </Stack>
                  </Stack>
                </AnimatedCard>
              )}

              {step === 'feedback' && (
                <AnimatedCard hover="lift" className="classical-card p-8">
                  <Stack gap={6}>
                    <Stack gap={2} className="text-center">
                      <h3 className="text-xl font-semibold text-theme-primary">
                        {t('unsubscribe_feedback_title')}
                      </h3>
                      <p className="text-theme-secondary">
                        {t('unsubscribe_feedback_subtitle')}
                      </p>
                    </Stack>

                    {/* Reason Selection */}
                    <Stack gap={3}>
                      <label
                        htmlFor={`${idCampo}-1`}
                        className="block text-sm font-medium text-theme-secondary"
                      >
                        {t('unsubscribe_reason_label')}
                      </label>
                      <Stack gap={2}>
                        {unsubscribeReasons.map((reasonOption) => (
                          <Inline
                            as="label"
                            gap={3}
                            key={reasonOption.id}
                            className="p-3 rounded-lg cursor-pointer transition-colors bg-sup-2"
                          >
                            <Input
                              id={`${idCampo}-1`}
                              type="radio"
                              name="reason"
                              value={reasonOption.id}
                              checked={reason === reasonOption.id}
                              onChange={(e) => setReason(e.target.value)}
                              className="text-ouro-texto"
                            />
                            <span className="text-theme-primary">
                              {reasonOption.label}
                            </span>
                          </Inline>
                        ))}
                      </Stack>
                    </Stack>

                    {/* Feedback */}
                    <div>
                      <Field.Area
                        label={t('unsubscribe_feedback_label')}
                        classeCampo="resize-none"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={4}
                        placeholder={t('unsubscribe_feedback_placeholder')}
                      />
                    </div>

                    {/* Actions */}
                    <Stack gap={3}>
                      <Button
                        variante="primario"
                        type="submit"
                        onClick={handleUnsubscribe}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting
                          ? t('unsubscribe_quick_button_loading')
                          : t('unsubscribe_confirm_button')}
                      </Button>

                      <button
                        onClick={() => setStep('confirm')}
                        className="w-full text-theme-secondary transition-colors"
                      >
                        {t('unsubscribe_back_button')}
                      </button>
                    </Stack>
                  </Stack>
                </AnimatedCard>
              )}
            </div>
          </div>
        </AnimatedContainer>
      </section>
    </PageContainer>
  );
}
