import React, { useState } from 'react';
import {
  FiSettings,
  FiUser,
  FiVolume2,
  FiCamera,
  FiWifi,
  FiShield,
  FiDatabase,
  FiTarget,
  FiMoon,
  FiSun,
  FiMonitor,
  FiSave,
  FiRefreshCw,
  FiAlertTriangle,
  FiBell,
} from 'react-icons/fi';
import {
  GiPianoKeys,
  GiViolin,
  GiTrumpet,
  GiDrumKit,
  GiGuitar,
} from 'react-icons/gi';

interface UserPreferences {
  profile: {
    name: string;
    email: string;
    avatar?: string;
    instruments: string[];
    level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
    primaryInstrument: string;
    goals: string[];
    timezone: string;
    language: string;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    animations: boolean;
    compactMode: boolean;
    highContrast: boolean;
  };
  audio: {
    inputDevice: string;
    outputDevice: string;
    sampleRate: number;
    bitDepth: number;
    bufferSize: number;
    enableNoiseGate: boolean;
    noiseGateThreshold: number;
    enableCompressor: boolean;
    enableReverb: boolean;
    reverbLevel: number;
    metronomeVolume: number;
    metronomeSound: 'click' | 'beep' | 'wood' | 'digital';
    autoGain: boolean;
  };
  video: {
    camera: string;
    resolution: '720p' | '1080p' | '4K';
    frameRate: 30 | 60;
    quality: 'low' | 'medium' | 'high';
    autoRecord: boolean;
    recordingPath: string;
  };
  practice: {
    defaultSessionDuration: number;
    autoStartTimer: boolean;
    showBreakReminders: boolean;
    breakInterval: number;
    autoSave: boolean;
    saveInterval: number;
    enableAIFeedback: boolean;
    trackingLevel: 'basic' | 'detailed' | 'comprehensive';
    goalReminders: boolean;
    practiceReminders: boolean;
    reminderTime: string;
  };
  storage: {
    cloudSync: boolean;
    cloudProvider: 'google' | 'dropbox' | 'onedrive' | 'icloud';
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    maxLocalStorage: number;
    compressRecordings: boolean;
    deleteOldRecordings: boolean;
    retentionDays: number;
  };
  privacy: {
    shareProgress: boolean;
    shareRecordings: boolean;
    allowAnalytics: boolean;
    allowCrashReports: boolean;
    publicProfile: boolean;
    showInLeaderboard: boolean;
    dataCollection: 'minimal' | 'standard' | 'detailed';
  };
  integrations: {
    midi: {
      enabled: boolean;
      inputDevice: string;
      outputDevice: string;
      channel: number;
      velocity: number;
    };
    streaming: {
      enabled: boolean;
      platform: 'youtube' | 'twitch' | 'facebook';
      quality: 'low' | 'medium' | 'high';
      privateMode: boolean;
    };
    social: {
      connectFacebook: boolean;
      connectGoogle: boolean;
      connectApple: boolean;
      shareAchievements: boolean;
      findFriends: boolean;
    };
    calendar: {
      enabled: boolean;
      provider: 'google' | 'outlook' | 'apple';
      syncPracticeSchedule: boolean;
      createEventReminders: boolean;
    };
  };
  notifications: {
    email: {
      enabled: boolean;
      practiceReminders: boolean;
      goalDeadlines: boolean;
      achievements: boolean;
      weeklyReports: boolean;
      socialUpdates: boolean;
    };
    push: {
      enabled: boolean;
      practiceReminders: boolean;
      breakReminders: boolean;
      goalReminders: boolean;
      achievements: boolean;
      socialNotifications: boolean;
    };
    inApp: {
      enabled: boolean;
      showTooltips: boolean;
      showTips: boolean;
      playSuccessSounds: boolean;
      vibrationFeedback: boolean;
    };
  };
}

