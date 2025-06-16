// app/profile/components/AccountSettingsSection.tsx
'use client';

import React, { useState } from 'react';
import { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { FiMail, FiLock, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

import { toast } from 'react-hot-toast';
import Input from '../../Common/Inputs';
import Button from '../../Common/Button';

interface AccountSettingsSectionProps {
  user: User;
  updateUser: (data: Partial<User>) => void;
}

const AccountSettingsSection: React.FC<AccountSettingsSectionProps> = ({
  user,
  updateUser,
}) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      // Aqui você faria a chamada para mudar a senha
      toast.success('Senha alterada com sucesso!');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Erro ao alterar senha. Verifique sua senha atual.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      // Aqui você faria a chamada para deletar a conta
      toast.success('Conta deletada com sucesso');
      await signOut({ redirect: true, callbackUrl: '/' });
    } catch (error) {
      toast.error('Erro ao deletar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Email */}
      <div>
        <h3 className="text-lg font-semibold text-theme-primary mb-4">
          Informações de Login
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              Email
            </label>
            <div className="flex items-center space-x-3">
              <Input
                value={user.email || ''}
                disabled
                leftIcon={<FiMail className="w-4 h-4" />}
                className="flex-1"
              />
              <Button variant="outline" size="sm" disabled>
                Alterar Email
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="border-t border-theme-secondary pt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-theme-primary">
            Alterar Senha
          </h3>

          {!isChangingPassword && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangingPassword(true)}
              leftIcon={<FiLock />}
            >
              Alterar Senha
            </Button>
          )}
        </div>

        {isChangingPassword && (
          <div className="classical-card-2 p-4 space-y-4">
            <Input
              label="Senha Atual"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              leftIcon={<FiLock className="w-4 h-4" />}
              placeholder="Digite sua senha atual"
            />

            <Input
              label="Nova Senha"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              leftIcon={<FiLock className="w-4 h-4" />}
              placeholder="Digite sua nova senha"
            />

            <Input
              label="Confirmar Nova Senha"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              leftIcon={<FiLock className="w-4 h-4" />}
              placeholder="Confirme sua nova senha"
            />

            <div className="flex space-x-3">
              <Button
                variant="primary"
                size="sm"
                onClick={handlePasswordChange}
                isLoading={isLoading}
              >
                Alterar Senha
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Account Type */}
      <div className="border-t border-theme-secondary pt-8">
        <h3 className="text-lg font-semibold text-theme-primary mb-4">
          Tipo de Conta
        </h3>

        <div className="classical-card-2 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-theme-primary">
                {user.userType === 'MUSIC_STUDENT' && 'Estudante de Música'}
                {user.userType === 'CASUAL_USER' && 'Entusiasta'}
                {user.userType === 'PROFESSIONAL' && 'Profissional'}
                {user.userType === 'TEACHER' && 'Professor'}
                {!user.userType && 'Não definido'}
              </p>
              <p className="text-sm text-theme-secondary">
                Para alterar o tipo de conta, complete novamente o onboarding
              </p>
            </div>

            <Button variant="outline" size="sm" disabled>
              Alterar Tipo
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border-t border-accent-red pt-8">
        <div className="flex items-center space-x-3 mb-4">
          <FiAlertTriangle className="w-5 h-5 text-accent-red" />
          <h3 className="text-lg font-semibold text-accent-red">
            Zona de Perigo
          </h3>
        </div>

        <div className="classical-card-2 p-4 border border-accent-red bg-accent-red bg-opacity-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-theme-primary mb-1">
                Deletar Conta
              </h4>
              <p className="text-sm text-theme-secondary">
                Esta ação não pode ser desfeita. Todos os seus dados serão
                perdidos permanentemente.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              leftIcon={<FiTrash2 />}
              className="border-accent-red text-accent-red hover:bg-accent-red hover:text-white"
            >
              Deletar Conta
            </Button>
          </div>

          {showDeleteConfirm && (
            <div className="mt-4 pt-4 border-t border-accent-red">
              <p className="text-sm text-accent-red mb-4 font-medium">
                ⚠️ Tem certeza? Esta ação é irreversível!
              </p>

              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDeleteAccount}
                  isLoading={isLoading}
                  className="bg-accent-red hover:bg-red-700"
                >
                  Sim, deletar minha conta
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsSection;
