// app/components/StudyMode/components/StudySessionSummary.tsx
'use client';

import React, { useState } from 'react';
import {
  FiClock,
  FiTarget,
  FiBookmark,
  FiEdit3,
  FiMusic,
  FiTrendingUp,
  FiStar,
  FiCheckCircle,
  FiX,
  FiDownload,
  FiShare2,
  FiRefreshCw,
  FiAward,
  FiHeart,
  FiZap,
} from 'react-icons/fi';
import { StudySession } from '../StudyModeClient';
import { WorkDetails } from '@/app/requests/work-details';
import { useToast } from '@/app/hooks/useToast';

interface StudySessionSummaryProps {
  session: StudySession;
  work: WorkDetails;
  onClose: () => void;
}

interface PostPracticeEvaluation {
  rating: number;
  notes: string;
  nextSessionGoals: string[];
  technicalFocus: string[];
  expressiveFocus: string[];
  precisionFocus: string[];
  difficulty: number;
  enjoyment: number;
  wouldRecommend: boolean;
  highlights: string[];
  challenges: string[];
}

const RATING_LABELS = [
  { value: 1, label: 'Insatisfatório', emoji: '😔', color: 'text-red-500' },
  {
    value: 2,
    label: 'Abaixo do esperado',
    emoji: '😐',
    color: 'text-orange-500',
  },
  { value: 3, label: 'Satisfatório', emoji: '🙂', color: 'text-yellow-500' },
  { value: 4, label: 'Bom', emoji: '😊', color: 'text-blue-500' },
  { value: 5, label: 'Excelente', emoji: '🤩', color: 'text-green-500' },
];

// const FOCUS_SUGGESTIONS = {
//   TECHNICAL: ['Dedilhado', 'Articulação', 'Velocidade', 'Precisão técnica'],
//   EXPRESSIVITY: ['Dinâmicas', 'Fraseado', 'Rubato', 'Caráter'],
//   PRECISION: ['Ritmo', 'Afinação', 'Sincronia', 'Timing'],
//   SIGHT_READING: ['Leitura de notas', 'Reconhecimento de padrões', 'Fluência'],
//   MEMORIZATION: [
//     'Memorização auditiva',
//     'Memorização muscular',
//     'Análise harmônica',
//   ],
//   PERFORMANCE: ['Presença de palco', 'Controle de nervosismo', 'Comunicação'],
//   REVIEW: ['Manutenção', 'Polimento', 'Consolidação'],
// };