const AdvancedSettingsSystem: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [preferences, setPreferences] = useState<UserPreferences>({
    profile: {
      name: 'João Silva',
      email: 'joao@email.com',
      instruments: ['Piano', 'Violino'],
      level: 'intermediate',
      primaryInstrument: 'Piano',
      goals: ['Melhorar técnica', 'Aprender novas peças'],
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
    },
    appearance: {
      theme: 'dark',
      accentColor: '#3B82F6',
      fontSize: 'medium',
      animations: true,
      compactMode: false,
      highContrast: false,
    },
    audio: {
      inputDevice: 'default',
      outputDevice: 'default',
      sampleRate: 44100,
      bitDepth: 16,
      bufferSize: 512,
      enableNoiseGate: true,
      noiseGateThreshold: -40,
      enableCompressor: false,
      enableReverb: false,
      reverbLevel: 0.3,
      metronomeVolume: 0.7,
      metronomeSound: 'click',
      autoGain: true,
    },
    video: {
      camera: 'default',
      resolution: '1080p',
      frameRate: 30,
      quality: 'medium',
      autoRecord: false,
      recordingPath: '/recordings',
    },
    practice: {
      defaultSessionDuration: 60,
      autoStartTimer: true,
      showBreakReminders: true,
      breakInterval: 25,
      autoSave: true,
      saveInterval: 300,
      enableAIFeedback: true,
      trackingLevel: 'detailed',
      goalReminders: true,
      practiceReminders: true,
      reminderTime: '19:00',
    },
    storage: {
      cloudSync: true,
      cloudProvider: 'google',
      autoBackup: true,
      backupFrequency: 'weekly',
      maxLocalStorage: 5000,
      compressRecordings: true,
      deleteOldRecordings: true,
      retentionDays: 90,
    },
    privacy: {
      shareProgress: false,
      shareRecordings: false,
      allowAnalytics: true,
      allowCrashReports: true,
      publicProfile: false,
      showInLeaderboard: true,
      dataCollection: 'standard',
    },
    integrations: {
      midi: {
        enabled: false,
        inputDevice: '',
        outputDevice: '',
        channel: 1,
        velocity: 64,
      },
      streaming: {
        enabled: false,
        platform: 'youtube',
        quality: 'medium',
        privateMode: true,
      },
      social: {
        connectFacebook: false,
        connectGoogle: true,
        connectApple: false,
        shareAchievements: true,
        findFriends: false,
      },
      calendar: {
        enabled: false,
        provider: 'google',
        syncPracticeSchedule: false,
        createEventReminders: false,
      },
    },
    notifications: {
      email: {
        enabled: true,
        practiceReminders: true,
        goalDeadlines: true,
        achievements: true,
        weeklyReports: true,
        socialUpdates: false,
      },
      push: {
        enabled: true,
        practiceReminders: true,
        breakReminders: true,
        goalReminders: true,
        achievements: true,
        socialNotifications: false,
      },
      inApp: {
        enabled: true,
        showTooltips: true,
        showTips: true,
        playSuccessSounds: true,
        vibrationFeedback: false,
      },
    },
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Seções de configuração
  const sections = [
    { id: 'profile', name: 'Perfil', icon: FiUser },
    { id: 'appearance', name: 'Aparência', icon: FiMonitor },
    { id: 'audio', name: 'Áudio', icon: FiVolume2 },
    { id: 'video', name: 'Vídeo', icon: FiCamera },
    { id: 'practice', name: 'Prática', icon: FiTarget },
    { id: 'storage', name: 'Armazenamento', icon: FiDatabase },
    { id: 'privacy', name: 'Privacidade', icon: FiShield },
    { id: 'integrations', name: 'Integrações', icon: FiWifi },
    { id: 'notifications', name: 'Notificações', icon: FiBell },
  ];

  // Salvar configurações
  const saveSettings = async () => {
    setIsSaving(true);
    // Simular save
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setHasChanges(false);
  };

  // Reset para padrões
  const resetToDefaults = () => {
    // Implementar reset
    setShowResetDialog(false);
    setHasChanges(true);
  };

  // Componente de seção
  const SettingSection: React.FC<{
    title: string;
    description?: string;
    children: React.ReactNode;
  }> = ({ title, description, children }) => (
    <div className="bg-white/5 rounded-xl p-6 border border-white/20 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && (
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );

  // Componente de toggle
  const ToggleSwitch: React.FC<{
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    label: string;
    description?: string;
  }> = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="text-white font-medium">{label}</div>
        {description && (
          <div className="text-sm text-gray-400">{description}</div>
        )}
      </div>
      <button
        onClick={() => {
          onChange(!enabled);
          setHasChanges(true);
        }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          enabled ? 'bg-blue-500' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  // Seção de perfil
  const ProfileSection = () => (
    <div className="space-y-6">
      <SettingSection
        title="Informações Pessoais"
        description="Configure suas informações básicas e instrumentos"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome
            </label>
            <input
              type="text"
              value={preferences.profile.name}
              onChange={(e) => {
                setPreferences((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, name: e.target.value },
                }));
                setHasChanges(true);
              }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={preferences.profile.email}
              onChange={(e) => {
                setPreferences((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, email: e.target.value },
                }));
                setHasChanges(true);
              }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nível
            </label>
            <select
              value={preferences.profile.level}
              onChange={(e) => {
                setPreferences((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, level: e.target.value as any },
                }));
                setHasChanges(true);
              }}
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
              Instrumento Principal
            </label>
            <select
              value={preferences.profile.primaryInstrument}
              onChange={(e) => {
                setPreferences((prev) => ({
                  ...prev,
                  profile: {
                    ...prev.profile,
                    primaryInstrument: e.target.value,
                  },
                }));
                setHasChanges(true);
              }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="Piano">Piano</option>
              <option value="Violino">Violino</option>
              <option value="Trompete">Trompete</option>
              <option value="Guitarra">Guitarra</option>
              <option value="Bateria">Bateria</option>
            </select>
          </div>
        </div>
      </SettingSection>

      <SettingSection
        title="Instrumentos"
        description="Selecione todos os instrumentos que você pratica"
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: 'Piano', icon: GiPianoKeys },
            { name: 'Violino', icon: GiViolin },
            { name: 'Trompete', icon: GiTrumpet },
            { name: 'Guitarra', icon: GiGuitar },
            { name: 'Bateria', icon: GiDrumKit },
          ].map((instrument) => {
            const Icon = instrument.icon;
            const isSelected = preferences.profile.instruments.includes(
              instrument.name
            );

            return (
              <button
                key={instrument.name}
                onClick={() => {
                  const newInstruments = isSelected
                    ? preferences.profile.instruments.filter(
                        (i) => i !== instrument.name
                      )
                    : [...preferences.profile.instruments, instrument.name];

                  setPreferences((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, instruments: newInstruments },
                  }));
                  setHasChanges(true);
                }}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  isSelected
                    ? 'bg-blue-500/20 border-blue-500 text-white'
                    : 'bg-white/5 border-white/20 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Icon className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm">{instrument.name}</div>
              </button>
            );
          })}
        </div>
      </SettingSection>
    </div>
  );

  // Seção de aparência
  const AppearanceSection = () => (
    <div className="space-y-6">
      <SettingSection
        title="Tema"
        description="Personalize a aparência da interface"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Tema
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Claro', icon: FiSun },
                { value: 'dark', label: 'Escuro', icon: FiMoon },
                { value: 'auto', label: 'Automático', icon: FiMonitor },
              ].map((theme) => {
                const Icon = theme.icon;
                return (
                  <button
                    key={theme.value}
                    onClick={() => {
                      setPreferences((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          theme: theme.value as any,
                        },
                      }));
                      setHasChanges(true);
                    }}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      preferences.appearance.theme === theme.value
                        ? 'bg-blue-500/20 border-blue-500 text-white'
                        : 'bg-white/5 border-white/20 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm">{theme.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tamanho da Fonte
              </label>
              <select
                value={preferences.appearance.fontSize}
                onChange={(e) => {
                  setPreferences((prev) => ({
                    ...prev,
                    appearance: {
                      ...prev.appearance,
                      fontSize: e.target.value as any,
                    },
                  }));
                  setHasChanges(true);
                }}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="small">Pequeno</option>
                <option value="medium">Médio</option>
                <option value="large">Grande</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cor de Destaque
              </label>
              <input
                type="color"
                value={preferences.appearance.accentColor}
                onChange={(e) => {
                  setPreferences((prev) => ({
                    ...prev,
                    appearance: {
                      ...prev.appearance,
                      accentColor: e.target.value,
                    },
                  }));
                  setHasChanges(true);
                }}
                className="w-full h-10 bg-white/10 border border-white/20 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-3">
            <ToggleSwitch
              enabled={preferences.appearance.animations}
              onChange={(enabled) =>
                setPreferences((prev) => ({
                  ...prev,
                  appearance: { ...prev.appearance, animations: enabled },
                }))
              }
              label="Animações"
              description="Ativar animações e transições suaves"
            />

            <ToggleSwitch
              enabled={preferences.appearance.compactMode}
              onChange={(enabled) =>
                setPreferences((prev) => ({
                  ...prev,
                  appearance: { ...prev.appearance, compactMode: enabled },
                }))
              }
              label="Modo Compacto"
              description="Interface mais densa para telas menores"
            />

            <ToggleSwitch
              enabled={preferences.appearance.highContrast}
              onChange={(enabled) =>
                setPreferences((prev) => ({
                  ...prev,
                  appearance: { ...prev.appearance, highContrast: enabled },
                }))
              }
              label="Alto Contraste"
              description="Melhora a legibilidade para baixa visão"
            />
          </div>
        </div>
      </SettingSection>
    </div>
  );

  // Seção de áudio
  const AudioSection = () => (
    <div className="space-y-6">
      <SettingSection
        title="Dispositivos"
        description="Configure entrada e saída de áudio"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dispositivo de Entrada
            </label>
            <select
              value={preferences.audio.inputDevice}
              onChange={(e) => {
                setPreferences((prev) => ({
                  ...prev,
                  audio: { ...prev.audio, inputDevice: e.target.value },
                }));
                setHasChanges(true);
              }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="default">Padrão do Sistema</option>
              <option value="usb-mic">Microfone USB</option>
              <option value="audio-interface">Interface de Áudio</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dispositivo de Saída
            </label>
            <select
              value={preferences.audio.outputDevice}
              onChange={(e) => {
                setPreferences((prev) => ({
                  ...prev,
                  audio: { ...prev.audio, outputDevice: e.target.value },
                }));
                setHasChanges(true);
              }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="default">Padrão do Sistema</option>
              <option value="headphones">Fones de Ouvido</option>
              <option value="studio-monitors">Monitores de Estúdio</option>
            </select>
          </div>
        </div>
      </SettingSection>

      <SettingSection
        title="Qualidade"
        description="Configure parâmetros de qualidade do áudio"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Rate
            </label>
            <select
              value={preferences.audio.sampleRate}
              onChange={(e) => {
                setPreferences((prev) => ({
                  ...prev,
                  audio: { ...prev.audio, sampleRate: Number(e.target.value) },
                }));
                setHasChanges(true);
              }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value={22050}>22.05 kHz</option>
              <option value={44100}>44.1 kHz</option>
              <option value={48000}>48 kHz</option>
              <option value={96000}>96 kHz</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bit Depth
            </label>
            <select
              value={preferences.audio.bitDepth}
              onChange={(e) => {
                setPreferences((prev) => ({
                  ...prev,
                  audio: { ...prev.audio, bitDepth: Number(e.target.value) },
                }));
                setHasChanges(true);
              }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value={16}>16-bit</option>
              <option value={24}>24-bit</option>
              <option value={32}>32-bit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buffer Size
            </label>
            <select
              value={preferences.audio.bufferSize}
              onChange={(e) => {
                setPreferences((prev) => ({
                  ...prev,
                  audio: { ...prev.audio, bufferSize: Number(e.target.value) },
                }));
                setHasChanges(true);
              }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value={128}>128 samples</option>
              <option value={256}>256 samples</option>
              <option value={512}>512 samples</option>
              <option value={1024}>1024 samples</option>
            </select>
          </div>
        </div>
      </SettingSection>

      <SettingSection
        title="Processamento"
        description="Efeitos e processamento de áudio"
      >
        <div className="space-y-4">
          <ToggleSwitch
            enabled={preferences.audio.autoGain}
            onChange={(enabled) =>
              setPreferences((prev) => ({
                ...prev,
                audio: { ...prev.audio, autoGain: enabled },
              }))
            }
            label="Ganho Automático"
            description="Ajusta automaticamente o nível de entrada"
          />

          <ToggleSwitch
            enabled={preferences.audio.enableNoiseGate}
            onChange={(enabled) =>
              setPreferences((prev) => ({
                ...prev,
                audio: { ...prev.audio, enableNoiseGate: enabled },
              }))
            }
            label="Noise Gate"
            description="Reduz ruído de fundo quando não há sinal"
          />

          <ToggleSwitch
            enabled={preferences.audio.enableCompressor}
            onChange={(enabled) =>
              setPreferences((prev) => ({
                ...prev,
                audio: { ...prev.audio, enableCompressor: enabled },
              }))
            }
            label="Compressor"
            description="Nivela dinâmicas extremas"
          />

          <ToggleSwitch
            enabled={preferences.audio.enableReverb}
            onChange={(enabled) =>
              setPreferences((prev) => ({
                ...prev,
                audio: { ...prev.audio, enableReverb: enabled },
              }))
            }
            label="Reverb"
            description="Adiciona espacialidade ao som"
          />
        </div>
      </SettingSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex">
        {/* Sidebar de navegação */}
        <div className="w-80 bg-white/5 border-r border-white/10 p-4 min-h-screen">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <FiSettings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Configurações</h1>
              <p className="text-sm text-gray-400">
                Personalize sua experiência
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    activeSection === section.id
                      ? 'bg-blue-500/20 text-white border border-blue-500/40'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Ações */}
          <div className="mt-8 space-y-3">
            <button
              onClick={saveSettings}
              disabled={!hasChanges || isSaving}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                hasChanges && !isSaving
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowResetDialog(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 transition-all duration-300"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Restaurar Padrões</span>
            </button>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 p-8 overflow-auto">
          {hasChanges && (
            <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <FiAlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-200">
                  Você tem alterações não salvas. Clique em &quot;Salvar
                  Alterações&quot; para aplicá-las.
                </span>
              </div>
            </div>
          )}

          {activeSection === 'profile' && <ProfileSection />}
          {activeSection === 'appearance' && <AppearanceSection />}
          {activeSection === 'audio' && <AudioSection />}

          {/* Placeholder para outras seções */}
          {!['profile', 'appearance', 'audio'].includes(activeSection) && (
            <div className="text-center py-20">
              <FiSettings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {sections.find((s) => s.id === activeSection)?.name}
              </h3>
              <p className="text-gray-400">
                Esta seção está em desenvolvimento.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmação de reset */}
      {showResetDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-white/20 p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <FiAlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Restaurar Padrões
              </h3>
            </div>

            <p className="text-gray-300 mb-6">
              Tem certeza que deseja restaurar todas as configurações para os
              valores padrão? Esta ação não pode ser desfeita.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetDialog(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={resetToDefaults}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors"
              >
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSettingsSystem;
