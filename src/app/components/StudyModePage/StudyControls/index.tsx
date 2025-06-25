// app/components/StudyMode/components/StudyControls.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  FiSettings,
  FiTarget,
  FiClock,
  FiSave,
  FiRefreshCw,
  FiEye,
  FiMoon,
  FiSun,
  FiVolume2,
  FiBell,
  FiActivity,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { StudySession } from '../StudyModeClient';
import { UserStudySettings } from '@/app/requests/study-requests';

interface StudyControlsProps {
  session: StudySession;
  userSettings: UserStudySettings | null;
  onUpdateSession: (updates: Partial<StudySession>) => void;
  onSaveSettings: () => Promise<void>;
}

const FOCUS_OPTIONS = [
  {
    value: 'TECHNICAL',
    label: 'Técnico',
    description: 'Foco em aspectos técnicos (dedilhado, articulação, etc.)',
    icon: FiTarget,
    color: 'text-accent-blue',
    bgColor: 'bg-accent-blue/10',
  },
  {
    value: 'EXPRESSIVITY',
    label: 'Expressividade',
    description: 'Trabalho na expressão musical e interpretação',
    icon: FiActivity,
    color: 'text-accent-purple',
    bgColor: 'bg-accent-purple/10',
  },
  {
    value: 'PRECISION',
    label: 'Precisão',
    description: 'Foco na precisão rítmica e afinação',
    icon: FiClock,
    color: 'text-accent-green',
    bgColor: 'bg-accent-green/10',
  },
  {
    value: 'SIGHT_READING',
    label: 'Leitura',
    description: 'Prática de leitura à primeira vista',
    icon: FiEye,
    color: 'text-accent-orange',
    bgColor: 'bg-accent-orange/10',
  },
  {
    value: 'MEMORIZATION',
    label: 'Memorização',
    description: 'Trabalho de memorização da obra',
    icon: FiRefreshCw,
    color: 'text-accent-red',
    bgColor: 'bg-accent-red/10',
  },
  {
    value: 'PERFORMANCE',
    label: 'Performance',
    description: 'Preparação para apresentação pública',
    icon: FiTrendingUp,
    color: 'text-brand-primary',
    bgColor: 'bg-brand-primary/10',
  },
  {
    value: 'REVIEW',
    label: 'Revisão',
    description: 'Revisão geral e manutenção',
    icon: FiCheckCircle,
    color: 'text-theme-primary',
    bgColor: 'bg-theme-elevated',
  },
];

const REMINDER_INTERVALS = [
  { value: 5, label: '5 minutos' },
  { value: 10, label: '10 minutos' },
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
];

