// app/hooks/useAdminSettings.ts
import { useState, useEffect, useCallback } from 'react';

export interface SystemConfig {
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

export interface QualityRule {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'metadata' | 'format' | 'user';
  severity: 'info' | 'warning' | 'error';
  isActive: boolean;
  autoAction: 'none' | 'flag' | 'reject' | 'approve';
  parameters: Record<string, any>;
}

interface UseAdminSettingsReturn {
  config: SystemConfig | null;
  qualityRules: QualityRule[];
  loading: boolean;
  error: string | null;
  hasChanges: boolean;
  updateConfig: (
    section: keyof SystemConfig,
    field: string,
    value: any
  ) => void;
  updateQualityRule: (ruleId: string, updates: Partial<QualityRule>) => void;
  saveSettings: () => Promise<boolean>;
  refreshData: () => Promise<void>;
  resetChanges: () => void;
}

export const useAdminSettings = (): UseAdminSettingsReturn => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [qualityRules, setQualityRules] = useState<QualityRule[]>([]);
  const [originalConfig, setOriginalConfig] = useState<SystemConfig | null>(
    null
  );
  const [originalRules, setOriginalRules] = useState<QualityRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/settings');

      if (!response.ok) {
        throw new Error('Erro ao carregar configurações');
      }

      const data = await response.json();

      if (data.success) {
        setConfig(data.config);
        setQualityRules(data.qualityRules || []);
        setOriginalConfig(data.config);
        setOriginalRules(data.qualityRules || []);
        setHasChanges(false);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar configurações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(
    (section: keyof SystemConfig, field: string, value: any) => {
      if (!config) return;

      setConfig((prev) => ({
        ...prev!,
        [section]: {
          ...prev![section],
          [field]: value,
        },
      }));
      setHasChanges(true);
    },
    [config]
  );

  const updateQualityRule = useCallback(
    (ruleId: string, updates: Partial<QualityRule>) => {
      setQualityRules((prev) =>
        prev.map((rule) =>
          rule.id === ruleId ? { ...rule, ...updates } : rule
        )
      );
      setHasChanges(true);
    },
    []
  );

  const saveSettings = useCallback(async (): Promise<boolean> => {
    if (!config) return false;

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, qualityRules }),
      });

      if (!response.ok) throw new Error('Erro ao salvar configurações');

      const data = await response.json();
      if (data.success) {
        setOriginalConfig(config);
        setOriginalRules(qualityRules);
        setHasChanges(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    }
  }, [config, qualityRules]);

  const resetChanges = useCallback(() => {
    if (originalConfig) {
      setConfig(originalConfig);
      setQualityRules(originalRules);
      setHasChanges(false);
    }
  }, [originalConfig, originalRules]);

  const refreshData = useCallback(async () => {
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    config,
    qualityRules,
    loading,
    error,
    hasChanges,
    updateConfig,
    updateQualityRule,
    saveSettings,
    refreshData,
    resetChanges,
  };
};
