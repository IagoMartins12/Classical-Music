// app/profile/components/AccountSettingsSection.tsx (versão atualizada)
'use client';

import React, { useState } from 'react';
import { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { FiMail, FiLock, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

import { toast } from 'react-hot-toast';
import Input from '../../Common/Inputs';
import Button from '../../Common/Button';
import { changePassword, deleteUserAccount } from '@/app/actions/profile';
import { useAuth } from '@/app/hooks/useAuth';

interface AccountSettingsSectionProps {
  user: User;
}

const AccountSettingsSection: React.FC<AccountSettingsSectionProps> = ({
  user,
}) => {
  const { logout } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async () => {
    // Validações básicas
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

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('A nova senha deve ser diferente da atual');
      return;
    }

    setIsLoading(true);
    try {
      const result = await changePassword(user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (result.success) {
        toast.success(result.message);
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Validar confirmação
    if (deleteConfirmText.toLowerCase() !== 'deletar') {
      toast.error('Digite "deletar" para confirmar');
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteUserAccount(user.id);

      if (result.success) {
        toast.success(result.message);
        // Fazer logout e limpar dados locais
        logout();
        // Redirecionar via NextAuth
        await signOut({ redirect: true, callbackUrl: '/' });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      toast.error('Erro ao deletar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTypeLabel = (userType: string | null | undefined) => {
    switch (userType) {
      case 'MUSIC_STUDENT':
        return 'Estudante de Música';
      case 'CASUAL_USER':
        return 'Entusiasta';
      case 'PROFESSIONAL':
        return 'Profissional';
      case 'TEACHER':
        return 'Professor';
      default:
        return 'Não definido';
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
            <p className="text-xs text-theme-tertiary mt-1">
              Entre em contato com o suporte para alterar seu email
            </p>
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
              label="Senha Atual *"
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
              label="Nova Senha *"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              leftIcon={<FiLock className="w-4 h-4" />}
              placeholder="Digite sua nova senha (mín. 6 caracteres)"
            />

            <Input
              label="Confirmar Nova Senha *"
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
                disabled={
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword
                }
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
                {getUserTypeLabel(user.userType)}
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

      {/* Account Info */}
      <div className="border-t border-theme-secondary pt-8">
        <h3 className="text-lg font-semibold text-theme-primary mb-4">
          Informações da Conta
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="classical-card-2 p-4">
            <h4 className="font-medium text-theme-primary mb-2">
              ID do Usuário
            </h4>
            <p className="text-sm text-theme-secondary font-mono break-all">
              {user.id}
            </p>
          </div>

          <div className="classical-card-2 p-4">
            <h4 className="font-medium text-theme-primary mb-2">Status</h4>
            <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              Conta Ativa
            </span>
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-theme-primary mb-1">
                Deletar Conta Permanentemente
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
            <div className="border-t border-accent-red pt-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-accent-red mb-2 font-medium">
                    ⚠️ Esta ação é irreversível!
                  </p>
                  <p className="text-sm text-theme-secondary mb-4">
                    Os seguintes dados serão deletados permanentemente:
                  </p>
                  <ul className="text-sm text-theme-secondary list-disc list-inside space-y-1 mb-4">
                    <li>Todas as suas informações pessoais</li>
                    <li>Seus instrumentos e preferências musicais</li>
                    <li>Histórico de estudos e anotações</li>
                    <li>Obras favoritas e progresso</li>
                    <li>Dados de sessões de estudo</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Digite &quot;deletar&quot; para confirmar:
                  </label>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="deletar"
                    className="mb-4"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDeleteAccount}
                    isLoading={isLoading}
                    disabled={deleteConfirmText.toLowerCase() !== 'deletar'}
                    className="bg-accent-red hover:bg-red-700"
                  >
                    Sim, deletar minha conta permanentemente
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsSection;