const StudyControls: React.FC<StudyControlsProps> = ({
  session,
  userSettings,
  onUpdateSession,
  onSaveSettings,
}) => {
  const [localSettings, setLocalSettings] = useState(
    userSettings?.studyModeSettings
  );
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [nextReminder, setNextReminder] = useState<Date | null>(null);

  // Efeito para atualizar configurações locais
  useEffect(() => {
    if (userSettings?.studyModeSettings) {
      setLocalSettings(userSettings.studyModeSettings);
    }
  }, [userSettings]);

  // Configurar lembretes de pausa
  useEffect(() => {
    if (reminderEnabled && localSettings?.sessionSettings.reminderInterval) {
      const interval =
        localSettings.sessionSettings.reminderInterval * 60 * 1000; // converter para ms
      const startTime = new Date(session.startTime).getTime();
      const now = Date.now();
      const elapsed = now - startTime;
      const nextReminderTime =
        startTime + (Math.floor(elapsed / interval) + 1) * interval;

      setNextReminder(new Date(nextReminderTime));

      const timeout = setTimeout(() => {
        if (!session.isPaused) {
          // Mostrar notificação de lembrete
          showReminderNotification();
        }
      }, nextReminderTime - now);

      return () => clearTimeout(timeout);
    }
  }, [
    reminderEnabled,
    localSettings?.sessionSettings.reminderInterval,
    session.startTime,
    session.isPaused,
  ]);

  // Mostrar notificação de lembrete
  const showReminderNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Lembrete de Pausa', {
        body: 'Que tal fazer uma pequena pausa na sua sessão de estudo?',
        icon: '/favicon.ico',
      });
    }

    // Alternativa: mostrar alerta visual
    // toast.info('Lembrete: Que tal fazer uma pausa?');
  };

  // Atualizar foco da sessão
  const updateFocus = (focus: StudySession['focus']) => {
    onUpdateSession({ focus });
  };

  // Salvar configurações
  const saveSettings = async () => {
    if (!localSettings) return;

    setSaveStatus('saving');

    try {
      // Salvar no backend
      await fetch('/api/user/study-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studyModeSettings: localSettings }),
      });

      await onSaveSettings();
      setSaveStatus('saved');

      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Erro ao salvar configurações:', error);
    }
  };

  // Atualizar configuração local
  const updateLocalSetting = (path: string, value: any) => {
    if (!localSettings) return;

    const keys = path.split('.');
    const newSettings = { ...localSettings };
    let current: any = newSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setLocalSettings(newSettings);
  };

  // Solicitar permissão para notificações
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setReminderEnabled(true);
      }
    }
  };

  // Formatação de tempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const currentFocus = FOCUS_OPTIONS.find(
    (option) => option.value === session.focus
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-theme-primary flex items-center space-x-2">
          <FiSettings className="w-5 h-5" />
          <span>Configurações da Sessão</span>
        </h3>

        {/* Status de salvamento */}
        <div className="flex items-center space-x-2">
          {saveStatus === 'saving' && (
            <div className="flex items-center space-x-1 text-accent-blue text-xs">
              <div className="w-3 h-3 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
              <span>Salvando...</span>
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center space-x-1 text-accent-green text-xs">
              <FiCheckCircle className="w-3 h-3" />
              <span>Salvo</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center space-x-1 text-accent-red text-xs">
              <FiAlertCircle className="w-3 h-3" />
              <span>Erro</span>
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas da sessão atual */}
      <div className="bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-xl p-4">
        <h4 className="text-sm font-semibold text-theme-primary mb-3">
          Sessão Atual
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-brand-primary">
              {formatTime(session.duration)}
            </div>
            <div className="text-xs text-theme-secondary">Tempo Total</div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold text-accent-green">
              {session.pagesViewed.length}
            </div>
            <div className="text-xs text-theme-secondary">Páginas Vistas</div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold text-accent-blue">
              {session.annotationsCreated}
            </div>
            <div className="text-xs text-theme-secondary">Anotações</div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold text-accent-purple">
              {session.bookmarksCreated}
            </div>
            <div className="text-xs text-theme-secondary">Marcadores</div>
          </div>
        </div>
      </div>

      {/* Foco da sessão */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <FiTarget className="w-5 h-5 text-accent-blue" />
          <h4 className="text-sm font-semibold text-theme-primary">
            Foco da Sessão
          </h4>
        </div>

        {/* Foco atual */}
        {currentFocus && (
          <div
            className={`${currentFocus.bgColor} border border-theme-secondary rounded-xl p-4`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 ${currentFocus.bgColor} rounded-xl flex items-center justify-center`}
              >
                <currentFocus.icon
                  className={`w-5 h-5 ${currentFocus.color}`}
                />
              </div>
              <div>
                <div className="font-medium text-theme-primary">
                  {currentFocus.label}
                </div>
                <div className="text-sm text-theme-secondary">
                  {currentFocus.description}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seletor de foco */}
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
          {FOCUS_OPTIONS.map((focus) => {
            const Icon = focus.icon;
            const isSelected = session.focus === focus.value;

            return (
              <button
                key={focus.value}
                onClick={() =>
                  updateFocus(focus.value as StudySession['focus'])
                }
                className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 text-left ${
                  isSelected
                    ? `${focus.bgColor} ${focus.color} shadow-theme-glow border-2 border-current`
                    : 'bg-theme-elevated border border-theme-secondary hover:bg-interactive-hover'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? focus.color : 'text-theme-secondary'
                    }`}
                  />
                  <div>
                    <div className="font-medium text-sm">{focus.label}</div>
                    <div className="text-xs opacity-75">
                      {focus.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lembretes de pausa */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiBell className="w-5 h-5 text-accent-orange" />
            <h4 className="text-sm font-semibold text-theme-primary">
              Lembretes de Pausa
            </h4>
          </div>

          <button
            onClick={() => {
              if (reminderEnabled) {
                setReminderEnabled(false);
              } else {
                requestNotificationPermission();
              }
            }}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
              reminderEnabled
                ? 'bg-accent-orange/20 text-accent-orange'
                : 'bg-theme-elevated border border-theme-secondary text-theme-secondary hover:text-theme-primary'
            }`}
          >
            {reminderEnabled ? 'Ativo' : 'Inativo'}
          </button>
        </div>

        {localSettings && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Intervalo entre lembretes
              </label>
              <select
                value={localSettings.sessionSettings.reminderInterval}
                onChange={(e) =>
                  updateLocalSetting(
                    'sessionSettings.reminderInterval',
                    parseInt(e.target.value)
                  )
                }
                className="w-full bg-theme-elevated border border-theme-secondary rounded-xl px-3 py-2 text-theme-primary focus:outline-none focus:border-brand-primary"
              >
                {REMINDER_INTERVALS.map((interval) => (
                  <option key={interval.value} value={interval.value}>
                    {interval.label}
                  </option>
                ))}
              </select>
            </div>

            {reminderEnabled && nextReminder && (
              <div className="bg-accent-orange/10 border border-accent-orange/30 rounded-xl p-3">
                <div className="text-sm text-accent-orange">
                  Próximo lembrete:{' '}
                  {nextReminder.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Configurações avançadas */}
      <div className="space-y-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-sm font-medium text-theme-primary bg-theme-elevated border border-theme-secondary rounded-xl px-4 py-3 hover:bg-interactive-hover transition-all duration-300"
        >
          <span>Configurações Avançadas</span>
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

        {showAdvanced && localSettings && (
          <div className="space-y-4 animate-fade-in-up">
            {/* Auto-save */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-theme-secondary">
                  Salvamento Automático
                </label>
                <button
                  onClick={() =>
                    updateLocalSetting(
                      'pdfSettings.autoSave',
                      !localSettings.pdfSettings.autoSave
                    )
                  }
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    localSettings.pdfSettings.autoSave
                      ? 'bg-accent-green'
                      : 'bg-theme-secondary'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${
                      localSettings.pdfSettings.autoSave
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-theme-tertiary">
                Salva automaticamente o progresso da sessão a cada 30 segundos
              </p>
            </div>

            {/* Auto-start */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-theme-secondary">
                  Início Automático
                </label>
                <button
                  onClick={() =>
                    updateLocalSetting(
                      'sessionSettings.autoStart',
                      !localSettings.sessionSettings.autoStart
                    )
                  }
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    localSettings.sessionSettings.autoStart
                      ? 'bg-accent-green'
                      : 'bg-theme-secondary'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${
                      localSettings.sessionSettings.autoStart
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-theme-tertiary">
                Inicia o timer automaticamente ao abrir o modo estudo
              </p>
            </div>

            {/* Zoom padrão do PDF */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-theme-secondary">
                Zoom Padrão do PDF:{' '}
                {Math.round(localSettings.pdfSettings.zoom * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={localSettings.pdfSettings.zoom}
                onChange={(e) =>
                  updateLocalSetting(
                    'pdfSettings.zoom',
                    parseFloat(e.target.value)
                  )
                }
                className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Tema padrão */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Tema Padrão do PDF
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    updateLocalSetting('pdfSettings.theme', 'light')
                  }
                  className={`flex-1 p-3 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 ${
                    localSettings.pdfSettings.theme === 'light'
                      ? 'bg-brand-gradient text-theme-primary shadow-theme-glow'
                      : 'bg-theme-elevated border border-theme-secondary hover:bg-interactive-hover'
                  }`}
                >
                  <FiSun className="w-4 h-4" />
                  <span className="text-sm">Claro</span>
                </button>

                <button
                  onClick={() =>
                    updateLocalSetting('pdfSettings.theme', 'dark')
                  }
                  className={`flex-1 p-3 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 ${
                    localSettings.pdfSettings.theme === 'dark'
                      ? 'bg-brand-gradient text-theme-primary shadow-theme-glow'
                      : 'bg-theme-elevated border border-theme-secondary hover:bg-interactive-hover'
                  }`}
                >
                  <FiMoon className="w-4 h-4" />
                  <span className="text-sm">Escuro</span>
                </button>
              </div>
            </div>

            {/* Volume padrão do metrônomo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-theme-secondary">
                Volume Padrão do Metrônomo:{' '}
                {Math.round(localSettings.defaultMetronome.volume * 100)}%
              </label>
              <div className="flex items-center space-x-2">
                <FiVolume2 className="w-4 h-4 text-theme-secondary" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={localSettings.defaultMetronome.volume}
                  onChange={(e) =>
                    updateLocalSetting(
                      'defaultMetronome.volume',
                      parseFloat(e.target.value)
                    )
                  }
                  className="flex-1 h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botão salvar configurações */}
      <button
        onClick={saveSettings}
        disabled={saveStatus === 'saving'}
        className="w-full bg-brand-gradient text-theme-primary py-3 rounded-xl font-medium hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
      >
        <FiSave className="w-4 h-4" />
        <span>
          {saveStatus === 'saving' ? 'Salvando...' : 'Salvar Configurações'}
        </span>
      </button>
    </div>
  );
};

export default StudyControls;
