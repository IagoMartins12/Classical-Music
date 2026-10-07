'use client';

// O modal de "quero aprender / já aprendi" que o site já tem (o mesmo da
// página da obra), montado no portal só quando abre: o código dele não pesa
// na primeira tela. Ao fechar, o repertório do portal é relido.

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLearningModalStore } from '@/app/stores/useLearningModalStore';

const LearningModal = dynamic(() => import('@/app/components/LearningModal'), {
  ssr: false,
});

export function LearningHost() {
  const isOpen = useLearningModalStore((s) => s.isOpen);
  const selecting = useLearningModalStore((s) => s.isInSelectionMode);
  const client = useQueryClient();
  const wasOpen = useRef(false);
  const active = isOpen || selecting;

  useEffect(() => {
    if (wasOpen.current && !active)
      client.invalidateQueries({ queryKey: ['portal', 'repertoire'] });
    wasOpen.current = active;
  }, [active, client]);

  return active || wasOpen.current ? <LearningModal /> : null;
}
