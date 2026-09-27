'use client';

import { useState } from 'react';
import {
  PiFloppyDisk,
  PiGear,
  PiMedal,
  PiShield,
  PiUser,
  PiWarning,
} from 'react-icons/pi';
import {
  AnimatedCard,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import { AdminUser } from '@/app/hooks/admin/useAdminUsers';
import Modal from '@/app/components/Modal';
import { updateAdminUser } from '@/app/requests/admin/users';
import { Text } from '@/app/components/ui/Text';
import { Stack } from '@/app/components/ui/Layout';

interface UserEditModalProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: AdminUser) => void;
}

interface UserEditData {
  role: number;
  userType: string;
  experienceLevel: string;
}

const ROLE_OPTIONS = [
  {
    value: 0,
    label: 'Usuário Comum',
    description: 'Acesso básico à plataforma',
  },
  {
    value: 1,
    label: 'Professor',
    description: 'Acesso a ferramentas educacionais',
  },
  { value: 2, label: 'Super Admin', description: 'Acesso total ao sistema' },
];

const USER_TYPE_OPTIONS = [
  { value: 'MUSIC_STUDENT', label: 'Estudante de Música' },
  { value: 'CASUAL_USER', label: 'Usuário Casual' },
  { value: 'PROFESSIONAL', label: 'Profissional' },
  { value: 'TEACHER', label: 'Professor' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];

export default function UserEditModal({
  user,
  isOpen,
  onClose,
  onSave,
}: UserEditModalProps) {
  const [editData, setEditData] = useState<UserEditData>({
    role: user.role || 0,
    userType: user.userType || 'CASUAL_USER',
    experienceLevel: user.experienceLevel || 'BEGINNER',
  });

  const [loading, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field: keyof UserEditData, value: any) => {
    setEditData((prev) => {
      const newData = { ...prev, [field]: value };

      // Verificar se há mudanças
      const originalData = {
        role: user.role || 0,
        userType: user.userType || 'CASUAL_USER',
        experienceLevel: user.experienceLevel || 'BEGINNER',
      };

      const hasChanged = Object.keys(newData).some(
        (key) =>
          newData[key as keyof UserEditData] !==
          originalData[key as keyof UserEditData]
      );

      setHasChanges(hasChanged);
      return newData;
    });
  };

  const handleSave = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // O nível de experiência é da própria pessoa: a API não o edita pelo
      // painel. A tela recebe o usuário como ficou na API.
      const updated = await updateAdminUser(user.id, {
        role: editData.role,
        userType: editData.userType,
      });

      onSave({ ...user, ...updated });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role: number) => {
    switch (role) {
      case 0:
        return 'text-theme-tertiary border-theme-primary';
      case 1:
        return '';
      case 2:
        return '';
      default:
        return 'text-theme-tertiary border-theme-primary';
    }
  };

  const getRoleIcon = (role: number) => {
    switch (role) {
      case 0:
        return PiUser;
      case 1:
        return PiMedal;
      case 2:
        return PiShield;
      default:
        return PiUser;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      maxWidth="4xl"
      onClose={onClose}
      className="border border-theme-primary rounded-2xl w-full overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-theme-primary">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center">
            <PiGear className="w-5 h-5 text-theme-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-theme-primary">
              Editar Usuário
            </h2>
            <p className="text-theme-tertiary">{user.name || user.email}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto ">
        {error && (
          <div className="mb-6 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <PiWarning className="w-5 h-5" />
              <span className="font-medium">Erro</span>
            </div>
            <p className="mt-1">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Role do Usuário */}
          <AnimatedCard className="classical-card p-4">
            <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
              <PiShield className="w-5 h-5" />
              Role do Sistema
            </h3>

            <div className="space-y-3">
              {ROLE_OPTIONS.map((option) => {
                const IconComponent = getRoleIcon(option.value);
                return (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      editData.role === option.value
                        ? `${getRoleColor(option.value)} bg-theme-secondary`
                        : 'border-theme-primary'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={editData.role === option.value}
                      onChange={(e) =>
                        handleInputChange('role', parseInt(e.target.value))
                      }
                      className="sr-only"
                    />

                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        editData.role === option.value &&
                        (option.value === 1 || option.value === 2)
                          ? ''
                          : 'bg-theme-secondary'
                      }`}
                    >
                      <IconComponent
                        className={`w-5 h-5 ${
                          editData.role === option.value
                            ? getRoleColor(option.value).split(' ')[0]
                            : 'text-theme-tertiary'
                        }`}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="font-medium text-theme-primary">
                        {option.label}
                      </div>
                      <Text papel="rotulo" tom="fraco" as="div">
                        {option.description}
                      </Text>
                    </div>
                  </label>
                );
              })}
            </div>
          </AnimatedCard>

          {/* Resumo das Alterações */}
          {hasChanges && (
            <AnimatedCard className="classical-card p-4">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <PiGear className="w-5 h-5" />
                Alterações Pendentes
              </h3>

              <Stack gap={2} className="text-sm">
                {editData.role !== (user.role || 0) && (
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Role:</span>
                    <span className="font-medium">
                      {ROLE_OPTIONS.find((r) => r.value === user.role)?.label} →{' '}
                      {
                        ROLE_OPTIONS.find((r) => r.value === editData.role)
                          ?.label
                      }
                    </span>
                  </div>
                )}

                {editData.userType !== (user.userType || 'CASUAL_USER') && (
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Tipo:</span>
                    <span className="font-medium">
                      {
                        USER_TYPE_OPTIONS.find((t) => t.value === user.userType)
                          ?.label
                      }{' '}
                      →{' '}
                      {
                        USER_TYPE_OPTIONS.find(
                          (t) => t.value === editData.userType
                        )?.label
                      }
                    </span>
                  </div>
                )}

                {editData.experienceLevel !==
                  (user.experienceLevel || 'BEGINNER') && (
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Experiência:</span>
                    <span className="font-medium">
                      {
                        EXPERIENCE_OPTIONS.find(
                          (e) => e.value === user.experienceLevel
                        )?.label
                      }{' '}
                      →{' '}
                      {
                        EXPERIENCE_OPTIONS.find(
                          (e) => e.value === editData.experienceLevel
                        )?.label
                      }
                    </span>
                  </div>
                )}
              </Stack>
            </AnimatedCard>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-theme-primary bg-theme-secondary">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>

        <Button
          variant="primary"
          leftIcon={loading ? <LoadingSpinner size="sm" /> : <PiFloppyDisk />}
          onClick={handleSave}
          disabled={loading || !hasChanges}
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </Modal>
  );
}
