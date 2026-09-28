'use client';
import { Button } from '@/app/components/ui/Button';

import { useState } from 'react';

interface TextToSpeechProps {
  text: string;
}

export default function TextToSpeech({ text }: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!text) return;

    // Interrompe fala anterior
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR'; // ou 'en-US' se for inglês
    utterance.rate = 1; // velocidade da fala
    utterance.pitch = 1; // tom da voz

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="flex gap-2 mt-4">
      {!isSpeaking ? (
        <Button variante="fantasma" tamanho="p" onClick={handleSpeak}>
          Ouvir artigo
        </Button>
      ) : (
        <Button variante="perigo" tamanho="p" onClick={handleStop}>
          Parar
        </Button>
      )}
    </div>
  );
}
