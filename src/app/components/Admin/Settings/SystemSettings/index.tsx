// app/components/Admin/Settings/SystemSettings.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiSettings,
  FiShield,
  FiDatabase,
  FiBell,
  FiLock,
  FiSave,
  FiToggleLeft,
  FiToggleRight,
  FiAlertTriangle,
  FiInfo,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiTarget,
  FiZap,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';

interface SystemConfig {
  general: {
    platformName: string;
    allowRegistrations: boolean;
    requireEmailVerification: boolean;
    maintenanceMode: boolean;
    defaultUserRole: string;
    maxUploadSize: number;
    sessionTimeout: number;
  };
  moderation: {
    autoModeration: boolean;
    qualityThreshold: number;
    reportThreshold: number;
    autoApproveFromTrustedUsers: boolean;
    trustedUserMinScore: number;
    bulkActionLimit: number;
  };
  content: {
    allowUserUploads: boolean;
    requireModerationForNewUsers: boolean;
    maxDailyUploads: number;
    maxMonthlyUploads: number;
    enableVersioning: boolean;
    autoBackup: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    moderationAlerts: boolean;
    systemAlerts: boolean;
    reportNotifications: boolean;
    weeklyDigest: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    passwordMinLength: number;
    sessionSecurity: 'normal' | 'strict';
    ipWhitelist: string[];
    rateLimiting: boolean;
    bruteForceProtection: boolean;
  };
  performance: {
    cacheTimeout: number;
    enableCDN: boolean;
    compressionLevel: number;
    maxConcurrentUsers: number;
    databaseOptimization: boolean;
  };
}

