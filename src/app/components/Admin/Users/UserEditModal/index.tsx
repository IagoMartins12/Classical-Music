// app/components/Admin/Users/UserEditModal.tsx
'use client';

import { useState } from 'react';
import { FiX, FiSave, FiUser } from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import { AdminUser } from '@/app/hooks/admin/useAdminUsers';

interface UserEditModalProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, data: any) => Promise<boolean>;
}

export default function UserEditModal({
  user,
  isOpen,
  onClose,
  onSave,
}: UserEditModalProps) {
  const [formData, setFormData] = useState({
    userType: user.userType || 'CASUAL_USER',
    experienceLevel: user.experienceLevel || 'BEGINNER',
    canUploadComposers: true,
    canUploadWorks: true,
    canUploadScores: true,
    uploadLimitDaily: 50,
    uploadLimitMonthly: 1000,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const success = await onSave(user.id, formData);
    setSaving(false);

    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-theme-overlay backdrop-blur-sm flex items-center justify-center p-4">
      <div className="classical-card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
              <FiUser className="w-5 h-5 text-theme-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-primary">
                Editar Usuário
              </h2>
              <p className="text-sm text-theme-tertiary">{user.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-theme-tertiary hover:text-theme-primary hover:bg-theme-secondary transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* User Type */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Tipo de Usuário
            </label>
            <Select
              value={formData.userType}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, userType: e.target.value }))
              }
              options={[
                { value: 'MUSIC_STUDENT', label: 'Estudante de Música' },
                { value: 'CASUAL_USER', label: 'Usuário Casual' },
                { value: 'PROFESSIONAL', label: 'Profissional' },
                { value: 'TEACHER', label: 'Professor' },
              ]}
              className="input-classical-2 w-full"
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Nível de Experiência
            </label>
            <Select
              value={formData.experienceLevel}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  experienceLevel: e.target.value,
                }))
              }
              options={[
                { value: 'BEGINNER', label: 'Iniciante' },
                { value: 'INTERMEDIATE', label: 'Intermediário' },
                { value: 'ADVANCED', label: 'Avançado' },
              ]}
              className="input-classical-2 w-full"
            />
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-lg font-bold text-theme-primary mb-4">
              Permissões
            </h3>
          </div>

          {/* Upload Limits */}
          <div>
            <h3 className="text-lg font-bold text-theme-primary mb-4">
              Limites de Upload
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Limite Diário
                </label>
                <input
                  type="number"
                  value={formData.uploadLimitDaily}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      uploadLimitDaily: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="input-classical-2 w-full"
                  min="0"
                  max="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Limite Mensal
                </label>
                <input
                  type="number"
                  value={formData.uploadLimitMonthly}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      uploadLimitMonthly: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="input-classical-2 w-full"
                  min="0"
                  max="10000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-theme-secondary">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            leftIcon={<FiSave />}
            onClick={handleSave}
            disabled={saving}
          >
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
