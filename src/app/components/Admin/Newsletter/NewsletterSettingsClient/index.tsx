// app/admin/newsletter/settings/NewsletterSettingsClient.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiSettings,
  FiServer,
  FiShield,
  FiClock,
  FiUsers,
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiSave,
  FiEye,
  FiEyeOff,
  FiInfo,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import { BiTestTube } from 'react-icons/bi';
import { useNewsletterSettings } from '@/app/hooks/admin/useNewsletterSettings';

interface SMTPSettings {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
}

interface GeneralSettings {
  enableDoubleOptIn: boolean;
  defaultFrequency: string;
  maxSubscribersPerBatch: number;
  delayBetweenBatches: number;
  enableAnalytics: boolean;
  retentionDays: number;
}

export default function NewsletterSettingsClient() {
  const { settings, loading, saveSettings, testConnection, connectionStatus } =
    useNewsletterSettings();

  const [smtpSettings, setSMTPSettings] = useState<SMTPSettings>({
    host: '',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    fromName: 'Opus Atlas',
    fromEmail: 'noreply@classicalhub.com',
    replyToEmail: 'contato@classicalhub.com',
  });

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    enableDoubleOptIn: true,
    defaultFrequency: 'weekly',
    maxSubscribersPerBatch: 100,
    delayBetweenBatches: 2000,
    enableAnalytics: true,
    retentionDays: 365,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('smtp');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (settings) {
      // Carregar configurações do servidor
      setSMTPSettings((prev) => ({ ...prev, ...settings.smtp }));
      setGeneralSettings((prev) => ({ ...prev, ...settings.general }));
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await saveSettings({
        smtp: smtpSettings,
        general: generalSettings,
      });
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      await testConnection(smtpSettings);
    } catch (error: any) {
      console.error('Erro no teste de conexão:', error);
    } finally {
      setTesting(false);
    }
  };

  const tabs = [
    { id: 'smtp', label: 'Configurações SMTP', icon: FiServer },
    { id: 'general', label: 'Configurações Gerais', icon: FiSettings },
    { id: 'security', label: 'Segurança', icon: FiShield },
  ];

  if (loading && !settings) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-theme-primary font-medium mt-6 text-lg">
              Carregando configurações...
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <div className="space-y-8 ">
        <AnimatedContainer
          delay={0.1}
          staggerSpeed="normal"
          className="flex flex-col gap-4"
        >
          {/* Header */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-amber to-accent-red rounded-3xl flex items-center justify-center shadow-theme-glow">
                  <FiSettings className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Configurações da Newsletter
              </h1>
              <p className="text-lg md:text-xl text-theme-secondary classical-subtitle max-w-2xl mx-auto">
                Configure SMTP, automações e preferências do sistema
              </p>
            </div>
          </AnimatedItem>

          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-theme-tertiary mb-1">
                    Status SMTP
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      connectionStatus?.valid
                        ? 'text-accent-green'
                        : 'text-accent-red'
                    }`}
                  >
                    {connectionStatus?.valid ? 'Conectado' : 'Erro'}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    connectionStatus?.valid
                      ? 'bg-accent-green/20'
                      : 'bg-accent-red/20'
                  }`}
                >
                  {connectionStatus?.valid ? (
                    <FiCheckCircle className="w-6 h-6 text-accent-green" />
                  ) : (
                    <FiAlertTriangle className="w-6 h-6 text-accent-red" />
                  )}
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-theme-tertiary mb-1">
                    Double Opt-in
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      generalSettings.enableDoubleOptIn
                        ? 'text-accent-green'
                        : 'text-accent-amber'
                    }`}
                  >
                    {generalSettings.enableDoubleOptIn ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-purple/20 rounded-xl flex items-center justify-center">
                  <FiShield className="w-6 h-6 text-accent-purple" />
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-theme-tertiary mb-1">Analytics</p>
                  <p
                    className={`text-lg font-bold ${
                      generalSettings.enableAnalytics
                        ? 'text-accent-green'
                        : 'text-accent-red'
                    }`}
                  >
                    {generalSettings.enableAnalytics ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-amber/20 rounded-xl flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-accent-amber" />
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Settings Tabs */}
          <AnimatedCard className="classical-card p-6">
            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-8 border-b border-theme-secondary">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-theme-tertiary hover:text-theme-primary'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'smtp' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-theme-primary">
                    Configurações SMTP
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<BiTestTube />}
                      onClick={handleTestConnection}
                      disabled={testing}
                    >
                      {testing ? 'Testando...' : 'Testar Conexão'}
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Servidor SMTP *
                    </label>
                    <input
                      type="text"
                      value={smtpSettings.host}
                      onChange={(e) =>
                        setSMTPSettings((prev) => ({
                          ...prev,
                          host: e.target.value,
                        }))
                      }
                      className="input-classical-2 w-full"
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Porta *
                    </label>
                    <input
                      type="number"
                      value={smtpSettings.port}
                      onChange={(e) =>
                        setSMTPSettings((prev) => ({
                          ...prev,
                          port: parseInt(e.target.value),
                        }))
                      }
                      className="input-classical-2 w-full"
                      placeholder="587"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Usuário *
                    </label>
                    <input
                      type="text"
                      value={smtpSettings.user}
                      onChange={(e) =>
                        setSMTPSettings((prev) => ({
                          ...prev,
                          user: e.target.value,
                        }))
                      }
                      className="input-classical-2 w-full"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Senha *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={smtpSettings.pass}
                        onChange={(e) =>
                          setSMTPSettings((prev) => ({
                            ...prev,
                            pass: e.target.value,
                          }))
                        }
                        className="input-classical-2 w-full pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary hover:text-theme-primary"
                      >
                        {showPassword ? (
                          <FiEyeOff className="w-4 h-4" />
                        ) : (
                          <FiEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Nome do Remetente
                    </label>
                    <input
                      type="text"
                      value={smtpSettings.fromName}
                      onChange={(e) =>
                        setSMTPSettings((prev) => ({
                          ...prev,
                          fromName: e.target.value,
                        }))
                      }
                      className="input-classical-2 w-full"
                      placeholder="Opus Atlas"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Email do Remetente
                    </label>
                    <input
                      type="email"
                      value={smtpSettings.fromEmail}
                      onChange={(e) =>
                        setSMTPSettings((prev) => ({
                          ...prev,
                          fromEmail: e.target.value,
                        }))
                      }
                      className="input-classical-2 w-full"
                      placeholder="noreply@classicalhub.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Email de Resposta
                    </label>
                    <input
                      type="email"
                      value={smtpSettings.replyToEmail}
                      onChange={(e) =>
                        setSMTPSettings((prev) => ({
                          ...prev,
                          replyToEmail: e.target.value,
                        }))
                      }
                      className="input-classical-2 w-full"
                      placeholder="contato@classicalhub.com"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-theme-secondary rounded-lg">
                  <input
                    type="checkbox"
                    checked={smtpSettings.secure}
                    onChange={(e) =>
                      setSMTPSettings((prev) => ({
                        ...prev,
                        secure: e.target.checked,
                      }))
                    }
                    className="rounded border-theme-primary text-brand-primary focus:ring-brand-primary"
                  />
                  <div>
                    <label className="font-medium text-theme-primary">
                      Conexão Segura (SSL/TLS)
                    </label>
                    <p className="text-sm text-theme-tertiary">
                      Use SSL/TLS para porta 465, ou STARTTLS para porta 587
                    </p>
                  </div>
                </div>

                {connectionStatus && !connectionStatus.valid && (
                  <div className="p-4 bg-accent-red/10 border border-accent-red/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <FiAlertTriangle className="w-5 h-5 text-accent-red flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-accent-red mb-1">
                          Erro de Conexão
                        </h4>
                        <p className="text-sm text-accent-red/80">
                          {connectionStatus.error ||
                            'Erro desconhecido na conexão SMTP'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-theme-primary mb-6">
                  Configurações Gerais
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={generalSettings.enableDoubleOptIn}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            enableDoubleOptIn: e.target.checked,
                          }))
                        }
                        className="rounded border-theme-primary text-brand-primary focus:ring-brand-primary"
                      />
                      <div>
                        <label className="font-medium text-theme-primary">
                          Habilitar Double Opt-in
                        </label>
                        <p className="text-sm text-theme-tertiary">
                          Usuários precisam confirmar a inscrição por email
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={generalSettings.enableAnalytics}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            enableAnalytics: e.target.checked,
                          }))
                        }
                        className="rounded border-theme-primary text-brand-primary focus:ring-brand-primary"
                      />
                      <div>
                        <label className="font-medium text-theme-primary">
                          Habilitar Analytics
                        </label>
                        <p className="text-sm text-theme-tertiary">
                          Rastreamento de opens, cliques e engajamento
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Frequência Padrão
                      </label>
                      <select
                        value={generalSettings.defaultFrequency}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            defaultFrequency: e.target.value,
                          }))
                        }
                        className="input-classical-2 w-full"
                      >
                        <option value="daily">Diário</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Máximo por Lote
                      </label>
                      <input
                        type="number"
                        value={generalSettings.maxSubscribersPerBatch}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            maxSubscribersPerBatch: parseInt(e.target.value),
                          }))
                        }
                        className="input-classical-2 w-full"
                        min="1"
                        max="1000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Delay entre Lotes (ms)
                      </label>
                      <input
                        type="number"
                        value={generalSettings.delayBetweenBatches}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            delayBetweenBatches: parseInt(e.target.value),
                          }))
                        }
                        className="input-classical-2 w-full"
                        min="100"
                        max="10000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Retenção de Dados (dias)
                      </label>
                      <input
                        type="number"
                        value={generalSettings.retentionDays}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            retentionDays: parseInt(e.target.value),
                          }))
                        }
                        className="input-classical-2 w-full"
                        min="30"
                        max="2555"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-theme-primary mb-6">
                  Configurações de Segurança
                </h3>

                <div className="p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <FiInfo className="w-5 h-5 text-accent-blue flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-accent-blue mb-1">
                        Conformidade LGPD
                      </h4>
                      <p className="text-sm text-accent-blue/80">
                        Todas as configurações seguem as diretrizes da LGPD para
                        proteção de dados pessoais.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium text-theme-primary">
                        Double Opt-in
                      </h4>
                      <p className="text-sm text-theme-tertiary">
                        Confirmação obrigatória por email
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        generalSettings.enableDoubleOptIn
                          ? 'bg-accent-green/20 text-accent-green'
                          : 'bg-accent-red/20 text-accent-red'
                      }`}
                    >
                      {generalSettings.enableDoubleOptIn ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium text-theme-primary">
                        Unsubscribe Fácil
                      </h4>
                      <p className="text-sm text-theme-tertiary">
                        Link de cancelamento em todos os emails
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent-green/20 text-accent-green">
                      Sempre Ativo
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium text-theme-primary">
                        Retenção de Dados
                      </h4>
                      <p className="text-sm text-theme-tertiary">
                        Limpeza automática de dados antigos
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent-blue/20 text-accent-blue">
                      {generalSettings.retentionDays} dias
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium text-theme-primary">
                        Conexão Segura
                      </h4>
                      <p className="text-sm text-theme-tertiary">
                        Criptografia SSL/TLS
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        smtpSettings.secure
                          ? 'bg-accent-green/20 text-accent-green'
                          : 'bg-accent-amber/20 text-accent-amber'
                      }`}
                    >
                      {smtpSettings.secure ? 'SSL/TLS' : 'STARTTLS'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-6 border-t border-theme-secondary">
              <div className="flex items-center justify-between">
                <p className="text-sm text-theme-tertiary">
                  Configurações salvas automaticamente
                </p>
                <Button
                  variant="primary"
                  leftIcon={<FiSave />}
                  onClick={handleSaveSettings}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <FiRefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Configurações'
                  )}
                </Button>
              </div>
            </div>
          </AnimatedCard>
        </AnimatedContainer>
      </div>
    </PageContainer>
  );
}
