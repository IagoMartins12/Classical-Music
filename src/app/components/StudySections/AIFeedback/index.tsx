import React, { useState, useEffect, useRef } from 'react';
import { BiBrain } from 'react-icons/bi';
import {
  FiMic,

  FiAlertCircle,
  FiCheckCircle,

  FiSettings,
  FiRefreshCw,

  FiDownload,
  FiShare2,
  FiMessageCircle,

  FiXCircle,
} from 'react-icons/fi';
import {
  GiArtificialIntelligence,

  GiLightBulb,
} from 'react-icons/gi';

interface AIFeedback {
  id: string;
  type:
    | 'tempo'
    | 'rhythm'
    | 'pitch'
    | 'dynamics'
    | 'technique'
    | 'expression'
    | 'general';
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: number;
  message: string;
  suggestion: string;
  confidence: number;
  section?: string;
  measure?: number;
  audioTimestamp?: number;
}

interface AudioAnalysis {
  pitch: {
    accuracy: number;
    stability: number;
    range: number;
    intonationErrors: number[];
  };
  rhythm: {
    accuracy: number;
    consistency: number;
    tempoVariation: number;
    timeSignatureAccuracy: number;
  };
  dynamics: {
    range: number;
    consistency: number;
    contrast: number;
    responsiveness: number;
  };
  technique: {
    articulation: number;
    fingerwork: number;
    breathing?: number; // For wind instruments
    bowing?: number; // For string instruments
  };
  overall: {
    musicality: number;
    expression: number;
    technicalProficiency: number;
    interpretation: number;
  };
}

interface AISettings {
  enabled: boolean;
  realTimeFeedback: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  focusAreas: string[];
  instrument: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  language: string;
  voiceFeedback: boolean;
  visualFeedback: boolean;
  positiveReinforcement: boolean;
}

