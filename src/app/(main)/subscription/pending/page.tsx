'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiClock, FiMail } from 'react-icons/fi';
import Button from '@/app/components/Common/Button';

export default function SubscriptionPendingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-theme-primary flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-theme-elevated rounded-2xl shadow-theme-large p-8 md:p-12 text-center">
          {/* Pending Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <FiClock className="w-12 h-12 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
            Pagamento Pendente
          </h1>

          <p className="text-xl text-theme-secondary mb-8">
            Seu pagamento está sendo processado.
          </p>

          {/* Info Box */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiMail className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-theme-primary mb-2">
                  O que acontece agora?
                </h3>
                <ul className="space-y-2 text-theme-secondary">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></span>
                    <span>
                      Aguarde a confirmação do pagamento (pode levar alguns
                      minutos)
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></span>
                    <span>Você receberá um email assim que for aprovado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></span>
                    <span>
                      Se for boleto, o pagamento pode levar até 2 dias úteis
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></span>
                    <span>Para PIX, a confirmação é quase instantânea</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => router.push('/dashboard')}
              className="flex-1"
            >
              Ir para o Dashboard
            </Button>
            <Button
              onClick={() => router.push('/subscription')}
              variant="secondary"
              className="flex-1"
            >
              Ver Status
            </Button>
          </div>

          <p className="text-sm text-theme-tertiary mt-8">
            Não se preocupe! Você será notificado assim que o pagamento for
            confirmado.
          </p>
        </div>
      </div>
    </div>
  );
}
