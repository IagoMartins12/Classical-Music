'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { GiPartyPopper } from 'react-icons/gi';
import Button from '@/app/components/Common/Button';

export default function SubscriptionSuccessPage() {
  const router = useRouter();

  //   useEffect(() => {
  //     // Confetti animation
  //     const duration = 3000;
  //     const end = Date.now() + duration;

  //     // const frame = () => {
  //     //   confetti({
  //     //     particleCount: 2,
  //     //     angle: 60,
  //     //     spread: 55,
  //     //     origin: { x: 0 },
  //     //     colors: ['#6366f1', '#8b5cf6', '#ec4899'],
  //     //   });
  //     //   confetti({
  //     //     particleCount: 2,
  //     //     angle: 120,
  //     //     spread: 55,
  //     //     origin: { x: 1 },
  //     //     colors: ['#6366f1', '#8b5cf6', '#ec4899'],
  //     //   });

  //     //   if (Date.now() < end) {
  //     //     requestAnimationFrame(frame);
  //     //   }
  //     // };

  //     // frame();
  //   }, []);

  return (
    <div className="min-h-screen bg-theme-primary flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-theme-elevated rounded-2xl shadow-theme-large p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-accent-green to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <FiCheck className="w-12 h-12 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
            🎉 Pagamento Aprovado!
          </h1>

          <p className="text-xl text-theme-secondary mb-8">
            Sua assinatura foi ativada com sucesso!
          </p>

          {/* Info Box */}
          <div className="bg-theme-secondary rounded-xl p-6 mb-8 text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                <GiPartyPopper className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-theme-primary mb-2">
                  O que acontece agora?
                </h3>
                <ul className="space-y-2 text-theme-secondary">
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-accent-green flex-shrink-0" />
                    <span>
                      Você tem acesso imediato a todas as funcionalidades do seu
                      plano
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-accent-green flex-shrink-0" />
                    <span>Um email de confirmação foi enviado para você</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-accent-green flex-shrink-0" />
                    <span>A nota fiscal está disponível no seu painel</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => router.push('/dashboard')}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <span>Ir para o Dashboard</span>
              <FiArrowRight className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => router.push('/subscription')}
              variant="secondary"
              className="flex-1"
            >
              Ver Assinatura
            </Button>
          </div>

          <p className="text-sm text-theme-tertiary mt-8">
            Bem-vindo ao Opus Atlas! Estamos felizes em tê-lo conosco. 🎵
          </p>
        </div>
      </div>
    </div>
  );
}
