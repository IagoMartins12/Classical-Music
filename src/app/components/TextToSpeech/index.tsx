'use client';

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
        <button
          onClick={handleSpeak}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          🔊 Ouvir artigo
        </button>
      ) : (
        <button
          onClick={handleStop}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          ⏹ Parar
        </button>
      )}
    </div>
  );
}
