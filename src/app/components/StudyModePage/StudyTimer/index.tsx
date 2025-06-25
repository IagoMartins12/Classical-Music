// app/components/StudyMode/components/StudyTimer.tsx
'use client';

import React, { useState } from 'react';
import {
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiTarget,
  FiTrendingUp,
  FiCalendar,
  FiAward,
} from 'react-icons/fi';
import { StudySession } from '../StudyModeClient';

interface StudyTimerProps {
  session: StudySession;
  onTogglePause: () => void;
  onReset: () => void;
  onUpdateSession: (updates: Partial<StudySession>) => void;
}

const StudyTimer: React.FC<StudyTimerProps> = ({
  session,
  onTogglePause,
  onReset,
  onUpdateSession,
}) => {
  const [newGoal, setNewGoal] = useState('');
  const [newSection, setNewSection] = useState('');

  // Formatação do tempo
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(
        2,
        '0'
      )}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Calcular tempo de sessão para milestone
  const getSessionMilestone = (duration: number): string => {
    if (duration >= 3600) return '1+ hora de prática!';
    if (duration >= 1800) return '30+ minutos!';
    if (duration >= 900) return '15+ minutos!';
    if (duration >= 300) return '5+ minutos!';
    return 'Começando...';
  };

  // Cor do progresso baseada no tempo
  const getProgressColor = (duration: number): string => {
    if (duration >= 3600) return 'from-purple-500 to-pink-500';
    if (duration >= 1800) return 'from-green-500 to-blue-500';
    if (duration >= 900) return 'from-blue-500 to-purple-500';
    if (duration >= 300) return 'from-brand-primary to-brand-secondary';
    return 'from-gray-400 to-gray-500';
  };

  // Adicionar objetivo
  const addGoal = () => {
    if (newGoal.trim()) {
      onUpdateSession({
        practiceGoals: [...session.practiceGoals, newGoal.trim()],
      });
      setNewGoal('');
    }
  };

  // Remover objetivo
  const removeGoal = (index: number) => {
    const updatedGoals = session.practiceGoals.filter((_, i) => i !== index);
    onUpdateSession({ practiceGoals: updatedGoals });
  };

  // Adicionar seção trabalhada
  const addSection = () => {
    if (newSection.trim()) {
      onUpdateSession({
        sectionsWorked: [...session.sectionsWorked, newSection.trim()],
      });
      setNewSection('');
    }
  };

  // Remover seção
  const removeSection = (index: number) => {
    const updatedSections = session.sectionsWorked.filter(
      (_, i) => i !== index
    );
    onUpdateSession({ sectionsWorked: updatedSections });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Timer principal */}
      <div className="text-center space-y-4">
        <div className="relative">
          {/* Círculo de progresso decorativo */}
          <div className="w-32 h-32 mx-auto relative">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-theme-secondary/20"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${Math.min(
                  (session.duration / 3600) * 282,
                  282
                )} 282`}
                className="transition-all duration-300"
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient
                  id="progressGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    className="text-brand-primary"
                    stopColor="currentColor"
                  />
                  <stop
                    offset="100%"
                    className="text-brand-secondary"
                    stopColor="currentColor"
                  />
                </linearGradient>
              </defs>
            </svg>

            {/* Timer display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-theme-primary">
                  {formatTime(session.duration)}
                </div>
                <div className="text-xs text-theme-secondary">
                  {session.isPaused ? 'Pausado' : 'Ativo'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Milestone badge */}
        <div className="flex items-center justify-center">
          <div
            className={`px-4 py-2 rounded-full bg-gradient-to-r ${getProgressColor(
              session.duration
            )} text-white text-sm font-medium flex items-center space-x-2`}
          >
            <FiAward className="w-4 h-4" />
            <span>{getSessionMilestone(session.duration)}</span>
          </div>
        </div>

        {/* Controles principais */}
        <div className="flex justify-center space-x-3">
          <button
            onClick={onTogglePause}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
              session.isPaused
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
            }`}
          >
            {session.isPaused ? (
              <FiPlay className="w-5 h-5" />
            ) : (
              <FiPause className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={onReset}
            className="w-12 h-12 bg-theme-elevated border border-theme-secondary rounded-xl hover:bg-interactive-hover transition-all duration-300 flex items-center justify-center hover:scale-110"
          >
            <FiRotateCcw className="w-5 h-5 text-theme-primary" />
          </button>
        </div>
      </div>

      {/* Estatísticas da sessão */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-theme-elevated border border-theme-secondary rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-brand-primary mb-1">
            {session.pauseCount}
          </div>
          <div className="text-sm text-theme-secondary">Pausas</div>
        </div>

        <div className="bg-theme-elevated border border-theme-secondary rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-brand-primary mb-1">
            {session.restartCount}
          </div>
          <div className="text-sm text-theme-secondary">Reinícios</div>
        </div>
      </div>

      {/* Objetivos da sessão */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <FiTarget className="w-5 h-5 text-accent-blue" />
          <h3 className="text-lg font-semibold text-theme-primary">
            Objetivos da Sessão
          </h3>
        </div>

        {/* Adicionar objetivo */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Ex: Trabalhar a passagem do comp. 15-20"
            className="flex-1 bg-theme-elevated border border-theme-secondary rounded-xl px-3 py-2 text-theme-primary placeholder-theme-tertiary text-sm focus:outline-none focus:border-brand-primary"
            onKeyPress={(e) => e.key === 'Enter' && addGoal()}
          />
          <button
            onClick={addGoal}
            className="bg-brand-gradient text-theme-primary px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300 text-sm font-medium"
          >
            Adicionar
          </button>
        </div>

        {/* Lista de objetivos */}
        <div className="space-y-2">
          {session.practiceGoals.map((goal, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-theme-elevated border border-theme-secondary rounded-xl p-3 group hover:shadow-theme-glow transition-all duration-300"
            >
              <span className="text-theme-primary text-sm flex-1">{goal}</span>
              <button
                onClick={() => removeGoal(index)}
                className="text-accent-red hover:bg-accent-red/10 rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}

          {session.practiceGoals.length === 0 && (
            <div className="text-center py-8 text-theme-tertiary">
              <FiTarget className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum objetivo definido</p>
              <p className="text-xs">
                Adicione objetivos para sua sessão de estudo
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Seções trabalhadas */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <FiTrendingUp className="w-5 h-5 text-accent-green" />
          <h3 className="text-lg font-semibold text-theme-primary">
            Seções Trabalhadas
          </h3>
        </div>

        {/* Adicionar seção */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
            placeholder="Ex: Compassos 1-16, Desenvolvimento"
            className="flex-1 bg-theme-elevated border border-theme-secondary rounded-xl px-3 py-2 text-theme-primary placeholder-theme-tertiary text-sm focus:outline-none focus:border-brand-primary"
            onKeyPress={(e) => e.key === 'Enter' && addSection()}
          />
          <button
            onClick={addSection}
            className="bg-accent-green text-theme-primary px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300 text-sm font-medium"
          >
            Adicionar
          </button>
        </div>

        {/* Lista de seções */}
        <div className="space-y-2">
          {session.sectionsWorked.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {session.sectionsWorked.map((section, index) => (
                <div
                  key={index}
                  className="bg-accent-green/10 border border-accent-green/30 text-accent-green px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 group hover:bg-accent-green/20 transition-all duration-300"
                >
                  <span>{section}</span>
                  <button
                    onClick={() => removeSection(index)}
                    className="opacity-0 group-hover:opacity-100 hover:bg-accent-red/20 rounded-full p-0.5 transition-all duration-300"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-theme-tertiary">
              <FiTrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma seção registrada</p>
              <p className="text-xs">
                Registre as seções que você está trabalhando
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-3">
          <FiCalendar className="w-4 h-4 text-brand-primary" />
          <span className="text-sm font-medium text-theme-secondary">
            Resumo da Sessão
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-theme-tertiary">Objetivos:</span>
            <span className="font-semibold text-theme-primary">
              {session.practiceGoals.length}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-theme-tertiary">Seções:</span>
            <span className="font-semibold text-theme-primary">
              {session.sectionsWorked.length}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-theme-tertiary">Foco:</span>
            <span className="font-semibold text-brand-primary">
              {session.focus}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-theme-tertiary">Início:</span>
            <span className="font-semibold text-theme-primary">
              {new Date(session.startTime).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
