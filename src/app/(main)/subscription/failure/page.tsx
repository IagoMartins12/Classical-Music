'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiX, FiArrowLeft, FiHelpCircle } from 'react-icons/fi';
import Button from '@/app/components/Common/Button';

export default function SubscriptionFailurePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-theme-primary flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-theme-elevated rounded-2xl shadow-theme-large p-8 md:p-12 text-center">
          {/* Error Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <FiX className="w-12 h-12 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
            Pagamento Não Aprovado
          </h1>

          <p className="text-xl text-theme-secondary mb-8">
            Houve um problema ao processar seu pagamento.
          </p>

          {/* Info Box */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiHelpCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-theme-primary mb-2">
                  Possíveis motivos:
                </h3>
                <ul className="space-y-2 text-theme-secondary">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                    <span>Cartão sem saldo suficiente</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                    <span>Dados do cartão incorretos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                    <span>Limite de compras atingido</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                    <span>Problema com a operadora do cartão</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => router.push('/pricing')}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Tentar Novamente</span>
            </Button>
            <Button
              onClick={() => router.push('/support')}
              variant="secondary"
              className="flex-1"
            >
              Falar com Suporte
            </Button>
          </div>

          <p className="text-sm text-theme-tertiary mt-8">
            Se o problema persistir, entre em contato com nosso suporte.
          </p>
        </div>
      </div>
    </div>
  );
}
