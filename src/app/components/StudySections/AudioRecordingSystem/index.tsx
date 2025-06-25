import React, { useState, useRef, useEffect } from 'react';
import { BiStop } from 'react-icons/bi';
import {
  FiMic,
  FiPlay,
  FiPause,
  FiDownload,
  FiTrash2,
  FiSettings,
  FiShare2,
} from 'react-icons/fi';

interface AudioRecording {
  id: string;
  timestamp: number;
  duration: number;
  audioBlob: Blob;
  audioUrl: string;
  waveformData: number[];
  section?: string;
  notes?: string;
  quality: 'low' | 'medium' | 'high';
  tags: string[];
  rating?: number;
}

interface RecordingSettings {
  quality: 'low' | 'medium' | 'high';
  sampleRate: number;
  channels: number;
  bitDepth: number;
  autoGain: boolean;
  noiseReduction: boolean;
  format: 'webm' | 'mp4' | 'wav';
}

const AudioRecordingSystem: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [currentRecordingTime, setCurrentRecordingTime] = useState(0);
  const [selectedRecording, setSelectedRecording] =
    useState<AudioRecording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [recordingSection, setRecordingSection] = useState('');
  const [recordingNotes, setRecordingNotes] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [settings, setSettings] = useState<RecordingSettings>({
    quality: 'medium',
    sampleRate: 44100,
    channels: 2,
    bitDepth: 16,
    autoGain: true,
    noiseReduction: true,
    format: 'webm',
  });

  // Configurações de qualidade
  const qualitySettings = {
    low: { sampleRate: 22050, bitRate: 64000 },
    medium: { sampleRate: 44100, bitRate: 128000 },
    high: { sampleRate: 48000, bitRate: 256000 },
  };

  // Inicializar áudio
  useEffect(() => {
    initializeAudio();
    return () => {
      cleanup();
    };
  }, []);

  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: qualitySettings[settings.quality].sampleRate,
          channelCount: settings.channels,
          autoGainControl: settings.autoGain,
          noiseSuppression: settings.noiseReduction,
          echoCancellation: true,
        },
      });

      audioStreamRef.current = stream;

      // Configurar áudio context para análise em tempo real
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Monitorar nível de áudio
      monitorAudioLevel();
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const updateLevel = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
      }

      if (isRecording || audioStreamRef.current) {
        requestAnimationFrame(updateLevel);
      }
    };

    updateLevel();
  };

  // Iniciar gravação
  const startRecording = async () => {
    if (!audioStreamRef.current) {
      await initializeAudio();
    }

    if (!audioStreamRef.current) return;

    try {
      const mimeType = getMimeType(settings.format);

      mediaRecorderRef.current = new MediaRecorder(audioStreamRef.current, {
        mimeType,
        audioBitsPerSecond: qualitySettings[settings.quality].bitRate,
      });

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        saveRecording(blob);
      };

      mediaRecorderRef.current.start(100); // Coleta dados a cada 100ms
      setIsRecording(true);
      setIsPaused(false);
      setCurrentRecordingTime(0);

      // Timer da gravação
      recordingTimerRef.current = setInterval(() => {
        setCurrentRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  // Pausar/retomar gravação
  const toggleRecordingPause = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      recordingTimerRef.current = setInterval(() => {
        setCurrentRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
    setIsPaused(!isPaused);
  };

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // Salvar gravação
  const saveRecording = async (blob: Blob) => {
    const audioUrl = URL.createObjectURL(blob);
    const waveformData = await generateWaveformData(blob);

    const recording: AudioRecording = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      duration: currentRecordingTime,
      audioBlob: blob,
      audioUrl,
      waveformData,
      section: recordingSection || undefined,
      notes: recordingNotes || undefined,
      quality: settings.quality,
      tags: [],
      rating: undefined,
    };

    setRecordings((prev) => [recording, ...prev]);
    setRecordingSection('');
    setRecordingNotes('');
    setCurrentRecordingTime(0);
  };

  // Gerar dados do waveform
  const generateWaveformData = async (blob: Blob): Promise<number[]> => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const rawData = audioBuffer.getChannelData(0);
      const samples = 200; // Número de pontos no waveform
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData = [];

      for (let i = 0; i < samples; i++) {
        const blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }

      return filteredData;
    } catch (error) {
      console.error('Erro ao gerar waveform:', error);
      return [];
    }
  };

  // Reproduzir gravação
  const playRecording = (recording: AudioRecording) => {
    if (selectedRecording?.id === recording.id && isPlaying) {
      pausePlayback();
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    const audio = new Audio(recording.audioUrl);
    audioPlayerRef.current = audio;
    setSelectedRecording(recording);

    audio.ontimeupdate = () => {
      setPlaybackTime(audio.currentTime);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setPlaybackTime(0);
    };

    audio.play();
    setIsPlaying(true);
  };

  const pausePlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Download da gravação
  const downloadRecording = (recording: AudioRecording) => {
    const link = document.createElement('a');
    link.href = recording.audioUrl;
    link.download = `recording-${new Date(recording.timestamp).toISOString()}.${
      settings.format
    }`;
    link.click();
  };

  // Deletar gravação
  const deleteRecording = (id: string) => {
    setRecordings((prev) => {
      const recording = prev.find((r) => r.id === id);
      if (recording) {
        URL.revokeObjectURL(recording.audioUrl);
      }
      return prev.filter((r) => r.id !== id);
    });

    if (selectedRecording?.id === id) {
      setSelectedRecording(null);
      setIsPlaying(false);
      setPlaybackTime(0);
    }
  };

  // Obter MIME type
  const getMimeType = (format: string) => {
    switch (format) {
      case 'webm':
        return 'audio/webm';
      case 'mp4':
        return 'audio/mp4';
      case 'wav':
        return 'audio/wav';
      default:
        return 'audio/webm';
    }
  };

  // Formatação de tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Limpeza
  const cleanup = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    recordings.forEach((recording) => {
      URL.revokeObjectURL(recording.audioUrl);
    });
  };

  // Componente do waveform
  const WaveformDisplay: React.FC<{
    data: number[];
    isPlaying?: boolean;
    progress?: number;
  }> = ({ data, isPlaying = false, progress = 0 }) => {
    const maxHeight = 40;

    return (
      <div className="flex items-end justify-center space-x-1 h-12 bg-white/5 rounded-lg p-2">
        {data.map((value, index) => {
          const height = Math.max(2, value * maxHeight);
          const isActive = isPlaying && index / data.length <= progress;

          return (
            <div
              key={index}
              className={`w-1 rounded-sm transition-all duration-150 ${
                isActive ? 'bg-blue-400' : 'bg-white/30'
              }`}
              style={{ height: `${height}px` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controles principais de gravação */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Estúdio de Gravação
          </h2>
          <p className="text-gray-300">
            Grave suas sessões de prática para análise posterior
          </p>
        </div>

        {/* Indicador de nível de áudio */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4 mb-3">
            <FiMic className="w-5 h-5 text-gray-400" />
            <div className="flex-1 max-w-md">
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-green-400 to-yellow-400 transition-all duration-150"
                  style={{ width: `${audioLevel * 100}%` }}
                />
              </div>
            </div>
            <span className="text-sm text-gray-400 min-w-[40px]">
              {Math.round(audioLevel * 100)}%
            </span>
          </div>
        </div>

        {/* Timer da gravação */}
        {isRecording && (
          <div className="text-center mb-6">
            <div className="text-4xl font-mono font-bold text-red-400 mb-2">
              {formatTime(currentRecordingTime)}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isPaused ? 'bg-yellow-400' : 'bg-red-400 animate-pulse'
                }`}
              />
              <span className="text-gray-300">
                {isPaused ? 'Pausado' : 'Gravando'}
              </span>
            </div>
          </div>
        )}

        {/* Controles de gravação */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={audioLevel === 0}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-white shadow-lg hover:scale-105"
            >
              <FiMic className="w-8 h-8" />
            </button>
          ) : (
            <>
              <button
                onClick={toggleRecordingPause}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 flex items-center justify-center text-white shadow-lg hover:scale-105"
              >
                {isPaused ? (
                  <FiPlay className="w-6 h-6 ml-1" />
                ) : (
                  <FiPause className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={stopRecording}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center text-white shadow-lg hover:scale-105"
              >
                <BiStop className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Campos para seção e notas */}
        {isRecording && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Seção (ex: Exposição, Compassos 1-16)"
              value={recordingSection}
              onChange={(e) => setRecordingSection(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Notas rápidas sobre a gravação"
              value={recordingNotes}
              onChange={(e) => setRecordingNotes(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
            />
          </div>
        )}

        {/* Configurações de gravação */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-2 text-white transition-colors"
          >
            <FiSettings className="w-4 h-4" />
            <span>Configurações</span>
          </button>

          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Qualidade:</span>
            <select
              value={settings.quality}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  quality: e.target.value as any,
                }))
              }
              className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
            >
              <option value="low">Baixa (22kHz)</option>
              <option value="medium">Média (44kHz)</option>
              <option value="high">Alta (48kHz)</option>
            </select>
          </div>
        </div>

        {/* Configurações expandidas */}
        {showSettings && (
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              Configurações Avançadas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Formato
                </label>
                <select
                  value={settings.format}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      format: e.target.value as any,
                    }))
                  }
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                >
                  <option value="webm">WebM</option>
                  <option value="mp4">MP4</option>
                  <option value="wav">WAV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Canais
                </label>
                <select
                  value={settings.channels}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      channels: Number(e.target.value),
                    }))
                  }
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                >
                  <option value={1}>Mono</option>
                  <option value={2}>Stereo</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoGain"
                  checked={settings.autoGain}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      autoGain: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <label htmlFor="autoGain" className="text-sm text-gray-300">
                  Ganho automático
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="noiseReduction"
                  checked={settings.noiseReduction}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      noiseReduction: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <label
                  htmlFor="noiseReduction"
                  className="text-sm text-gray-300"
                >
                  Redução de ruído
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de gravações */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Gravações da Sessão</h3>
          <span className="text-sm text-gray-400">
            {recordings.length} gravações
          </span>
        </div>

        {recordings.length === 0 ? (
          <div className="text-center py-12">
            <FiMic className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhuma gravação ainda</p>
            <p className="text-sm text-gray-500">Comece gravando sua prática</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-white">
                        {recording.section ||
                          `Gravação ${recording.id.slice(-4)}`}
                      </h4>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {recording.quality}
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatTime(recording.duration)}
                      </span>
                    </div>

                    <div className="text-sm text-gray-400 mb-2">
                      {new Date(recording.timestamp).toLocaleString()}
                    </div>

                    {recording.notes && (
                      <p className="text-sm text-gray-300 bg-white/5 rounded p-2">
                        {recording.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Waveform */}
                <div className="mb-4">
                  <WaveformDisplay
                    data={recording.waveformData}
                    isPlaying={
                      selectedRecording?.id === recording.id && isPlaying
                    }
                    progress={
                      selectedRecording?.id === recording.id
                        ? playbackTime / recording.duration
                        : 0
                    }
                  />
                </div>

                {/* Controles da gravação */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => playRecording(recording)}
                      className="w-10 h-10 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors flex items-center justify-center text-green-400"
                    >
                      {selectedRecording?.id === recording.id && isPlaying ? (
                        <FiPause className="w-5 h-5" />
                      ) : (
                        <FiPlay className="w-5 h-5 ml-0.5" />
                      )}
                    </button>

                    {selectedRecording?.id === recording.id && (
                      <div className="text-sm text-gray-400">
                        {formatTime(playbackTime)} /{' '}
                        {formatTime(recording.duration)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadRecording(recording)}
                      className="w-8 h-8 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors flex items-center justify-center text-blue-400"
                      title="Download"
                    >
                      <FiDownload className="w-4 h-4" />
                    </button>

                    <button
                      className="w-8 h-8 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors flex items-center justify-center text-purple-400"
                      title="Compartilhar"
                    >
                      <FiShare2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteRecording(recording.id)}
                      className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors flex items-center justify-center text-red-400"
                      title="Deletar"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecordingSystem;
