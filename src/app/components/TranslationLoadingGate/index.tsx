'use client';

import { useLanguageStore } from '@/app/stores/useLanguageStore';
import { TranslationLoadingModal } from '../TranslationLoadingModal';

/**
 * O aviso de "traduzindo", montado **uma vez** para o site inteiro.
 *
 * Antes cada `LanguageToggle` carregava o seu — e o `Navbar` monta dois (o do
 * topo e o do menu mobile, que fica sempre no DOM, escondido por CSS). Como
 * `isTranslating` é um estado global, os dois abriam juntos, cada um com o seu
 * cronômetro, e o usuário via o modal abrir, fechar e abrir de novo.
 *
 * Fica ao lado do conteúdo, na raiz da árvore de cliente: o botão só pede a
 * troca, quem desenha o aviso é este componente.
 */
export function TranslationLoadingGate() {
  const language = useLanguageStore((state) => state.language);
  const isTranslating = useLanguageStore((state) => state.isTranslating);
  const setTranslating = useLanguageStore((state) => state.setTranslating);

  return (
    <TranslationLoadingModal
      isOpen={isTranslating}
      currentLanguage={language}
      onComplete={() => setTranslating(false)}
    />
  );
}
