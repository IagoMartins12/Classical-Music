// app/newsletter/unsubscribe/[token]page.tsx
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

const unsubscribeReasons = [
  { id: 'too_frequent', label: 'Emails muito frequentes' },
  { id: 'not_relevant', label: 'Conteúdo não relevante' },
  { id: 'never_signed', label: 'Nunca me inscrevi' },
  { id: 'technical_issues', label: 'Problemas técnicos' },
  { id: 'changed_email', label: 'Mudei de email' },
  { id: 'other', label: 'Outro motivo' },
];

export default function UnsubscribePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'confirm' | 'feedback' | 'completed'>(
    'confirm'
  );

  console.log('token', token);
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
        alert(data.error || 'Erro ao cancelar inscrição');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao cancelar inscrição');
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
                  Inscrição Cancelada
                </h1>

                <p className="text-xl text-theme-secondary mb-8">
                  Sua inscrição foi cancelada com sucesso. Sentimos muito em
                  vê-lo partir!
                </p>

                <button
                  onClick={() => router.push('/')}
                  className="btn-classical-primary inline-flex items-center space-x-3"
                >
                  <span>Voltar ao Início</span>
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
                    Cancelar Inscrição
                  </h1>
                </AnimatedItem>

                <AnimatedItem direction="up" springType="gentle">
                  <p className="text-lg text-theme-secondary">
                    Sentimos muito em vê-lo partir. Tem certeza que deseja
                    cancelar sua inscrição?
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
                        Antes de cancelar...
                      </h3>
                      <p className="text-theme-secondary">
                        Nossa newsletter inclui descobertas musicais, novos
                        compositores, partituras exclusivas e dicas de estudo.
                        Tem certeza que deseja cancelar?
                      </p>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={handleProceedWithFeedback}
                        className="btn-classical-primary w-full"
                      >
                        Sim, cancelar (com feedback)
                      </button>

                      <button
                        onClick={handleQuickUnsubscribe}
                        disabled={isSubmitting}
                        className="btn-classical-secondary w-full"
                      >
                        {isSubmitting
                          ? 'Cancelando...'
                          : 'Cancelar rapidamente'}
                      </button>

                      <button
                        onClick={() => router.push('/')}
                        className="w-full text-theme-secondary hover:text-brand-primary transition-colors"
                      >
                        Voltar (manter inscrição)
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
                        Nos ajude a melhorar
                      </h3>
                      <p className="text-theme-secondary">
                        Por que está cancelando a inscrição?
                      </p>
                    </div>

                    {/* Reason Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-theme-secondary">
                        Motivo (opcional)
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
                        Feedback adicional (opcional)
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={4}
                        className="input-classical-2 w-full resize-none"
                        placeholder="Como podemos melhorar nossa newsletter?"
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
                          ? 'Cancelando...'
                          : 'Confirmar Cancelamento'}
                      </button>

                      <button
                        onClick={() => setStep('confirm')}
                        className="w-full text-theme-secondary hover:text-brand-primary transition-colors"
                      >
                        Voltar
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
