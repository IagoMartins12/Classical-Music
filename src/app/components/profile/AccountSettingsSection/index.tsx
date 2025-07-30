// app/profile/components/AccountSettingsSection.tsx - FINAL VERSION WITH ALL FEATURES
'use client';

import React, { useState } from 'react';
import { User } from 'next-auth';
import {
  FiMail,
  FiLock,
  FiTrash2,
  FiAlertTriangle,
  FiUser,
  FiInfo,
  FiCheck,
} from 'react-icons/fi';

import { toast } from 'react-hot-toast';
import Input from '../../Common/Inputs';
import Button from '../../Common/Button';
import Select from '../../Common/Select';
import { changePassword } from '@/app/actions/profile';
import { useAccountManagement } from '@/app/hooks/useAccountManagement';
import {
  AccountValidator,
  USER_TYPE_OPTIONS,
  PASSWORD_STRENGTH_COLORS,
  PASSWORD_STRENGTH_LABELS,
  UserTypeValueOptions,
} from '@/app/utils/accountValidation';
import DeleteAccountModal from '../../DeleteAccountModal';
import EmailVerificationBanner2 from '../../EmailVerification/EmailVerificationBanner2';

interface AccountSettingsSectionProps {
  user: User;
}

const AccountSettingsSection: React.FC<AccountSettingsSectionProps> = ({
  user,
}) => {
  const {
    isEmailChanging,
    isUserTypeChanging,
    isDeleting,
    isCascadeLoading,
    cascadeInfo,
    changeEmail,
    changeAccountType,
    loadCascadeInfo,
    deleteAccount,
    clearCascadeInfo,
    getUserTypeLabel,
    validateEmail,
  } = useAccountManagement();

  // States for password change
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // States for email change
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [emailData, setEmailData] = useState({
    newEmail: '',
    currentPassword: '',
  });

  // States for user type change
  const [isChangingUserType, setIsChangingUserType] = useState(false);
  const [newUserType, setNewUserType] = useState(
    user.userType || 'CASUAL_USER'
  );

  // States for account deletion
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Password validation
  const passwordValidation = AccountValidator.validatePassword(
    passwordData.newPassword
  );
  const isPasswordValid =
    passwordData.newPassword.length > 0 ? passwordValidation.isValid : true;

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

    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.error || 'Senha inválida');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('A nova senha deve ser diferente da atual');
      return;
    }

    setIsPasswordLoading(true);
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
      setIsPasswordLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (!emailData.newEmail || !emailData.currentPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (emailData.newEmail === user.email) {
      toast.error('Este já é seu email atual');
      return;
    }

    if (!validateEmail(emailData.newEmail)) {
      toast.error('Email inválido');
      return;
    }

    const result = await changeEmail({
      newEmail: emailData.newEmail,
      currentPassword: emailData.currentPassword,
    });

    if (result.success) {
      setIsChangingEmail(false);
      setEmailData({
        newEmail: '',
        currentPassword: '',
      });
    }
  };

  const handleUserTypeChange = async () => {
    if (newUserType === user.userType) {
      toast.error('Este já é seu tipo de conta atual');
      return;
    }

    const result = await changeAccountType({
      userType: newUserType as any,
    });

    if (result.success) {
      setIsChangingUserType(false);
    }
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
    setShowDeleteModal(false);
  };

  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
    clearCascadeInfo();
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    clearCascadeInfo();
  };

  console.log('user', user);

  return (
    <div className="space-y-8">
      {/* Email Verification Banner */}
      <EmailVerificationBanner2 />

      {/* Email Section */}
      <div>
        <h3 className="text-lg font-semibold text-theme-primary mb-4">
          Informações de Login
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-theme-secondary">
                Email
              </label>
              {!isChangingEmail && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangingEmail(true)}
                  leftIcon={<FiMail />}
                >
                  Alterar Email
                </Button>
              )}
            </div>

            {!isChangingEmail ? (
              <div className="flex items-center space-x-3">
                <Input
                  value={user.email || ''}
                  disabled
                  leftIcon={<FiMail className="w-4 h-4" />}
                  className="flex-1"
                />
                {user.emailVerified && (
                  <div className="flex items-center space-x-1 text-accent-green text-sm">
                    <FiCheck className="w-4 h-4" />
                    <span>Verificado</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="classical-card-2 p-4 space-y-4">
                <div className="bg-accent-amber bg-opacity-10 border border-accent-amber rounded-lg p-4">
                  <div className="flex items-start">
                    <FiAlertTriangle className="w-5 h-5 text-accent-amber mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-accent-amber mb-1">
                        ⚠️ Importante sobre mudança de email
                      </h4>
                      <ul className="text-sm text-accent-amber opacity-90 space-y-1">
                        <li>• Você precisará verificar o novo email</li>
                        <li>
                          • Upload de arquivos será temporariamente desabilitado
                        </li>
                        <li>
                          • Algumas funcionalidades ficarão limitadas até a
                          verificação
                        </li>
                        <li>
                          • Você receberá um email de confirmação no novo
                          endereço
                        </li>
                        <li>
                          • Sua sessão será atualizada automaticamente após a
                          confirmação
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Input
                  label="Novo Email *"
                  type="email"
                  value={emailData.newEmail}
                  onChange={(e) =>
                    setEmailData((prev) => ({
                      ...prev,
                      newEmail: e.target.value,
                    }))
                  }
                  leftIcon={<FiMail className="w-4 h-4" />}
                  placeholder="Digite seu novo email"
                  error={
                    emailData.newEmail && !validateEmail(emailData.newEmail)
                      ? 'Email inválido'
                      : undefined
                  }
                />

                <Input
                  label="Senha Atual *"
                  type="password"
                  value={emailData.currentPassword}
                  onChange={(e) =>
                    setEmailData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  leftIcon={<FiLock className="w-4 h-4" />}
                  placeholder="Digite sua senha atual para confirmar"
                />

                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleEmailChange}
                    isLoading={isEmailChanging}
                    disabled={
                      !emailData.newEmail ||
                      !emailData.currentPassword ||
                      !validateEmail(emailData.newEmail)
                    }
                  >
                    Solicitar Mudança
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsChangingEmail(false);
                      setEmailData({
                        newEmail: '',
                        currentPassword: '',
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Section */}
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

            <div>
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
                placeholder="Digite sua nova senha"
                error={!isPasswordValid ? passwordValidation.error : undefined}
              />

              {/* Password strength indicator */}
              {passwordData.newPassword && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-theme-secondary">
                      Força da senha:
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        PASSWORD_STRENGTH_COLORS[passwordValidation.strength]
                      }`}
                    >
                      {PASSWORD_STRENGTH_LABELS[passwordValidation.strength]}
                    </span>
                  </div>

                  {passwordValidation.suggestions.length > 0 && (
                    <div className="text-xs text-theme-tertiary">
                      <p className="mb-1">Sugestões:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {passwordValidation.suggestions.map(
                          (suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

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
              error={
                passwordData.confirmPassword &&
                passwordData.newPassword !== passwordData.confirmPassword
                  ? 'Senhas não coincidem'
                  : undefined
              }
            />

            <div className="flex space-x-3">
              <Button
                variant="primary"
                size="sm"
                onClick={handlePasswordChange}
                isLoading={isPasswordLoading}
                disabled={
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword ||
                  !isPasswordValid ||
                  passwordData.newPassword !== passwordData.confirmPassword
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

      {/* Account Type Section */}
      <div className="border-t border-theme-secondary pt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-theme-primary">
            Tipo de Conta
          </h3>

          {!isChangingUserType && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangingUserType(true)}
              leftIcon={<FiUser />}
            >
              Alterar Tipo
            </Button>
          )}
        </div>

        {!isChangingUserType ? (
          <div className="classical-card-2 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-theme-primary">
                  {getUserTypeLabel(user.userType)}
                </p>
                <p className="text-sm text-theme-secondary">
                  Define suas preferências e experiências na plataforma
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
                <FiUser className="w-6 h-6 text-theme-primary" />
              </div>
            </div>
          </div>
        ) : (
          <div className="classical-card-2 p-4 space-y-4">
            <div className="bg-accent-blue bg-opacity-10 border border-accent-blue rounded-lg p-4">
              <div className="flex items-start">
                <FiInfo className="w-5 h-5 text-accent-blue mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-accent-blue mb-2">
                    Escolha o tipo que melhor descreve você:
                  </h4>
                  <div className="space-y-2 text-sm text-accent-blue opacity-90">
                    {USER_TYPE_OPTIONS.map((option) => (
                      <div key={option.value}>
                        <strong>{option.label}:</strong> {option.description}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Select
              label="Novo Tipo de Conta"
              options={USER_TYPE_OPTIONS}
              value={newUserType}
              onChange={(e) => {
                setNewUserType(e.target.value as UserTypeValueOptions);
              }}
              className="input-classical-2 w-full"
            />

            <div className="flex space-x-3">
              <Button
                variant="primary"
                size="sm"
                onClick={handleUserTypeChange}
                isLoading={isUserTypeChanging}
                disabled={newUserType === user.userType}
              >
                Alterar Tipo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsChangingUserType(false);
                  setNewUserType(user.userType || 'CASUAL_USER');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="border-t border-theme-secondary pt-8">
        <h3 className="text-lg font-semibold text-theme-primary mb-4">
          Informações da Conta
        </h3>

        <div className="grid grid-cols-1  gap-4">
          <div className="classical-card-2 p-4">
            <h4 className="font-medium text-theme-primary mb-2">Status</h4>
            <div className="flex items-center space-x-2">
              <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Conta Ativa
              </span>
              {user.emailVerified && (
                <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Email Verificado
                </span>
              )}
            </div>
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
                perdidos permanentemente e você receberá um email de despedida.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenDeleteModal}
              leftIcon={<FiTrash2 />}
              className="border-accent-red text-accent-red hover:bg-accent-red hover:text-white"
            >
              Deletar Conta
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteAccount}
        onLoadCascadeInfo={loadCascadeInfo}
        isLoading={isDeleting}
        isCascadeLoading={isCascadeLoading}
        cascadeInfo={cascadeInfo}
        userName={user.firstName || user.name || 'Usuário'}
        userEmail={user.email || ''}
      />
    </div>
  );
};

export default AccountSettingsSection;
