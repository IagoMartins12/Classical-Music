import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiSettings,
  FiMinus,
  FiPlus,
} from 'react-icons/fi';

export interface MetronomeSettings {
  bpm: number;
  timeSignature: string;
  isActive: boolean;
  sound: 'click' | 'beep' | 'wood' | 'digital';
  volume: number;
  accentBeats: boolean;
}

interface MetronomeProps {
  settings: MetronomeSettings;
  onSettingsChange: (settings: Partial<MetronomeSettings>) => void;
  className?: string;
  compact?: boolean;
}

const Metronome: React.FC<MetronomeProps> = ({
  settings,
  onSettingsChange,
  className = '',
  compact = false,
}) => {
  const [currentBeat, setCurrentBeat] = useState(1);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const nextNoteTimeRef = useRef(0);
  const lookAhead = 25.0; // How frequently to call scheduling function (in milliseconds)
  const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

  // Parse time signature
  const [beatsPerMeasure, noteValue] = settings.timeSignature
    .split('/')
    .map(Number);

  // Initialize audio context
  useEffect(() => {
    const context = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    setAudioContext(context);

    return () => {
      if (context) {
        context.close();
      }
    };
  }, []);

  // Create sound based on settings
  const createSound = useCallback(
    (isAccent: boolean = false) => {
      if (!audioContext) return;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different sounds based on settings
      switch (settings.sound) {
        case 'click':
          oscillator.frequency.value = isAccent ? 1200 : 800;
          oscillator.type = 'square';
          break;
        case 'beep':
          oscillator.frequency.value = isAccent ? 1000 : 600;
          oscillator.type = 'sine';
          break;
        case 'wood':
          oscillator.frequency.value = isAccent ? 200 : 150;
          oscillator.type = 'sawtooth';
          break;
        case 'digital':
          oscillator.frequency.value = isAccent ? 880 : 440;
          oscillator.type = 'triangle';
          break;
      }

      // Volume and accent
      const baseVolume = settings.volume * 0.1;
      gainNode.gain.value =
        isAccent && settings.accentBeats ? baseVolume * 1.5 : baseVolume;

      // Play sound
      const now = audioContext.currentTime;
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    },
    [audioContext, settings.sound, settings.volume, settings.accentBeats]
  );

  // Schedule next note
  const scheduleNote = useCallback(
    (time: number, beat: number) => {
      // Create sound at scheduled time
      setTimeout(() => {
        const isAccent = beat === 1 && settings.accentBeats;
        createSound(isAccent);
      }, (time - audioContext!.currentTime) * 1000);
    },
    [createSound, settings.accentBeats, audioContext]
  );

  // Scheduler function
  const scheduler = useCallback(() => {
    if (!audioContext) return;

    while (
      nextNoteTimeRef.current <
      audioContext.currentTime + scheduleAheadTime
    ) {
      scheduleNote(nextNoteTimeRef.current, currentBeat);

      // Calculate next note time
      const secondsPerBeat = 60.0 / settings.bpm;
      nextNoteTimeRef.current += secondsPerBeat;

      // Advance beat
      setCurrentBeat((prev) => (prev >= beatsPerMeasure ? 1 : prev + 1));
    }
  }, [audioContext, settings.bpm, currentBeat, beatsPerMeasure, scheduleNote]);

  // Main metronome loop
  useEffect(() => {
    if (settings.isActive && audioContext) {
      nextNoteTimeRef.current = audioContext.currentTime;
      intervalRef.current = setInterval(scheduler, lookAhead);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [settings.isActive, audioContext, scheduler]);

  // Handle BPM changes
  const adjustBPM = (delta: number) => {
    const newBPM = Math.max(30, Math.min(300, settings.bpm + delta));
    onSettingsChange({ bpm: newBPM });
  };

  // Handle toggle
  const toggleMetronome = () => {
    if (!audioContext) return;

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    onSettingsChange({ isActive: !settings.isActive });

    if (!settings.isActive) {
      setCurrentBeat(1);
    }
  };

  // Time signatures
  const timeSignatures = ['4/4', '3/4', '2/4', '6/8', '9/8', '12/8'];

  // Sound options
  const soundOptions = [
    { value: 'click', label: 'Click' },
    { value: 'beep', label: 'Beep' },
    { value: 'wood', label: 'Wood' },
    { value: 'digital', label: 'Digital' },
  ];

  if (compact) {
    return (
      <div className={`classical-card-simple p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMetronome}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                settings.isActive
                  ? 'bg-gradient-to-r from-accent-red to-accent-purple text-theme-inverse'
                  : 'bg-brand-gradient text-theme-inverse hover:scale-105'
              }`}
            >
              {settings.isActive ? (
                <FiPause className="w-4 h-4" />
              ) : (
                <FiPlay className="w-4 h-4" />
              )}
            </button>

            <div className="text-center">
              <div className="text-lg font-bold text-theme-primary">
                {settings.bpm}
              </div>
              <div className="text-xs text-theme-tertiary">BPM</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => adjustBPM(-5)}
              className="w-8 h-8 bg-theme-elevated rounded-lg hover:bg-interactive-hover transition-colors flex items-center justify-center"
            >
              <FiMinus className="w-3 h-3 text-theme-primary" />
            </button>
            <button
              onClick={() => adjustBPM(5)}
              className="w-8 h-8 bg-theme-elevated rounded-lg hover:bg-interactive-hover transition-colors flex items-center justify-center"
            >
              <FiPlus className="w-3 h-3 text-theme-primary" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`classical-card p-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-theme-primary mb-2 flex items-center justify-center space-x-2">
          <FiSettings className="w-5 h-5" />
          <span>Metrônomo</span>
        </h3>

        {/* BPM Display */}
        <div className="mb-4">
          <div className="text-5xl font-bold text-gradient-brand mb-2">
            {settings.bpm}
          </div>
          <div className="text-theme-secondary font-medium">
            BPM • {settings.timeSignature}
          </div>
        </div>

        {/* Beat indicator */}
        <div className="flex justify-center space-x-2 mb-6">
          {Array.from({ length: beatsPerMeasure }, (_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-150 ${
                currentBeat === i + 1 && settings.isActive
                  ? 'bg-brand-primary scale-125 shadow-theme-glow'
                  : 'bg-theme-elevated'
              }`}
            />
          ))}
        </div>

        {/* Main control */}
        <button
          onClick={toggleMetronome}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 mb-6 ${
            settings.isActive
              ? 'bg-gradient-to-r from-accent-red to-accent-purple text-theme-inverse hover:scale-105'
              : 'bg-brand-gradient text-theme-inverse hover:scale-105 shadow-theme-glow'
          }`}
        >
          {settings.isActive ? (
            <FiPause className="w-6 h-6" />
          ) : (
            <FiPlay className="w-6 h-6 ml-1" />
          )}
        </button>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* BPM Control */}
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            Andamento (BPM)
          </label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => adjustBPM(-10)}
              className="btn-classical-secondary px-3 py-2"
            >
              -10
            </button>
            <button
              onClick={() => adjustBPM(-1)}
              className="btn-classical-secondary px-3 py-2"
            >
              -1
            </button>
            <input
              type="range"
              min="30"
              max="300"
              value={settings.bpm}
              onChange={(e) =>
                onSettingsChange({ bpm: parseInt(e.target.value) })
              }
              className="flex-1"
            />
            <button
              onClick={() => adjustBPM(1)}
              className="btn-classical-secondary px-3 py-2"
            >
              +1
            </button>
            <button
              onClick={() => adjustBPM(10)}
              className="btn-classical-secondary px-3 py-2"
            >
              +10
            </button>
          </div>
          <div className="flex justify-between text-xs text-theme-tertiary mt-1">
            <span>30</span>
            <span>300</span>
          </div>
        </div>

        {/* Time Signature */}
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            Fórmula de Compasso
          </label>
          <select
            value={settings.timeSignature}
            onChange={(e) => {
              onSettingsChange({ timeSignature: e.target.value });
              setCurrentBeat(1);
            }}
            className="w-full input-classical-2"
          >
            {timeSignatures.map((sig) => (
              <option key={sig} value={sig}>
                {sig}
              </option>
            ))}
          </select>
        </div>

        {/* Sound Type */}
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            Tipo de Som
          </label>
          <select
            value={settings.sound}
            onChange={(e) => onSettingsChange({ sound: e.target.value as any })}
            className="w-full input-classical-2"
          >
            {soundOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Volume */}
        <div>
          <label className=" text-sm font-medium text-theme-secondary mb-2 flex items-center space-x-2">
            <FiVolume2 className="w-4 h-4" />
            <span>Volume</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.volume}
            onChange={(e) =>
              onSettingsChange({ volume: parseFloat(e.target.value) })
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-theme-tertiary mt-1">
            <span>Mudo</span>
            <span>Máximo</span>
          </div>
        </div>

        {/* Accent Beats */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="accentBeats"
            checked={settings.accentBeats}
            onChange={(e) =>
              onSettingsChange({ accentBeats: e.target.checked })
            }
            className="w-4 h-4 text-brand-primary border-theme-secondary rounded focus:ring-brand-primary"
          />
          <label
            htmlFor="accentBeats"
            className="text-sm font-medium text-theme-secondary cursor-pointer"
          >
            Acentuar primeiro tempo
          </label>
        </div>
      </div>

      {/* Preset tempos */}
      <div className="mt-6 pt-4 border-t border-theme-secondary">
        <div className="text-sm font-medium text-theme-secondary mb-3">
          Andamentos Comuns
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: 'Largo', bpm: 60 },
            { name: 'Andante', bpm: 80 },
            { name: 'Moderato', bpm: 108 },
            { name: 'Allegro', bpm: 132 },
            { name: 'Vivace', bpm: 156 },
            { name: 'Presto', bpm: 180 },
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => onSettingsChange({ bpm: preset.bpm })}
              className="text-xs bg-theme-elevated hover:bg-interactive-hover border border-theme-secondary rounded-lg p-2 transition-colors"
            >
              <div className="font-medium text-theme-primary">
                {preset.name}
              </div>
              <div className="text-theme-tertiary">{preset.bpm} BPM</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Metronome;
