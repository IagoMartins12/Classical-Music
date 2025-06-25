// app/components/StudyMode/components/StudyMetronome.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiMusic,
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiSettings,
  FiMinus,
  FiPlus,
} from 'react-icons/fi';
import { StudySession } from '../StudyModeClient';

interface StudyMetronomeProps {
  session: StudySession;
  onUpdateSession: (updates: Partial<StudySession>) => void;
}

// Presets de andamento comuns
const TEMPO_PRESETS = [
  { name: 'Largo', bpm: 40, description: 'Muito lento' },
  { name: 'Adagio', bpm: 66, description: 'Lento' },
  { name: 'Andante', bpm: 76, description: 'Moderado' },
  { name: 'Moderato', bpm: 108, description: 'Moderado' },
  { name: 'Allegro', bpm: 132, description: 'Rápido' },
  { name: 'Presto', bpm: 168, description: 'Muito rápido' },
];

const TIME_SIGNATURES = [
  { value: '4/4', name: 'Quaternário' },
  { value: '3/4', name: 'Ternário' },
  { value: '2/4', name: 'Binário' },
  { value: '6/8', name: 'Composto' },
  { value: '9/8', name: 'Composto' },
  { value: '12/8', name: 'Composto' },
];

const SOUND_OPTIONS = [
  { value: 'click', name: 'Click Digital', icon: '🔘' },
  { value: 'beep', name: 'Beep Eletrônico', icon: '📻' },
  { value: 'wood', name: 'Madeira', icon: '🥄' },
];

