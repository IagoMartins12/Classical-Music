// components/blog/TextToSpeechWebAPI.tsx - Web Speech API (GRATUITO)
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FiVolume2,
  FiPause,
  FiPlay,
  FiSquare,
  FiSettings,
} from 'react-icons/fi';

interface TextToSpeechWebAPIProps {
  content: any; // TipTap JSON
}

export function TextToSpeechWebAPI({ content }: TextToSpeechWebAPIProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textChunksRef = useRef<string[]>([]);
  const currentChunkRef = useRef(0);

  // ✅ VERIFICAR SUPORTE E CARREGAR VOZES
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Selecionar voz em português BR por padrão
        const ptBRVoice = availableVoices.find(
          (voice) => voice.lang === 'pt-BR' || voice.lang.startsWith('pt')
        );
        if (ptBRVoice) {
          setSelectedVoice(ptBRVoice);
        } else if (availableVoices.length > 0) {
          setSelectedVoice(availableVoices[0]);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // ✅ EXTRAIR TEXTO DO CONTEÚDO TIPTAP
  const extractText = (json: any): string => {
    if (!json || !json.content) return '';

    let text = '';

    const processNode = (node: any) => {
      if (node.type === 'text') {
        text += node.text + ' ';
      } else if (node.content && Array.isArray(node.content)) {
        node.content.forEach((child: any) => processNode(child));
      }

      // Adicionar pausas após parágrafos e headings
      if (node.type === 'paragraph' || node.type === 'heading') {
        text += '. ';
      }
    };

    json.content.forEach((node: any) => processNode(node));
    return text.trim();
  };

  // ✅ DIVIDIR TEXTO EM CHUNKS (limite do navegador)
  const splitTextIntoChunks = (
    text: string,
    maxLength: number = 200
  ): string[] => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    sentences.forEach((sentence) => {
      if ((currentChunk + sentence).length < maxLength) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    });

    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  };

  // ✅ FALAR PRÓXIMO CHUNK
  const speakNextChunk = () => {
    if (currentChunkRef.current >= textChunksRef.current.length) {
      // Acabou
      setIsSpeaking(false);
      setProgress(100);
      currentChunkRef.current = 0;
      return;
    }

    const text = textChunksRef.current[currentChunkRef.current];
    const utterance = new SpeechSynthesisUtterance(text);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onend = () => {
      currentChunkRef.current++;
      const progressPercent = Math.round(
        (currentChunkRef.current / textChunksRef.current.length) * 100
      );
      setProgress(progressPercent);
      speakNextChunk();
    };

    utterance.onerror = (error) => {
      console.error('Erro na síntese de fala:', error);
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // ✅ INICIAR LEITURA
  const handleSpeak = () => {
    if (!isSupported) {
      alert('Seu navegador não suporta síntese de voz.');
      return;
    }

    window.speechSynthesis.cancel();

    const fullText = extractText(content);
    if (!fullText) {
      alert('Não há texto para ler.');
      return;
    }

    textChunksRef.current = splitTextIntoChunks(fullText);
    currentChunkRef.current = 0;
    setProgress(0);
    setIsSpeaking(true);
    setIsPaused(false);

    speakNextChunk();
  };

  // ✅ PAUSAR/CONTINUAR
  const handlePauseResume = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  // ✅ PARAR
  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setProgress(0);
    currentChunkRef.current = 0;
  };

  if (!isSupported) {
    return null; // Não mostrar se não suportado
  }

  return (
    <div className="classical-card p-6 my-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-brand-primary rounded-lg">
            <FiVolume2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-theme-primary">Ouvir Artigo</h3>
            <p className="text-sm text-theme-secondary">
              Leitura automática com síntese de voz
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-theme-classical rounded-lg transition-colors"
          title="Configurações"
        >
          <FiSettings className="w-5 h-5 text-theme-secondary" />
        </button>
      </div>

      {/* BARRA DE PROGRESSO */}
      {isSpeaking && (
        <div className="mb-4">
          <div className="w-full bg-theme-secondary h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-theme-tertiary mt-1 text-center">
            {progress}% concluído
          </p>
        </div>
      )}

      {/* CONFIGURAÇÕES */}
      {showSettings && (
        <div className="mb-4 p-4 bg-theme-elevated rounded-lg space-y-4">
          {/* Seleção de Voz */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Voz:
            </label>
            <select
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const voice = voices.find((v) => v.name === e.target.value);
                if (voice) setSelectedVoice(voice);
              }}
              className="input-classical-2 w-full"
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Velocidade */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Velocidade: {rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Tom */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Tom: {pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* CONTROLES */}
      <div className="flex items-center justify-center space-x-3">
        {!isSpeaking ? (
          <button
            onClick={handleSpeak}
            className="btn-classical-primary flex items-center space-x-2 px-6"
          >
            <FiPlay className="w-5 h-5" />
            <span>Ouvir Artigo</span>
          </button>
        ) : (
          <>
            <button
              onClick={handlePauseResume}
              className="btn-classical-secondary flex items-center space-x-2"
            >
              {isPaused ? (
                <>
                  <FiPlay className="w-5 h-5" />
                  <span>Continuar</span>
                </>
              ) : (
                <>
                  <FiPause className="w-5 h-5" />
                  <span>Pausar</span>
                </>
              )}
            </button>

            <button
              onClick={handleStop}
              className="btn-classical-secondary flex items-center space-x-2 !bg-red-500 hover:!bg-red-600 !text-white"
            >
              <FiSquare className="w-5 h-5" />
              <span>Parar</span>
            </button>
          </>
        )}
      </div>

      <p className="text-xs text-theme-tertiary text-center mt-3">
        💡 Use fones de ouvido para melhor experiência
      </p>
    </div>
  );
}