const StudySessionSummary: React.FC<StudySessionSummaryProps> = ({
  session,
  work,
  onClose,
}) => {
  const [showEvaluation, setShowEvaluation] = useState(true);
  const [evaluation, setEvaluation] = useState<PostPracticeEvaluation>({
    rating: 3,
    notes: '',
    nextSessionGoals: [],
    technicalFocus: [],
    expressiveFocus: [],
    precisionFocus: [],
    difficulty: 3,
    enjoyment: 3,
    wouldRecommend: true,
    highlights: [],
    challenges: [],
  });
  const [newGoal, setNewGoal] = useState('');
  const [newHighlight, setNewHighlight] = useState('');
  const [newChallenge, setNewChallenge] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Calcular estatísticas da sessão
  const sessionStats = {
    duration: session.duration,
    formattedDuration: formatDuration(session.duration),
    pagesViewed: session.pagesViewed.length,
    annotationsCreated: session.annotationsCreated,
    bookmarksCreated: session.bookmarksCreated,
    practiceGoals: session.practiceGoals.length,
    sectionsWorked: session.sectionsWorked.length,
    pauseCount: session.pauseCount,
    efficiency: calculateEfficiency(),
    milestone: getMilestone(),
  };

  // Formatação de duração
  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  }

  // Calcular eficiência da sessão
  function calculateEfficiency(): number {
    // Algoritmo simples: menos pausas = mais eficiência
    const maxPauses = Math.max(1, Math.floor(session.duration / 600)); // 1 pausa a cada 10min
    const efficiency = Math.max(0, 100 - (session.pauseCount / maxPauses) * 50);
    return Math.round(efficiency);
  }

  // Determinar milestone alcançado
  function getMilestone() {
    if (session.duration >= 7200)
      return { text: 'Maratonista!', icon: FiAward, color: 'text-purple-500' };
    if (session.duration >= 3600)
      return { text: 'Dedicação Total', icon: FiHeart, color: 'text-red-500' };
    if (session.duration >= 1800)
      return { text: 'Foco Intenso', icon: FiZap, color: 'text-yellow-500' };
    if (session.duration >= 900)
      return { text: 'Bom Ritmo', icon: FiTrendingUp, color: 'text-green-500' };
    if (session.duration >= 300)
      return { text: 'Aquecendo', icon: FiMusic, color: 'text-blue-500' };
    return {
      text: 'Primeiro Passo',
      icon: FiCheckCircle,
      color: 'text-gray-500',
    };
  }

  // Adicionar novo objetivo
  const addGoal = () => {
    if (newGoal.trim()) {
      setEvaluation((prev) => ({
        ...prev,
        nextSessionGoals: [...prev.nextSessionGoals, newGoal.trim()],
      }));
      setNewGoal('');
    }
  };

  // Adicionar destaque
  const addHighlight = () => {
    if (newHighlight.trim()) {
      setEvaluation((prev) => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight.trim()],
      }));
      setNewHighlight('');
    }
  };

  // Adicionar desafio
  const addChallenge = () => {
    if (newChallenge.trim()) {
      setEvaluation((prev) => ({
        ...prev,
        challenges: [...prev.challenges, newChallenge.trim()],
      }));
      setNewChallenge('');
    }
  };

  // Remover item de lista
  const removeFromList = (
    list: keyof PostPracticeEvaluation,
    index: number
  ) => {
    setEvaluation((prev) => ({
      ...prev,
      [list]: (prev[list] as string[]).filter((_, i) => i !== index),
    }));
  };

  const toast = useToast();
  // Toggle foco
  // const toggleFocus = (
  //   category: 'technicalFocus' | 'expressiveFocus' | 'precisionFocus',
  //   item: string
  // ) => {
  //   setEvaluation((prev) => {
  //     const currentList = prev[category];
  //     const isSelected = currentList.includes(item);

  //     return {
  //       ...prev,
  //       [category]: isSelected
  //         ? currentList.filter((i) => i !== item)
  //         : [...currentList, item],
  //     };
  //   });
  // };

  // Salvar avaliação
  const saveEvaluation = async () => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/study-sessions/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          evaluation,
        }),
      });

      if (response.ok) {
        setShowEvaluation(false);
      } else {
        throw new Error('Erro ao salvar avaliação');
      }
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      toast.error('Erro ao salvar avaliação. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Pular avaliação
  const skipEvaluation = () => {
    setShowEvaluation(false);
  };

  // Exportar resumo
  const exportSummary = () => {
    const summary = `
RESUMO DA SESSÃO DE ESTUDO

Obra: ${work.title}
Compositor: ${work.composer.fullName}
Data: ${new Date().toLocaleDateString('pt-BR')}
Duração: ${sessionStats.formattedDuration}

ESTATÍSTICAS:
• Páginas visualizadas: ${sessionStats.pagesViewed}
• Anotações criadas: ${sessionStats.annotationsCreated}
• Marcadores criados: ${sessionStats.bookmarksCreated}
• Objetivos definidos: ${sessionStats.practiceGoals}
• Seções trabalhadas: ${sessionStats.sectionsWorked}
• Eficiência: ${sessionStats.efficiency}%

OBJETIVOS DA SESSÃO:
${session.practiceGoals.map((goal) => `• ${goal}`).join('\n')}

SEÇÕES TRABALHADAS:
${session.sectionsWorked.map((section) => `• ${section}`).join('\n')}

NOTAS:
${session.studyNotes || 'Nenhuma anotação'}

${
  evaluation.rating > 0
    ? `
AVALIAÇÃO:
• Satisfação: ${evaluation.rating}/5 (${
        RATING_LABELS.find((r) => r.value === evaluation.rating)?.label
      })
• Dificuldade: ${evaluation.difficulty}/5
• Diversão: ${evaluation.enjoyment}/5

REFLEXÕES:
${evaluation.notes}

PRÓXIMOS OBJETIVOS:
${evaluation.nextSessionGoals.map((goal) => `• ${goal}`).join('\n')}
`
    : ''
}
    `.trim();

    // Copiar para clipboard
    navigator.clipboard.writeText(summary);
  };

  // const currentRating = RATING_LABELS.find(
  //   (r) => r.value === evaluation.rating
  // );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-elevated rounded-2xl border border-theme-primary max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {showEvaluation ? (
          /* Formulário de avaliação */
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-primary to-brand-secondary p-6 text-theme-primary">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Como foi sua sessão?</h2>
                  <p className="opacity-90">
                    {work.title} - {work.composer.fullName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {sessionStats.formattedDuration}
                  </div>
                  <div className="text-sm opacity-75">Tempo total</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Avaliação principal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-theme-primary">
                  Avaliação Geral
                </h3>

                {/* Rating principal */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-theme-secondary">
                    Como você avalia esta sessão?
                  </label>
                  <div className="flex justify-center space-x-2">
                    {RATING_LABELS.map((rating) => (
                      <button
                        key={rating.value}
                        onClick={() =>
                          setEvaluation((prev) => ({
                            ...prev,
                            rating: rating.value,
                          }))
                        }
                        className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                          evaluation.rating === rating.value
                            ? 'bg-brand-gradient text-theme-primary shadow-theme-glow'
                            : 'bg-theme-elevated border border-theme-secondary hover:bg-interactive-hover'
                        }`}
                      >
                        <span className="text-2xl mb-1">{rating.emoji}</span>
                        <span className="text-xs font-medium">
                          {rating.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Métricas secundárias */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-theme-secondary">
                      Dificuldade percebida: {evaluation.difficulty}/5
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={evaluation.difficulty}
                      onChange={(e) =>
                        setEvaluation((prev) => ({
                          ...prev,
                          difficulty: parseInt(e.target.value),
                        }))
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-theme-secondary">
                      Diversão: {evaluation.enjoyment}/5
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={evaluation.enjoyment}
                      onChange={(e) =>
                        setEvaluation((prev) => ({
                          ...prev,
                          enjoyment: parseInt(e.target.value),
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Reflexões */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-theme-primary">
                  Reflexões
                </h3>

                <textarea
                  value={evaluation.notes}
                  onChange={(e) =>
                    setEvaluation((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Como você se sentiu? O que funcionou bem? O que pode melhorar na próxima sessão?"
                  className="w-full h-24 bg-theme-primary border border-theme-secondary rounded-xl px-4 py-3 text-theme-primary placeholder-theme-tertiary resize-none focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Destaques e desafios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Destaques */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-theme-primary flex items-center space-x-2">
                    <FiStar className="w-4 h-4 text-accent-green" />
                    <span>Destaques</span>
                  </h4>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newHighlight}
                      onChange={(e) => setNewHighlight(e.target.value)}
                      placeholder="O que foi especialmente bom?"
                      className="flex-1 bg-theme-primary border border-theme-secondary rounded-xl px-3 py-2 text-theme-primary placeholder-theme-tertiary text-sm focus:outline-none focus:border-brand-primary"
                      onKeyPress={(e) => e.key === 'Enter' && addHighlight()}
                    />
                    <button
                      onClick={addHighlight}
                      className="bg-accent-green text-theme-primary px-3 py-2 rounded-xl hover:scale-105 transition-all duration-300 text-sm"
                    >
                      +
                    </button>
                  </div>

                  <div className="space-y-1">
                    {evaluation.highlights.map((highlight, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-accent-green/10 border border-accent-green/30 rounded-xl p-2 text-sm"
                      >
                        <span className="text-accent-green">{highlight}</span>
                        <button
                          onClick={() => removeFromList('highlights', index)}
                          className="text-accent-red hover:bg-accent-red/20 rounded p-1"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desafios */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-theme-primary flex items-center space-x-2">
                    <FiTarget className="w-4 h-4 text-accent-orange" />
                    <span>Desafios</span>
                  </h4>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newChallenge}
                      onChange={(e) => setNewChallenge(e.target.value)}
                      placeholder="O que foi mais difícil?"
                      className="flex-1 bg-theme-primary border border-theme-secondary rounded-xl px-3 py-2 text-theme-primary placeholder-theme-tertiary text-sm focus:outline-none focus:border-brand-primary"
                      onKeyPress={(e) => e.key === 'Enter' && addChallenge()}
                    />
                    <button
                      onClick={addChallenge}
                      className="bg-accent-orange text-theme-primary px-3 py-2 rounded-xl hover:scale-105 transition-all duration-300 text-sm"
                    >
                      +
                    </button>
                  </div>

                  <div className="space-y-1">
                    {evaluation.challenges.map((challenge, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-accent-orange/10 border border-accent-orange/30 rounded-xl p-2 text-sm"
                      >
                        <span className="text-accent-orange">{challenge}</span>
                        <button
                          onClick={() => removeFromList('challenges', index)}
                          className="text-accent-red hover:bg-accent-red/20 rounded p-1"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Objetivos para próxima sessão */}
              <div className="space-y-3">
                <h4 className="font-semibold text-theme-primary flex items-center space-x-2">
                  <FiRefreshCw className="w-4 h-4 text-accent-blue" />
                  <span>Objetivos para Próxima Sessão</span>
                </h4>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="O que focar na próxima vez?"
                    className="flex-1 bg-theme-primary border border-theme-secondary rounded-xl px-3 py-2 text-theme-primary placeholder-theme-tertiary text-sm focus:outline-none focus:border-brand-primary"
                    onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                  />
                  <button
                    onClick={addGoal}
                    className="bg-accent-blue text-theme-primary px-3 py-2 rounded-xl hover:scale-105 transition-all duration-300 text-sm"
                  >
                    +
                  </button>
                </div>

                <div className="space-y-1">
                  {evaluation.nextSessionGoals.map((goal, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-accent-blue/10 border border-accent-blue/30 rounded-xl p-2 text-sm"
                    >
                      <span className="text-accent-blue">{goal}</span>
                      <button
                        onClick={() =>
                          removeFromList('nextSessionGoals', index)
                        }
                        className="text-accent-red hover:bg-accent-red/20 rounded p-1"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-theme-secondary p-6 flex justify-end space-x-3">
              <button
                onClick={skipEvaluation}
                className="px-6 py-2 bg-theme-elevated border border-theme-secondary rounded-xl hover:bg-interactive-hover transition-all duration-300 text-theme-primary"
              >
                Pular Avaliação
              </button>

              <button
                onClick={saveEvaluation}
                disabled={isSaving}
                className="px-6 py-2 bg-brand-gradient text-theme-primary rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="w-4 h-4" />
                    <span>Finalizar Sessão</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Resumo final */
          <div className="overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-primary to-brand-secondary p-6 text-theme-primary">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Sessão Concluída!</h2>
                  <p className="opacity-90">
                    {work.title} - {work.composer.fullName}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Milestone */}
            <div className="p-6 text-center">
              <div
                className={`w-20 h-20 ${sessionStats.milestone.color.replace(
                  'text-',
                  'bg-'
                )}/20 rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <sessionStats.milestone.icon
                  className={`w-10 h-10 ${sessionStats.milestone.color}`}
                />
              </div>
              <h3 className="text-xl font-bold text-theme-primary mb-2">
                {sessionStats.milestone.text}
              </h3>
              <p className="text-theme-secondary">
                Você estudou por {sessionStats.formattedDuration}!
              </p>
            </div>

            {/* Estatísticas */}
            <div className="px-6 pb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-theme-elevated border border-theme-secondary rounded-xl p-4 text-center">
                  <FiClock className="w-6 h-6 text-brand-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-theme-primary">
                    {sessionStats.formattedDuration}
                  </div>
                  <div className="text-sm text-theme-secondary">Duração</div>
                </div>

                <div className="bg-theme-elevated border border-theme-secondary rounded-xl p-4 text-center">
                  <FiBookmark className="w-6 h-6 text-accent-blue mx-auto mb-2" />
                  <div className="text-2xl font-bold text-theme-primary">
                    {sessionStats.pagesViewed}
                  </div>
                  <div className="text-sm text-theme-secondary">Páginas</div>
                </div>

                <div className="bg-theme-elevated border border-theme-secondary rounded-xl p-4 text-center">
                  <FiEdit3 className="w-6 h-6 text-accent-green mx-auto mb-2" />
                  <div className="text-2xl font-bold text-theme-primary">
                    {sessionStats.annotationsCreated}
                  </div>
                  <div className="text-sm text-theme-secondary">Anotações</div>
                </div>

                <div className="bg-theme-elevated border border-theme-secondary rounded-xl p-4 text-center">
                  <FiTrendingUp className="w-6 h-6 text-accent-purple mx-auto mb-2" />
                  <div className="text-2xl font-bold text-theme-primary">
                    {sessionStats.efficiency}%
                  </div>
                  <div className="text-sm text-theme-secondary">Eficiência</div>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="border-t border-theme-secondary p-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={exportSummary}
                className="flex items-center space-x-2 px-4 py-2 bg-theme-elevated border border-theme-secondary rounded-xl hover:bg-interactive-hover transition-all duration-300 text-theme-primary"
              >
                <FiDownload className="w-4 h-4" />
                <span>Exportar Resumo</span>
              </button>

              <button
                onClick={() => {
                  /* Implementar compartilhamento */
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-theme-elevated border border-theme-secondary rounded-xl hover:bg-interactive-hover transition-all duration-300 text-theme-primary"
              >
                <FiShare2 className="w-4 h-4" />
                <span>Compartilhar</span>
              </button>

              <button
                onClick={onClose}
                className="flex items-center space-x-2 px-6 py-2 bg-brand-gradient text-theme-primary rounded-xl hover:scale-105 transition-all duration-300"
              >
                <FiCheckCircle className="w-4 h-4" />
                <span>Continuar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudySessionSummary;