const StudyMetronome: React.FC<StudyMetronomeProps> = ({
  session,
  onUpdateSession,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextBeatTimeRef = useRef(0);
  const beatCountRef = useRef(1);

  // Inicializar AudioContext
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Atualizar metrônomo quando configurações mudam
  useEffect(() => {
    if (isPlaying) {
      stopMetronome();
      startMetronome();
    }
  }, [session.metronome.bpm, session.metronome.timeSignature]);

  // Criar AudioContext se necessário
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Tocar som do metrônomo
  const playClick = useCallback(
    (isAccent = false) => {
      try {
        const audioContext = getAudioContext();

        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Configurar som baseado no tipo
        switch (session.metronome.sound) {
          case 'beep':
            oscillator.frequency.value = isAccent ? 1200 : 800;
            oscillator.type = 'sine';
            break;
          case 'wood':
            oscillator.frequency.value = isAccent ? 1000 : 800;
            oscillator.type = 'square';
            break;
          default: // click
            oscillator.frequency.value = isAccent ? 1500 : 1000;
            oscillator.type = 'square';
        }

        // Volume e envelope
        const volume = session.metronome.volume * (isAccent ? 0.3 : 0.2);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          volume,
          audioContext.currentTime + 0.01
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          audioContext.currentTime + 0.1
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (error) {
        console.error('Erro ao reproduzir som do metrônomo:', error);
      }
    },
    [session.metronome.sound, session.metronome.volume, getAudioContext]
  );

  // Iniciar metrônomo
  const startMetronome = useCallback(() => {
    const audioContext = getAudioContext();
    nextBeatTimeRef.current = audioContext.currentTime;
    beatCountRef.current = 1;
    setCurrentBeat(1);

    const scheduleNextBeat = () => {
      const secondsPerBeat = 60.0 / session.metronome.bpm;

      while (nextBeatTimeRef.current < audioContext.currentTime + 0.1) {
        const beatsPerMeasure = parseInt(
          session.metronome.timeSignature.split('/')[0]
        );
        const isAccent = beatCountRef.current === 1;

        // Agendar o som
        setTimeout(() => {
          playClick(isAccent);
          setCurrentBeat(beatCountRef.current);
        }, (nextBeatTimeRef.current - audioContext.currentTime) * 1000);

        nextBeatTimeRef.current += secondsPerBeat;
        beatCountRef.current =
          beatCountRef.current >= beatsPerMeasure
            ? 1
            : beatCountRef.current + 1;
      }
    };

    intervalRef.current = setInterval(scheduleNextBeat, 25);
    setIsPlaying(true);
  }, [
    session.metronome.bpm,
    session.metronome.timeSignature,
    playClick,
    getAudioContext,
  ]);

  // Parar metrônomo
  const stopMetronome = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(1);
    beatCountRef.current = 1;
  }, []);

  // Toggle metrônomo
  const toggleMetronome = useCallback(() => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  }, [isPlaying, startMetronome, stopMetronome]);

  // Atualizar BPM
  const updateBpm = (newBpm: number) => {
    const clampedBpm = Math.max(30, Math.min(300, newBpm));
    onUpdateSession({
      metronome: {
        ...session.metronome,
        bpm: clampedBpm,
      },
    });
  };

  // Atualizar configuração do metrônomo
  const updateMetronomeSettings = (
    updates: Partial<typeof session.metronome>
  ) => {
    onUpdateSession({
      metronome: {
        ...session.metronome,
        ...updates,
      },
    });
  };

  // Aplicar preset de andamento
  const applyPreset = (bpm: number) => {
    updateBpm(bpm);
  };

  // Cálculo de beats visuais
  const beatsPerMeasure = parseInt(
    session.metronome.timeSignature.split('/')[0]
  );
  const beatIndicators = Array.from(
    { length: beatsPerMeasure },
    (_, i) => i + 1
  );

  return (
    <div className="p-6 space-y-6">
      {/* Display principal do BPM */}
      <div className="text-center space-y-4">
        <div className="relative">
          {/* Círculo principal do metrônomo */}
          <div className="w-32 h-32 mx-auto relative">
            <div
              className={`w-full h-full rounded-full border-4 transition-all duration-150 ${
                isPlaying
                  ? currentBeat === 1
                    ? 'border-accent-green bg-accent-green/10 shadow-lg shadow-accent-green/30'
                    : 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/30'
                  : 'border-theme-secondary bg-theme-elevated'
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-theme-primary">
                    {session.metronome.bpm}
                  </div>
                  <div className="text-sm text-theme-secondary">BPM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fórmula de compasso */}
        <div className="text-xl font-semibold text-theme-primary">
          {session.metronome.timeSignature}
        </div>

        {/* Indicadores de batida */}
        <div className="flex justify-center space-x-2">
          {beatIndicators.map((beat) => (
            <div
              key={beat}
              className={`w-4 h-4 rounded-full transition-all duration-150 ${
                isPlaying && currentBeat === beat
                  ? beat === 1
                    ? 'bg-accent-green shadow-lg shadow-accent-green/50'
                    : 'bg-brand-primary shadow-lg shadow-brand-primary/50'
                  : 'bg-theme-secondary/30'
              }`}
            />
          ))}
        </div>

        {/* Controle principal */}
        <button
          onClick={toggleMetronome}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg ${
            isPlaying
              ? 'bg-gradient-to-r from-accent-red to-accent-orange text-white'
              : 'bg-gradient-to-r from-accent-green to-accent-blue text-white'
          }`}
        >
          {isPlaying ? (
            <FiPause className="w-6 h-6" />
          ) : (
            <FiPlay className="w-6 h-6 ml-1" />
          )}
        </button>
      </div>

      {/* Controles de BPM */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => updateBpm(session.metronome.bpm - 1)}
            className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-xl hover:bg-interactive-hover transition-all duration-300 flex items-center justify-center"
          >
            <FiMinus className="w-4 h-4 text-theme-primary" />
          </button>

          <div className="flex-1">
            <input
              type="range"
              min="30"
              max="300"
              value={session.metronome.bpm}
              onChange={(e) => updateBpm(parseInt(e.target.value))}
              className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(var(--brand-primary)) 0%, rgb(var(--brand-primary)) ${
                  ((session.metronome.bpm - 30) / 270) * 100
                }%, rgb(var(--theme-secondary)) ${
                  ((session.metronome.bpm - 30) / 270) * 100
                }%, rgb(var(--theme-secondary)) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-theme-tertiary mt-1">
              <span>30</span>
              <span>300</span>
            </div>
          </div>

          <button
            onClick={() => updateBpm(session.metronome.bpm + 1)}
            className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-xl hover:bg-interactive-hover transition-all duration-300 flex items-center justify-center"
          >
            <FiPlus className="w-4 h-4 text-theme-primary" />
          </button>
        </div>

        {/* Input direto de BPM */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-theme-secondary">
            BPM:
          </label>
          <input
            type="number"
            min="30"
            max="300"
            value={session.metronome.bpm}
            onChange={(e) => updateBpm(parseInt(e.target.value) || 120)}
            className="w-20 bg-theme-elevated border border-theme-secondary rounded-xl px-3 py-2 text-theme-primary text-center focus:outline-none focus:border-brand-primary"
          />
        </div>
      </div>

      {/* Presets de andamento */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-theme-primary flex items-center space-x-2">
          <FiMusic className="w-4 h-4" />
          <span>Andamentos Clássicos</span>
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {TEMPO_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset.bpm)}
              className={`p-3 rounded-xl text-left transition-all duration-300 hover:scale-105 ${
                Math.abs(session.metronome.bpm - preset.bpm) <= 5
                  ? 'bg-brand-gradient text-theme-primary shadow-theme-glow'
                  : 'bg-theme-elevated border border-theme-secondary hover:bg-interactive-hover'
              }`}
            >
              <div className="font-medium text-sm">{preset.name}</div>
              <div className="text-xs opacity-75">{preset.bpm} BPM</div>
            </button>
          ))}
        </div>
      </div>

      {/* Configurações avançadas */}
      <div className="space-y-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-sm font-medium text-theme-primary bg-theme-elevated border border-theme-secondary rounded-xl px-4 py-3 hover:bg-interactive-hover transition-all duration-300"
        >
          <div className="flex items-center space-x-2">
            <FiSettings className="w-4 h-4" />
            <span>Configurações Avançadas</span>
          </div>
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              showAdvanced ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showAdvanced && (
          <div className="space-y-4 animate-fade-in-up">
            {/* Fórmula de compasso */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-theme-secondary">
                Fórmula de Compasso
              </label>
              <select
                value={session.metronome.timeSignature}
                onChange={(e) =>
                  updateMetronomeSettings({ timeSignature: e.target.value })
                }
                className="w-full bg-theme-elevated border border-theme-secondary rounded-xl px-3 py-2 text-theme-primary focus:outline-none focus:border-brand-primary"
              >
                {TIME_SIGNATURES.map((sig) => (
                  <option key={sig.value} value={sig.value}>
                    {sig.value} - {sig.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Som do metrônomo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-theme-secondary">
                Som do Metrônomo
              </label>
              <div className="grid grid-cols-1 gap-2">
                {SOUND_OPTIONS.map((sound) => (
                  <button
                    key={sound.value}
                    onClick={() =>
                      updateMetronomeSettings({ sound: sound.value as any })
                    }
                    className={`p-3 rounded-xl text-left transition-all duration-300 hover:scale-105 ${
                      session.metronome.sound === sound.value
                        ? 'bg-brand-gradient text-theme-primary shadow-theme-glow'
                        : 'bg-theme-elevated border border-theme-secondary hover:bg-interactive-hover'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{sound.icon}</span>
                      <span className="font-medium text-sm">{sound.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FiVolume2 className="w-4 h-4 text-theme-secondary" />
                <label className="text-sm font-medium text-theme-secondary">
                  Volume: {Math.round(session.metronome.volume * 100)}%
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={session.metronome.volume}
                onChange={(e) =>
                  updateMetronomeSettings({
                    volume: parseFloat(e.target.value),
                  })
                }
                className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Status do metrônomo */}
      <div className="bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isPlaying ? (
              <FiVolume2 className="w-4 h-4 text-accent-green" />
            ) : (
              <FiVolumeX className="w-4 h-4 text-theme-tertiary" />
            )}
            <span className="text-sm font-medium text-theme-secondary">
              {isPlaying ? 'Metrônomo Ativo' : 'Metrônomo Parado'}
            </span>
          </div>

          {isPlaying && (
            <div className="text-sm text-theme-primary">
              Batida {currentBeat} de {beatsPerMeasure}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyMetronome;
