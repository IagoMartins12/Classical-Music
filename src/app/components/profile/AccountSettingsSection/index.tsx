// app/profile/components/AccountSettingsSection.tsx - VERSÃO COM VERIFICAÇÃO DE LOGIN SOCIAL
'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'next-auth';
import {
  FiMail,
  FiLock,
  FiTrash2,
  FiAlertTriangle,
  FiUser,
  FiInfo,
  FiCheck,
  FiShield,
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

import { toast } from 'react-hot-toast';
import Input from '../../Common/Inputs';
import Button from '../../Common/Button';
import Select from '../../Common/Select';
import { changePassword, checkUserLoginMethod } from '@/app/actions/profile';
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
import { useTranslation } from '@/app/hooks/useTranslation';

interface AccountSettingsSectionProps {
  user: User;
}

interface LoginMethodInfo {
  hasPassword: boolean;
  hasSocialLogin: boolean;
  socialProviders: string[];
  isLoading: boolean;
}

const AccountSettingsSection: React.FC<AccountSettingsSectionProps> = ({
  user,
}) => {
  const { t } = useTranslation({ sections: ['pages/profile'] });
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

  // 🆕 NOVO: Estado para informações do método de login
  const [loginMethod, setLoginMethod] = useState<LoginMethodInfo>({
    hasPassword: true, // Assumir que tem senha por padrão
    hasSocialLogin: false,
    socialProviders: [],
    isLoading: true,
  });

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

  // 🆕 NOVO: Verificar método de login do usuário
  useEffect(() => {
    const checkLoginMethod = async () => {
      if (!user.id) return;

      try {
        setLoginMethod((prev) => ({ ...prev, isLoading: true }));

        const result = await checkUserLoginMethod(user.id);

        if (result.data && result.success) {
          setLoginMethod({
            hasPassword: result.data.hasPassword,
            hasSocialLogin: result.data.hasSocialLogin,
            socialProviders: result.data.socialProviders || [],
            isLoading: false,
          });

          console.log('🔍 Método de login verificado:', result.data);
        } else {
          console.error(
            '❌ Erro ao verificar método de login:',
            result.message
          );
          // Em caso de erro, assumir que tem senha (comportamento seguro)
          setLoginMethod({
            hasPassword: true,
            hasSocialLogin: false,
            socialProviders: [],
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('❌ Erro ao verificar método de login:', error);
        // Em caso de erro, assumir que tem senha (comportamento seguro)
        setLoginMethod({
          hasPassword: true,
          hasSocialLogin: false,
          socialProviders: [],
          isLoading: false,
        });
      }
    };

    checkLoginMethod();
  }, [user.id]);

  // Password validation
  const passwordValidation = AccountValidator.validatePassword(
    passwordData.newPassword
  );
  const isPasswordValid =
    passwordData.newPassword.length > 0 ? passwordValidation.isValid : true;

  // 🆕 NOVO: Verificar se pode alterar email (não pode se for só login social)
  const canChangeEmail =
    loginMethod.hasPassword ||
    (!loginMethod.isLoading && !loginMethod.hasSocialLogin);

  console.log('cascade, ', cascadeInfo);

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

  // 🆕 NOVO: Renderizar informações sobre método de login
  const renderLoginMethodInfo = () => {
    if (loginMethod.isLoading) {
      return (
        <div className="animate-pulse">
          <div className="h-4 bg-theme-secondary rounded w-32 mb-2"></div>
          <div className="h-3 bg-theme-secondary rounded w-48"></div>
        </div>
      );
    }

    const getLoginTypeLabel = () => {
      if (loginMethod.hasSocialLogin && !loginMethod.hasPassword) {
        return t('account_login_social');
      } else if (loginMethod.hasSocialLogin && loginMethod.hasPassword) {
        return t('account_login_hybrid');
      } else {
        return t('account_login_traditional');
      }
    };

    const getLoginDescription = () => {
      if (loginMethod.hasSocialLogin && !loginMethod.hasPassword) {
        return t('account_created_via', {
          provider: loginMethod.socialProviders.join(', '),
        });
      } else if (loginMethod.hasSocialLogin && loginMethod.hasPassword) {
        return t('account_email_password_plus', {
          providers: loginMethod.socialProviders.join(', '),
        });
      } else {
        return t('account_traditional_auth');
      }
    };

    return (
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <p className="font-medium text-theme-primary">
            {getLoginTypeLabel()}
          </p>
          <p className="text-sm text-theme-secondary">
            {getLoginDescription()}
          </p>
        </div>

        {loginMethod.socialProviders.includes('google') && (
          <div className="flex items-center space-x-2">
            <FcGoogle className="w-5 h-5" />
            <span className="text-sm text-theme-secondary">Google</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Email Verification Banner */}
      <EmailVerificationBanner2 />

      {/* Login Method Info */}
      {loginMethod.hasSocialLogin && (
        <div>
          <h3 className="text-lg font-semibold text-theme-primary mb-4">
            {t('account_auth_method')}
          </h3>

          <div className="classical-card-2 p-4">{renderLoginMethodInfo()}</div>
        </div>
      )}

      {/* Email Section */}
      <div className="border-t border-theme-secondary pt-8">
        <h3 className="text-lg font-semibold text-theme-primary mb-4">
          {t('account_login_info')}
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-theme-secondary">
                {t('account_email')}
              </label>
              {!isChangingEmail && canChangeEmail && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangingEmail(true)}
                  leftIcon={<FiMail />}
                >
                  {t('account_change_email')}
                </Button>
              )}
            </div>

            {!isChangingEmail ? (
              <div className="space-y-3">
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
                      <span>{t('account_verified')}</span>
                    </div>
                  )}
                </div>

                {/* 🆕 NOVO: Aviso para usuários com login social */}
                {!canChangeEmail && !loginMethod.isLoading && (
                  <div className="bg-accent-blue bg-opacity-10 border border-accent-blue rounded-lg p-4">
                    <div className="flex items-start">
                      <FiShield className="w-5 h-5 text-accent-blue mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-accent-blue mb-1">
                          {t('account_social_protected')}
                        </h4>
                        <p className="text-sm text-accent-blue opacity-90">
                          {t('account_social_protected_description', {
                            providers: loginMethod.socialProviders.join(' e '),
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="classical-card-2 p-4 space-y-4">
                <div className="bg-accent-amber bg-opacity-10 border border-red-400 rounded-lg p-4">
                  <div className="flex items-start">
                    <FiAlertTriangle className="w-5 h-5 text-accent-amber mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-accent-amber mb-1">
                        {t('account_email_change_warning')}
                      </h4>
                      <ul className="text-sm text-accent-amber opacity-90 space-y-1">
                        <li>{t('account_email_verify_new')}</li>
                        <li>{t('account_upload_disabled')}</li>
                        <li>{t('account_limited_features')}</li>
                        <li>{t('account_confirmation_email')}</li>
                        <li>{t('account_session_update')}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Input
                  label={t('account_new_email_required')}
                  type="email"
                  value={emailData.newEmail}
                  onChange={(e) =>
                    setEmailData((prev) => ({
                      ...prev,
                      newEmail: e.target.value,
                    }))
                  }
                  leftIcon={<FiMail className="w-4 h-4" />}
                  placeholder={t('account_new_email_placeholder')}
                  error={
                    emailData.newEmail && !validateEmail(emailData.newEmail)
                      ? 'Email inválido'
                      : undefined
                  }
                />

                <Input
                  label={t('account_current_password_required')}
                  type="password"
                  value={emailData.currentPassword}
                  onChange={(e) =>
                    setEmailData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  leftIcon={<FiLock className="w-4 h-4" />}
                  placeholder={t('account_current_password_placeholder')}
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
                    {t('account_request_change')}
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
                    {t('personal_info_cancel')}
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
            {loginMethod.hasPassword
              ? t('account_change_password')
              : t('account_define_password')}
          </h3>

          {!isChangingPassword && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangingPassword(true)}
              leftIcon={<FiLock />}
              disabled={
                !loginMethod.hasPassword &&
                loginMethod.hasSocialLogin &&
                !loginMethod.isLoading
              }
            >
              {loginMethod.hasPassword
                ? t('account_change_password')
                : t('account_define_password')}
            </Button>
          )}
        </div>

        {/* 🆕 NOVO: Aviso para usuários só com login social */}
        {!loginMethod.hasPassword &&
          loginMethod.hasSocialLogin &&
          !isChangingPassword &&
          !loginMethod.isLoading && (
            <div className="bg-accent-blue bg-opacity-10 border border-accent-blue rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <FiShield className="w-5 h-5 text-accent-blue mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-accent-blue mb-1">
                    {t('account_social_only')}
                  </h4>
                  <p className="text-sm text-accent-blue opacity-90">
                    {t('account_social_only_description', {
                      providers: loginMethod.socialProviders.join(' e '),
                    })}
                  </p>
                  <div className="mt-3 text-xs text-accent-blue opacity-80">
                    {t('account_continue_google')}
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* 🆕 NOVO: Informação para usuários híbridos que querem definir senha */}
        {!loginMethod.hasPassword &&
          !loginMethod.hasSocialLogin &&
          !isChangingPassword &&
          !loginMethod.isLoading && (
            <div className="bg-accent-amber bg-opacity-10 border border-accent-amber rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <FiInfo className="w-5 h-5 text-accent-amber mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-accent-amber mb-1">
                    {t('account_improve_security')}
                  </h4>
                  <p className="text-sm text-accent-amber opacity-90">
                    {t('account_define_password_description')}
                  </p>
                </div>
              </div>
            </div>
          )}

        {isChangingPassword && (
          <div className="classical-card-2 p-4 space-y-4">
            {/* Mostrar campo de senha atual apenas se o usuário já tem senha */}
            {loginMethod.hasPassword && (
              <Input
                label={t('account_current_password_required')}
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
            )}

            <div>
              <Input
                label={
                  loginMethod.hasPassword
                    ? t('account_new_password_required')
                    : t('account_password_required')
                }
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                leftIcon={<FiLock className="w-4 h-4" />}
                placeholder={
                  loginMethod.hasPassword
                    ? t('account_new_password_placeholder')
                    : t('account_password_placeholder')
                }
                error={!isPasswordValid ? passwordValidation.error : undefined}
              />

              {/* Password strength indicator */}
              {passwordData.newPassword && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-theme-secondary">
                      {t('account_password_strength')}
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
                      <p className="mb-1">
                        {t('account_password_suggestions')}
                      </p>
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
              label={
                loginMethod.hasPassword
                  ? t('account_confirm_new_password_required')
                  : t('account_confirm_password_required')
              }
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              leftIcon={<FiLock className="w-4 h-4" />}
              placeholder={
                loginMethod.hasPassword
                  ? t('account_confirm_new_password_placeholder')
                  : t('account_confirm_password_placeholder')
              }
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
                  (loginMethod.hasPassword && !passwordData.currentPassword) ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword ||
                  !isPasswordValid ||
                  passwordData.newPassword !== passwordData.confirmPassword
                }
              >
                {loginMethod.hasPassword
                  ? t('account_change_password')
                  : t('account_define_password')}
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
                {t('personal_info_cancel')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Account Type Section */}
      <div className="border-t border-theme-secondary pt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-theme-primary">
            {t('account_type')}
          </h3>

          {!isChangingUserType && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangingUserType(true)}
              leftIcon={<FiUser />}
            >
              {t('account_change_type')}
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
                  {t('account_type_description')}
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
                    {t('account_choose_type')}
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
              label={t('account_new_account_type')}
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
                {t('account_change_type')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsChangingUserType(false);
                  setNewUserType(user.userType || 'CASUAL_USER');
                }}
              >
                {t('personal_info_cancel')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="border-t border-theme-secondary pt-8">
        <h3 className="text-lg font-semibold text-theme-primary mb-4">
          {t('account_info')}
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div className="classical-card-2 p-4">
            <h4 className="font-medium text-theme-primary mb-2">
              {t('account_status')}
            </h4>
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                {t('account_active')}
              </span>
              {user.emailVerified && (
                <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {t('account_email_verified')}
                </span>
              )}
              {loginMethod.hasSocialLogin && (
                <span className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                  {t('account_social_login')}
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
            {t('account_danger_zone')}
          </h3>
        </div>

        <div className="classical-card-2 p-4 border border-accent-red bg-accent-red bg-opacity-5">
          <div className="flex items-center gap-4 justify-between mb-4">
            <div>
              <h4 className="font-medium text-theme-primary mb-1">
                {t('account_delete_permanent')}
              </h4>
              <p className="text-sm text-theme-secondary">
                {t('account_delete_warning')}
              </p>
            </div>

            <Button
              variant="delete"
              size="sm"
              onClick={handleOpenDeleteModal}
              leftIcon={<FiTrash2 />}
              className="truncate py-3 px-4"
            >
              {t('account_delete_button')}
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