const AIFeedbackSystem: React.FC<{
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  instrument?: string;
}> = ({
  isRecording = false,
  onStartRecording,
  instrument = 'piano',
}) => {
  const [aiSettings, setAISettings] = useState<AISettings>({
    enabled: true,
    realTimeFeedback: true,
    sensitivity: 'medium',
    focusAreas: ['pitch', 'rhythm', 'dynamics'],
    instrument,
    level: 'intermediate',
    language: 'pt-BR',
    voiceFeedback: false,
    visualFeedback: true,
    positiveReinforcement: true,
  });

  const [feedback, setFeedback] = useState<AIFeedback[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AudioAnalysis | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState<string>('all');

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Inicializar sistema de áudio
  useEffect(() => {
    if (aiSettings.enabled && isRecording) {
      initializeAudioAnalysis();
    } else {
      stopAudioAnalysis();
    }

    return () => {
      stopAudioAnalysis();
    };
  }, [aiSettings.enabled, isRecording]);

  const initializeAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();

      analyserRef.current.fftSize = 4096;
      analyserRef.current.smoothingTimeConstant = 0.3;

      source.connect(analyserRef.current);

      setIsAnalyzing(true);
      startRealTimeAnalysis();
    } catch (error) {
      console.error('Erro ao inicializar análise de áudio:', error);
      // addFeedback({
      //   type: 'general',
      //   severity: 'error',
      //   message: 'Erro ao acessar microfone',
      //   suggestion: 'Verifique as permissões do navegador',
      //   confidence: 100,
      // });
    }
  };

  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsAnalyzing(false);
  };

  const startRealTimeAnalysis = () => {
    if (!analyserRef.current || !aiSettings.realTimeFeedback) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const frequencyArray = new Float32Array(bufferLength);

    let analysisCounter = 0;

    const analyze = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteTimeDomainData(dataArray);
      analyserRef.current.getFloatFrequencyData(frequencyArray);

      // Analisar a cada 30 frames (~500ms)
      analysisCounter++;
      if (analysisCounter >= 30) {
        performAudioAnalysis(dataArray, frequencyArray);
        analysisCounter = 0;
      }

      animationFrameRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  };

  const performAudioAnalysis = (
    timeData: Uint8Array,
    frequencyData: Float32Array
  ) => {
    const analysis = analyzeAudioData(timeData, frequencyData);
    setCurrentAnalysis(analysis);

    // Gerar feedback baseado na análise
    generateRealtimeFeedback(analysis);
  };

  const analyzeAudioData = (
    timeData: Uint8Array,
    frequencyData: Float32Array
  ): AudioAnalysis => {
    // Análise básica simulada (em produção seria muito mais complexa)

    // Detectar fundamental frequency
    const fundamentalFreq = detectFundamentalFrequency(frequencyData);

    // Calcular RMS para volume
    const rms = calculateRMS(timeData);

    // Detectar pitch accuracy
    const pitchAccuracy = calculatePitchAccuracy(fundamentalFreq);

    // Analisar estabilidade temporal
    const rhythmAccuracy = analyzeRhythmicStability(timeData);

    // Analisar dinâmicas
    const dynamicRange = analyzeDynamicRange(rms);

    return {
      pitch: {
        accuracy: pitchAccuracy,
        stability: Math.random() * 20 + 80, // Simulado
        range: Math.random() * 30 + 70,
        intonationErrors: [],
      },
      rhythm: {
        accuracy: rhythmAccuracy,
        consistency: Math.random() * 25 + 75,
        tempoVariation: Math.random() * 10 + 5,
        timeSignatureAccuracy: Math.random() * 20 + 80,
      },
      dynamics: {
        range: dynamicRange,
        consistency: Math.random() * 20 + 80,
        contrast: Math.random() * 25 + 75,
        responsiveness: Math.random() * 15 + 85,
      },
      technique: {
        articulation: Math.random() * 20 + 80,
        fingerwork: Math.random() * 25 + 75,
        ...(instrument === 'trumpet' && { breathing: Math.random() * 20 + 80 }),
        ...(instrument === 'violin' && { bowing: Math.random() * 15 + 85 }),
      },
      overall: {
        musicality: Math.random() * 20 + 80,
        expression: Math.random() * 25 + 75,
        technicalProficiency: Math.random() * 15 + 85,
        interpretation: Math.random() * 30 + 70,
      },
    };
  };

  const detectFundamentalFrequency = (frequencyData: Float32Array): number => {
    // Implementação simplificada de detecção de pitch
    let maxIndex = 0;
    let maxValue = -Infinity;

    for (let i = 0; i < frequencyData.length; i++) {
      if (frequencyData[i] > maxValue) {
        maxValue = frequencyData[i];
        maxIndex = i;
      }
    }

    // Converter índice para frequência
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    return (maxIndex * sampleRate) / (frequencyData.length * 2);
  };

  const calculateRMS = (timeData: Uint8Array): number => {
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      const normalized = (timeData[i] - 128) / 128;
      sum += normalized * normalized;
    }
    return Math.sqrt(sum / timeData.length);
  };

  const calculatePitchAccuracy = (frequency: number): number => {
    // Lógica simplificada para calcular precisão de afinação
    if (frequency < 80 || frequency > 4000) return 100; // Fora do range musical

    // Simular análise de afinação
    return Math.random() * 20 + 80;
  };

  const analyzeRhythmicStability = (timeData: Uint8Array): number => {
    console.log('timeData', timeData)
    // Análise simplificada de estabilidade rítmica
    return Math.random() * 25 + 75;
  };

  const analyzeDynamicRange = (rms: number): number => {
    // Converter RMS em score de dinâmica
    return Math.min(rms * 1000, 100);
  };

  const generateRealtimeFeedback = (analysis: AudioAnalysis) => {
    const now = Date.now();

    // Feedback sobre afinação
    if (
      analysis.pitch.accuracy < 70 &&
      aiSettings.focusAreas.includes('pitch')
    ) {
      addFeedback({
        type: 'pitch',
        severity: 'warning',
        message: 'Afinação fora do padrão detectada',
        suggestion: 'Ajuste a afinação e use um afinador como referência',
        confidence: 100 - analysis.pitch.accuracy,
        timestamp: now,
      });
    }

    // Feedback sobre ritmo
    if (
      analysis.rhythm.accuracy < 75 &&
      aiSettings.focusAreas.includes('rhythm')
    ) {
      addFeedback({
        type: 'rhythm',
        severity: 'warning',
        message: 'Instabilidade rítmica detectada',
        suggestion: 'Use metrônomo e pratique em andamento mais lento',
        confidence: 100 - analysis.rhythm.accuracy,
        timestamp: now,
      });
    }

    // Feedback sobre dinâmica
    if (
      analysis.dynamics.range < 30 &&
      aiSettings.focusAreas.includes('dynamics')
    ) {
      addFeedback({
        type: 'dynamics',
        severity: 'info',
        message: 'Pouca variação dinâmica',
        suggestion: 'Explore contrastes entre forte e piano',
        confidence: 70,
        timestamp: now,
      });
    }

    // Feedback positivo
    if (
      aiSettings.positiveReinforcement &&
      analysis.overall.technicalProficiency > 90
    ) {
      addFeedback({
        type: 'general',
        severity: 'success',
        message: 'Excelente execução técnica!',
        suggestion: 'Continue assim, sua técnica está muito boa',
        confidence: analysis.overall.technicalProficiency,
        timestamp: now,
      });
    }
  };

  const addFeedback = (feedbackData: Omit<AIFeedback, 'id'>) => {
    const newFeedback: AIFeedback = {
      ...feedbackData,
      id: Date.now().toString(),
      timestamp: feedbackData.timestamp || Date.now(),
    };

    setFeedback((prev) => [newFeedback, ...prev.slice(0, 49)]); // Keep last 50

    // Voice feedback if enabled
    if (aiSettings.voiceFeedback && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(newFeedback.message);
      utterance.lang = aiSettings.language;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  const performDetailedAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      // Simular análise detalhada
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const detailedAnalysis: AudioAnalysis = {
        pitch: {
          accuracy: 85 + Math.random() * 10,
          stability: 88 + Math.random() * 8,
          range: 75 + Math.random() * 15,
          intonationErrors: [12, 24, 36], // Measures with issues
        },
        rhythm: {
          accuracy: 82 + Math.random() * 12,
          consistency: 79 + Math.random() * 15,
          tempoVariation: 5 + Math.random() * 8,
          timeSignatureAccuracy: 91 + Math.random() * 7,
        },
        dynamics: {
          range: 68 + Math.random() * 20,
          consistency: 74 + Math.random() * 18,
          contrast: 71 + Math.random() * 22,
          responsiveness: 84 + Math.random() * 12,
        },
        technique: {
          articulation: 86 + Math.random() * 10,
          fingerwork: 78 + Math.random() * 15,
          ...(instrument === 'trumpet' && {
            breathing: 82 + Math.random() * 12,
          }),
          ...(instrument === 'violin' && { bowing: 88 + Math.random() * 8 }),
        },
        overall: {
          musicality: 81 + Math.random() * 14,
          expression: 76 + Math.random() * 18,
          technicalProficiency: 84 + Math.random() * 11,
          interpretation: 73 + Math.random() * 20,
        },
      };

      setCurrentAnalysis(detailedAnalysis);
      generateDetailedFeedback(detailedAnalysis);
    } catch (error) {
      console.error('Erro na análise detalhada:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateDetailedFeedback = (analysis: AudioAnalysis) => {
    const suggestions = [];

    // Análise de pitch
    if (analysis.pitch.accuracy < 80) {
      suggestions.push({
        type: 'pitch',
        severity: 'warning',
        message: `Precisão de afinação: ${analysis.pitch.accuracy.toFixed(1)}%`,
        suggestion: 'Trabalhe exercícios de afinação com drone/bordão',
        confidence: 90,
      });
    }

    // Análise de ritmo
    if (analysis.rhythm.consistency < 75) {
      suggestions.push({
        type: 'rhythm',
        severity: 'warning',
        message: `Consistência rítmica: ${analysis.rhythm.consistency.toFixed(
          1
        )}%`,
        suggestion: 'Pratique com metrônomo, começando lento',
        confidence: 85,
      });
    }

    // Análise de dinâmica
    if (analysis.dynamics.range < 60) {
      suggestions.push({
        type: 'dynamics',
        severity: 'info',
        message: `Contraste dinâmico limitado: ${analysis.dynamics.range.toFixed(
          1
        )}%`,
        suggestion: 'Exagere as diferenças entre p e f',
        confidence: 80,
      });
    }

    // Análise técnica
    if (analysis.technique.articulation < 80) {
      suggestions.push({
        type: 'technique',
        severity: 'warning',
        message: `Articulação precisa melhorar: ${analysis.technique.articulation.toFixed(
          1
        )}%`,
        suggestion: 'Pratique exercícios de staccato e legato',
        confidence: 88,
      });
    }

    // Feedback positivo
    if (analysis.overall.musicality > 85) {
      suggestions.push({
        type: 'general',
        severity: 'success',
        message: 'Excelente musicalidade demonstrada!',
        suggestion: 'Continue explorando sua expressividade',
        confidence: 95,
      });
    }

    // suggestions.forEach((suggestion) => addFeedback(suggestion));
  };

  const clearFeedback = () => {
    setFeedback([]);
  };

  const exportFeedback = () => {
    const data = {
      feedback,
      analysis: currentAnalysis,
      settings: aiSettings,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-feedback-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredFeedback = feedback.filter(
    (f) => feedbackFilter === 'all' || f.type === feedbackFilter
  );

  const ScoreCircle: React.FC<{
    score: number;
    label: string;
    color?: string;
  }> = ({ score, label, color = 'blue' }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke={`var(--color-${color}-400)`}
              strokeWidth="6"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-white">
              {Math.round(score)}
            </span>
          </div>
        </div>
        <span className="text-sm text-gray-400 mt-2 text-center">{label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <GiArtificialIntelligence className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Feedback com IA</h2>
            <p className="text-sm text-gray-400">
              {isAnalyzing
                ? 'Analisando sua performance...'
                : 'Pronto para análise'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isRecording ? (
            <div className="flex items-center space-x-2 bg-red-500/20 border border-red-500/40 rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span className="text-red-400 text-sm font-medium">Gravando</span>
            </div>
          ) : (
            <button
              onClick={onStartRecording}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FiMic className="w-4 h-4" />
              <span>Iniciar Análise</span>
            </button>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors flex items-center justify-center text-white"
          >
            <FiSettings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Configurações */}
      {showSettings && (
        <div className="bg-white/5 rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            Configurações da IA
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sensibilidade
              </label>
              <select
                value={aiSettings.sensitivity}
                onChange={(e) =>
                  setAISettings((prev) => ({
                    ...prev,
                    sensitivity: e.target.value as any,
                  }))
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nível
              </label>
              <select
                value={aiSettings.level}
                onChange={(e) =>
                  setAISettings((prev) => ({
                    ...prev,
                    level: e.target.value as any,
                  }))
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
                <option value="professional">Profissional</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Áreas de Foco
              </label>
              <div className="space-y-2">
                {['pitch', 'rhythm', 'dynamics', 'technique'].map((area) => (
                  <label
                    key={area}
                    className="flex items-center space-x-2 text-white text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={aiSettings.focusAreas.includes(area)}
                      onChange={(e) => {
                        const newAreas = e.target.checked
                          ? [...aiSettings.focusAreas, area]
                          : aiSettings.focusAreas.filter((a) => a !== area);
                        setAISettings((prev) => ({
                          ...prev,
                          focusAreas: newAreas,
                        }));
                      }}
                      className="rounded"
                    />
                    <span className="capitalize">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-6">
            <label className="flex items-center space-x-2 text-white">
              <input
                type="checkbox"
                checked={aiSettings.realTimeFeedback}
                onChange={(e) =>
                  setAISettings((prev) => ({
                    ...prev,
                    realTimeFeedback: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span>Feedback em tempo real</span>
            </label>

            <label className="flex items-center space-x-2 text-white">
              <input
                type="checkbox"
                checked={aiSettings.voiceFeedback}
                onChange={(e) =>
                  setAISettings((prev) => ({
                    ...prev,
                    voiceFeedback: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span>Feedback por voz</span>
            </label>

            <label className="flex items-center space-x-2 text-white">
              <input
                type="checkbox"
                checked={aiSettings.positiveReinforcement}
                onChange={(e) =>
                  setAISettings((prev) => ({
                    ...prev,
                    positiveReinforcement: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span>Reforço positivo</span>
            </label>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análise em tempo real */}
        {currentAnalysis && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                Análise em Tempo Real
              </h3>
              <button
                onClick={performDetailedAnalysis}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analisando...</span>
                  </>
                ) : (
                  <>
                    <BiBrain className="w-4 h-4" />
                    <span>Análise Detalhada</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <ScoreCircle
                score={currentAnalysis.pitch.accuracy}
                label="Afinação"
                color="blue"
              />
              <ScoreCircle
                score={currentAnalysis.rhythm.accuracy}
                label="Ritmo"
                color="green"
              />
              <ScoreCircle
                score={currentAnalysis.dynamics.range}
                label="Dinâmica"
                color="orange"
              />
              <ScoreCircle
                score={currentAnalysis.overall.musicality}
                label="Musicalidade"
                color="purple"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Técnica Geral</span>
                <span className="text-white font-medium">
                  {currentAnalysis.overall.technicalProficiency.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-1000"
                  style={{
                    width: `${currentAnalysis.overall.technicalProficiency}%`,
                  }}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Expressividade</span>
                <span className="text-white font-medium">
                  {currentAnalysis.overall.expression.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: `${currentAnalysis.overall.expression}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Feedback em tempo real */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Feedback</h3>
            <div className="flex items-center space-x-2">
              <select
                value={feedbackFilter}
                onChange={(e) => setFeedbackFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
              >
                <option value="all">Todos</option>
                <option value="pitch">Afinação</option>
                <option value="rhythm">Ritmo</option>
                <option value="dynamics">Dinâmica</option>
                <option value="technique">Técnica</option>
              </select>

              <button
                onClick={clearFeedback}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded transition-colors flex items-center justify-center text-white"
              >
                <FiRefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-8">
                <FiMessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Nenhum feedback ainda</p>
                <p className="text-sm text-gray-500">
                  Comece a tocar para receber análises
                </p>
              </div>
            ) : (
              filteredFeedback.map((item) => {
                const severityColors = {
                  info: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
                  warning:
                    'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
                  error: 'bg-red-500/20 border-red-500/40 text-red-300',
                  success: 'bg-green-500/20 border-green-500/40 text-green-300',
                };

                const severityIcons = {
                  info: GiLightBulb,
                  warning: FiAlertCircle,
                  error: FiXCircle,
                  success: FiCheckCircle,
                };

                const Icon = severityIcons[item.severity];

                return (
                  <div
                    key={item.id}
                    className={`rounded-lg p-4 border ${
                      severityColors[item.severity]
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="w-5 h-5 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium mb-1">{item.message}</div>
                        <div className="text-sm opacity-75 mb-2">
                          {item.suggestion}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="opacity-60">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="opacity-60">
                            Confiança: {item.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={exportFeedback}
          disabled={feedback.length === 0}
          className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 border border-white/20 rounded-lg px-4 py-2 text-white transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          <span>Exportar Feedback</span>
        </button>

        <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-2 text-white transition-colors">
          <FiShare2 className="w-4 h-4" />
          <span>Compartilhar Análise</span>
        </button>
      </div>
    </div>
  );
};

export default AIFeedbackSystem;