interface QualityRule {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'metadata' | 'format' | 'user';
  severity: 'info' | 'warning' | 'error';
  isActive: boolean;
  autoAction: 'none' | 'flag' | 'reject' | 'approve';
  parameters: Record<string, any>;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'push' | 'system';
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
}

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [qualityRules, setQualityRules] = useState<QualityRule[]>([]);

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<QualityRule | null>(null);

  const tabs = [
    { id: 'general', label: 'Geral', icon: FiSettings },
    { id: 'moderation', label: 'Moderação', icon: FiShield },
    { id: 'content', label: 'Conteúdo', icon: FiDatabase },
    { id: 'notifications', label: 'Notificações', icon: FiBell },
    { id: 'security', label: 'Segurança', icon: FiLock },
    { id: 'performance', label: 'Performance', icon: FiZap },
    { id: 'rules', label: 'Regras de Qualidade', icon: FiTarget },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simular salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Configurações salvas:', config);
      setHasChanges(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (
    section: keyof SystemConfig,
    field: string,
    value: any
  ) => {
    if (!config) return;

    setConfig((prev) => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const toggleRule = (ruleId: string) => {
    setQualityRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
    setHasChanges(true);
  };

  const renderToggle = (isOn: boolean, onChange: () => void) => (
    <button
      onClick={onChange}
      className={`flex items-center space-x-2 p-1 rounded-full transition-all ${
        isOn ? 'bg-accent-green' : 'bg-theme-secondary'
      }`}
    >
      {isOn ? (
        <FiToggleRight className="w-6 h-6 text-theme-primary" />
      ) : (
        <FiToggleLeft className="w-6 h-6 text-theme-tertiary" />
      )}
    </button>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Nome da Plataforma
          </label>
          <input
            type="text"
            value={config?.general.platformName || ''}
            onChange={(e) =>
              updateConfig('general', 'platformName', e.target.value)
            }
            className="input-classical-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Timeout de Sessão (horas)
          </label>
          <input
            type="number"
            value={config?.general.sessionTimeout || 8}
            onChange={(e) =>
              updateConfig(
                'general',
                'sessionTimeout',
                parseInt(e.target.value)
              )
            }
            className="input-classical-2 w-full"
            min="1"
            max="72"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-xl">
          <div>
            <h4 className="font-medium text-theme-primary">
              Permitir Registros
            </h4>
            <p className="text-sm text-theme-tertiary">
              Novos usuários podem se registrar
            </p>
          </div>
          {renderToggle(config?.general.allowRegistrations || false, () =>
            updateConfig(
              'general',
              'allowRegistrations',
              !config?.general.allowRegistrations
            )
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-xl">
          <div>
            <h4 className="font-medium text-theme-primary">
              Verificação de Email
            </h4>
            <p className="text-sm text-theme-tertiary">
              Exigir verificação de email
            </p>
          </div>
          {renderToggle(config?.general.requireEmailVerification || false, () =>
            updateConfig(
              'general',
              'requireEmailVerification',
              !config?.general.requireEmailVerification
            )
          )}
        </div>
      </div>

      <div className="p-4 bg-accent-amber/10 border border-accent-amber rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiAlertTriangle className="w-5 h-5 text-accent-amber" />
            <div>
              <h4 className="font-medium text-theme-primary">
                Modo Manutenção
              </h4>
              <p className="text-sm text-theme-tertiary">
                Desabilita o acesso para usuários comuns
              </p>
            </div>
          </div>
          {renderToggle(config?.general.maintenanceMode || false, () =>
            updateConfig(
              'general',
              'maintenanceMode',
              !config?.general.maintenanceMode
            )
          )}
        </div>
      </div>
    </div>
  );

  const renderModerationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Threshold de Qualidade
          </label>
          <input
            type="number"
            step="0.1"
            value={config?.moderation.qualityThreshold || 7.0}
            onChange={(e) =>
              updateConfig(
                'moderation',
                'qualityThreshold',
                parseFloat(e.target.value)
              )
            }
            className="input-classical-2 w-full"
            min="0"
            max="10"
          />
          <p className="text-xs text-theme-tertiary mt-1">
            Conteúdo abaixo deste score será flagado
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Threshold de Reports
          </label>
          <input
            type="number"
            value={config?.moderation.reportThreshold || 3}
            onChange={(e) =>
              updateConfig(
                'moderation',
                'reportThreshold',
                parseInt(e.target.value)
              )
            }
            className="input-classical-2 w-full"
            min="1"
            max="20"
          />
          <p className="text-xs text-theme-tertiary mt-1">
            Número de reports para revisão automática
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-xl">
          <div>
            <h4 className="font-medium text-theme-primary">
              Moderação Automática
            </h4>
            <p className="text-sm text-theme-tertiary">
              Habilita regras automáticas de qualidade
            </p>
          </div>
          {renderToggle(config?.moderation.autoModeration || false, () =>
            updateConfig(
              'moderation',
              'autoModeration',
              !config?.moderation.autoModeration
            )
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-xl">
          <div>
            <h4 className="font-medium text-theme-primary">
              Auto-aprovação para Usuários Confiáveis
            </h4>
            <p className="text-sm text-theme-tertiary">
              Aprova automaticamente content de usuários com alto score
            </p>
          </div>
          {renderToggle(
            config?.moderation.autoApproveFromTrustedUsers || false,
            () =>
              updateConfig(
                'moderation',
                'autoApproveFromTrustedUsers',
                !config?.moderation.autoApproveFromTrustedUsers
              )
          )}
        </div>
      </div>
    </div>
  );

  const renderQualityRules = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-theme-primary">
          Regras de Qualidade
        </h3>
        <Button
          variant="primary"
          leftIcon={<FiPlus />}
          onClick={() => setShowRuleModal(true)}
        >
          Nova Regra
        </Button>
      </div>

      <div className="space-y-4">
        {qualityRules.map((rule) => (
          <div key={rule.id} className="p-4 bg-theme-secondary rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-theme-primary">
                    {rule.name}
                  </h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rule.severity === 'error'
                        ? 'bg-accent-red/20 text-accent-red'
                        : rule.severity === 'warning'
                        ? 'bg-accent-amber/20 text-accent-amber'
                        : 'bg-accent-blue/20 text-accent-blue'
                    }`}
                  >
                    {rule.severity === 'error'
                      ? 'Erro'
                      : rule.severity === 'warning'
                      ? 'Aviso'
                      : 'Info'}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rule.autoAction === 'reject'
                        ? 'bg-accent-red/20 text-accent-red'
                        : rule.autoAction === 'approve'
                        ? 'bg-accent-green/20 text-accent-green'
                        : rule.autoAction === 'flag'
                        ? 'bg-accent-amber/20 text-accent-amber'
                        : 'bg-theme-primary text-theme-secondary'
                    }`}
                  >
                    {rule.autoAction === 'reject'
                      ? 'Rejeitar'
                      : rule.autoAction === 'approve'
                      ? 'Aprovar'
                      : rule.autoAction === 'flag'
                      ? 'Flaggar'
                      : 'Nenhuma'}
                  </span>
                </div>
                <p className="text-sm text-theme-secondary mb-2">
                  {rule.description}
                </p>
                <div className="text-xs text-theme-tertiary">
                  Categoria: {rule.category} • Parâmetros:{' '}
                  {JSON.stringify(rule.parameters)}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {renderToggle(rule.isActive, () => toggleRule(rule.id))}
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FiEdit />}
                  onClick={() => {
                    setEditingRule(rule);
                    setShowRuleModal(true);
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FiTrash2 />}
                  className="text-accent-red hover:bg-accent-red/10"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!config) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <FiSettings className="w-12 h-12 text-theme-tertiary mx-auto mb-4 animate-spin" />
            <p className="text-theme-primary">Carregando configurações...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-blue rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiSettings className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Configurações do Sistema
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Gerencie parâmetros e regras da plataforma
            </p>
          </div>
        </AnimatedItem>

        {/* Save Bar */}
        {hasChanges && (
          <AnimatedItem direction="down" springType="gentle">
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-theme-elevated border border-theme-primary rounded-xl shadow-2xl p-4">
              <div className="flex items-center space-x-4">
                <FiInfo className="w-5 h-5 text-accent-amber" />
                <span className="text-theme-primary font-medium">
                  Você tem alterações não salvas
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHasChanges(false)}
                  >
                    Descartar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<FiSave />}
                    onClick={handleSave}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedItem>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <AnimatedItem direction="right" springType="gentle">
            <div className="lg:w-80">
              <AnimatedCard className="classical-card p-6 sticky top-8">
                <h3 className="text-lg font-bold text-theme-primary mb-4">
                  Seções
                </h3>
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-theme-primary shadow-md'
                            : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </AnimatedCard>
            </div>
          </AnimatedItem>

          {/* Main Content */}
          <AnimatedItem direction="left" springType="gentle" className="flex-1">
            <AnimatedCard className="classical-card p-8">
              {activeTab === 'general' && renderGeneralSettings()}
              {activeTab === 'moderation' && renderModerationSettings()}
              {activeTab === 'rules' && renderQualityRules()}

              {/* Placeholder para outras seções */}
              {!['general', 'moderation', 'rules'].includes(activeTab) && (
                <div className="text-center py-12">
                  <FiSettings className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-theme-primary mb-2">
                    {tabs.find((t) => t.id === activeTab)?.label}
                  </h3>
                  <p className="text-theme-secondary">
                    Configurações desta seção em desenvolvimento.
                  </p>
                </div>
              )}
            </AnimatedCard>
          </AnimatedItem>
        </div>

        {/* Save Button */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex justify-center mt-8">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<FiSave />}
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Salvar Todas as Configurações
            </Button>
          </div>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
