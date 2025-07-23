// app/hooks/admin/useNewsletterSettings.ts
import { useState, useCallback, useEffect } from 'react';

interface ConnectionStatus {
  valid: boolean;
  provider: string;
  error?: string;
}

interface NewsletterSettings {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromName: string;
    fromEmail: string;
    replyToEmail: string;
  };
  general: {
    enableDoubleOptIn: boolean;
    defaultFrequency: string;
    maxSubscribersPerBatch: number;
    delayBetweenBatches: number;
    enableAutomation: boolean;
    enableAnalytics: boolean;
    retentionDays: number;
  };
  automation: {
    welcomeEmailDelay: number;
    weeklyDigestDay: number;
    weeklyDigestHour: number;
    newComposerNotificationDelay: number;
    enableBehaviorTriggers: boolean;
    maxEmailsPerDay: number;
  };
}

interface UseNewsletterSettingsReturn {
  settings: NewsletterSettings | null;
  loading: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus | null;
  saveSettings: (settings: NewsletterSettings) => Promise<void>;
  testConnection: (smtpSettings: any) => Promise<ConnectionStatus>;
  fetchSettings: () => Promise<void>;
}

export const useNewsletterSettings = (): UseNewsletterSettingsReturn => {
  const [settings, setSettings] = useState<NewsletterSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/newsletter/settings');
      const result = await response.json();

      if (result.success) {
        setSettings(result.settings);
        setConnectionStatus(result.connectionStatus);
      } else {
        setError(result.error || 'Erro ao carregar configurações');
      }
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: NewsletterSettings) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/newsletter/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      const result = await response.json();

      if (result.success) {
        setSettings(newSettings);
        setConnectionStatus(result.connectionStatus);
      } else {
        throw new Error(result.error || 'Erro ao salvar configurações');
      }
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      setError(
        err instanceof Error ? err.message : 'Erro ao salvar configurações'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const testConnection = useCallback(
    async (smtpSettings: any): Promise<ConnectionStatus> => {
      try {
        const response = await fetch(
          '/api/admin/newsletter/settings/test-connection',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(smtpSettings),
          }
        );

        const result = await response.json();

        const status: ConnectionStatus = {
          valid: result.success,
          provider: result.provider || 'nodemailer',
          error: result.error,
        };

        setConnectionStatus(status);
        return status;
      } catch (err) {
        console.error('Erro no teste de conexão:', err);
        const status: ConnectionStatus = {
          valid: false,
          provider: 'nodemailer',
          error: 'Erro de conexão',
        };
        setConnectionStatus(status);
        return status;
      }
    },
    []
  );

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    connectionStatus,
    saveSettings,
    testConnection,
    fetchSettings,
  };
};
