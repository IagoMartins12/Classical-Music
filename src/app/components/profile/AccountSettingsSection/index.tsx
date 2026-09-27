// app/profile/components/AccountSettingsSection.tsx - VERSÃO COM VERIFICAÇÃO DE LOGIN SOCIAL
'use client';

import React, { useState, useEffect } from 'react';
// Era `User` do NextAuth, aumentado em `types/next-auth.d.ts`. É o mesmo
// objeto que `useAuth()` entrega, e ele já tem tipo próprio no store.
import type { User } from '@/app/hooks/userStore';
import { FcGoogle } from 'react-icons/fc';
import {
  PiCheck,
  PiEnvelopeSimple,
  PiInfo,
  PiLock,
  PiShield,
  PiTrash,
  PiUser,
  PiWarning,
} from 'react-icons/pi';

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
import { useTranslation } from '@/app/context/TranslationContext';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

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

  const handleDeleteAccount = async (currentPassword?: string) => {
    await deleteAccount(currentPassword);
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
        <Stack gap={2} className="animate-pulse">
          <div className="h-4 bg-theme-secondary rounded w-32"></div>
          <div className="h-3 bg-theme-secondary rounded w-48"></div>
        </Stack>
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
      <Inline gap={4}>
        <div className="flex-1">
          <p className="font-medium text-theme-primary">
            {getLoginTypeLabel()}
          </p>
          <Text papel="rotulo" tom="suave" as="p">
            {getLoginDescription()}
          </Text>
        </div>

        {loginMethod.socialProviders.includes('google') && (
          <Inline gap={2}>
            <FcGoogle className="w-5 h-5" />
            <Text papel="rotulo" tom="suave">
              Google
            </Text>
          </Inline>
        )}
      </Inline>
    );
  };

  return (
    <div className="space-y-8">
      {/* Email Verification Banner */}
      <EmailVerificationBanner2 />

      {/* Login Method Info */}
      {loginMethod.hasSocialLogin && (
        <Stack>
          <h3 className="text-lg font-semibold text-theme-primary">
            {t('account_auth_method')}
          </h3>

          <Card nivel={2} densidade="compacta">
            {renderLoginMethodInfo()}
          </Card>
        </Stack>
      )}

      {/* Email Section */}
      <Stack className="border-t border-theme-secondary pt-8">
        <h3 className="text-lg font-semibold text-theme-primary">
          {t('account_login_info')}
        </h3>

        <Stack>
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
                  leftIcon={<PiEnvelopeSimple />}
                >
                  {t('account_change_email')}
                </Button>
              )}
            </div>

            {!isChangingEmail ? (
              <Stack gap={3}>
                <Inline gap={3}>
                  <Input
                    value={user.email || ''}
                    disabled
                    leftIcon={<PiEnvelopeSimple className="w-4 h-4" />}
                    className="flex-1"
                  />
                  {user.emailVerified && (
                    <Inline gap={1} className="text-ok text-sm">
                      <PiCheck className="w-4 h-4" />
                      <span>{t('account_verified')}</span>
                    </Inline>
                  )}
                </Inline>

                {/* 🆕 NOVO: Aviso para usuários com login social */}
                {!canChangeEmail && !loginMethod.isLoading && (
                  <div className="bg-aviso/10 border border-aviso rounded-lg p-4">
                    <div className="flex items-start">
                      <PiShield className="w-5 h-5 text-aviso mr-3 mt-0.5 flex-shrink-0" />
                      <Stack gap={1}>
                        <h4 className="font-medium text-aviso">
                          {t('account_social_protected')}
                        </h4>
                        <p className="text-sm text-aviso opacity-90">
                          {t('account_social_protected_description', {
                            providers: loginMethod.socialProviders.join(' e '),
                          })}
                        </p>
                      </Stack>
                    </div>
                  </div>
                )}
              </Stack>
            ) : (
              <Card nivel={2} densidade="compacta" className="space-y-4">
                <div className="bg-atencao/10 border border-erro rounded-lg p-4">
                  <div className="flex items-start">
                    <PiWarning className="w-5 h-5 text-atencao mr-3 mt-0.5 flex-shrink-0" />
                    <Stack gap={1}>
                      <h4 className="font-medium text-atencao">
                        {t('account_email_change_warning')}
                      </h4>
                      <ul className="text-sm text-atencao opacity-90 space-y-1">
                        <li>{t('account_email_verify_new')}</li>
                        <li>{t('account_upload_disabled')}</li>
                        <li>{t('account_limited_features')}</li>
                        <li>{t('account_confirmation_email')}</li>
                        <li>{t('account_session_update')}</li>
                      </ul>
                    </Stack>
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
                  leftIcon={<PiEnvelopeSimple className="w-4 h-4" />}
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
                  leftIcon={<PiLock className="w-4 h-4" />}
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
              </Card>
            )}
          </div>
        </Stack>
      </Stack>

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
              leftIcon={<PiLock />}
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
            <div className="bg-aviso/10 border border-aviso rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <PiShield className="w-5 h-5 text-aviso mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-aviso mb-1">
                    {t('account_social_only')}
                  </h4>
                  <p className="text-sm text-aviso opacity-90">
                    {t('account_social_only_description', {
                      providers: loginMethod.socialProviders.join(' e '),
                    })}
                  </p>
                  <div className="mt-3 text-xs text-aviso opacity-80">
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
            <div className="bg-atencao/10 border border-atencao rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <PiInfo className="w-5 h-5 text-atencao mr-3 mt-0.5 flex-shrink-0" />
                <Stack gap={1}>
                  <h4 className="font-medium text-atencao">
                    {t('account_improve_security')}
                  </h4>
                  <p className="text-sm text-atencao opacity-90">
                    {t('account_define_password_description')}
                  </p>
                </Stack>
              </div>
            </div>
          )}

        {isChangingPassword && (
          <Card nivel={2} densidade="compacta" className="space-y-4">
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
                leftIcon={<PiLock className="w-4 h-4" />}
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
                leftIcon={<PiLock className="w-4 h-4" />}
                placeholder={
                  loginMethod.hasPassword
                    ? t('account_new_password_placeholder')
                    : t('account_password_placeholder')
                }
                error={!isPasswordValid ? passwordValidation.error : undefined}
              />

              {/* Password strength indicator */}
              {passwordData.newPassword && (
                <Stack gap={2} className="mt-2">
                  <div className="flex items-center justify-between">
                    <Text papel="legenda" tom="suave">
                      {t('account_password_strength')}
                    </Text>
                    <span
                      className={`text-xs font-medium ${
                        PASSWORD_STRENGTH_COLORS[passwordValidation.strength]
                      }`}
                    >
                      {PASSWORD_STRENGTH_LABELS[passwordValidation.strength]}
                    </span>
                  </div>

                  {passwordValidation.suggestions.length > 0 && (
                    <Text papel="legenda" tom="fraco" as="div">
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
                    </Text>
                  )}
                </Stack>
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
              leftIcon={<PiLock className="w-4 h-4" />}
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
          </Card>
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
              leftIcon={<PiUser />}
            >
              {t('account_change_type')}
            </Button>
          )}
        </div>

        {!isChangingUserType ? (
          <Card nivel={2} densidade="compacta">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-theme-primary">
                  {getUserTypeLabel(user.userType)}
                </p>
                <Text papel="rotulo" tom="suave" as="p">
                  {t('account_type_description')}
                </Text>
              </div>
              <div className="w-12 h-12 fill-ouro rounded-xl flex items-center justify-center">
                <PiUser className="w-6 h-6 text-theme-primary" />
              </div>
            </div>
          </Card>
        ) : (
          <Card nivel={2} densidade="compacta" className="space-y-4">
            <div className="bg-aviso/10 border border-aviso rounded-lg p-4">
              <div className="flex items-start">
                <PiInfo className="w-5 h-5 text-aviso mr-3 mt-0.5 flex-shrink-0" />
                <Stack gap={2}>
                  <h4 className="font-medium text-aviso">
                    {t('account_choose_type')}
                  </h4>
                  <Stack gap={2} className="text-sm text-aviso opacity-90">
                    {USER_TYPE_OPTIONS.map((option) => (
                      <div key={option.value}>
                        <strong>{option.label}:</strong> {option.description}
                      </div>
                    ))}
                  </Stack>
                </Stack>
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
          </Card>
        )}
      </div>

      {/* Account Info */}
      <Stack className="border-t border-theme-secondary pt-8">
        <h3 className="text-lg font-semibold text-theme-primary">
          {t('account_info')}
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <Card nivel={2} densidade="compacta">
            <h4 className="font-medium text-theme-primary mb-2">
              {t('account_status')}
            </h4>
            <Inline gap={2} className="flex-wrap">
              <span className="inline-flex px-2 py-1 text-xs bg-ok/10 text-ok rounded-full">
                {t('account_active')}
              </span>
              {user.emailVerified && (
                <span className="inline-flex px-2 py-1 text-xs bg-aviso/10 text-aviso rounded-full">
                  {t('account_email_verified')}
                </span>
              )}
              {loginMethod.hasSocialLogin && (
                <span className="inline-flex px-2 py-1 text-xs bg-ouro/10 text-ouro-texto rounded-full">
                  {t('account_social_login')}
                </span>
              )}
            </Inline>
          </Card>
        </div>
      </Stack>

      {/* Danger Zone */}
      <Stack className="border-t border-erro pt-8">
        <Inline gap={3}>
          <PiWarning className="w-5 h-5 text-erro" />
          <h3 className="text-lg font-semibold text-erro">
            {t('account_danger_zone')}
          </h3>
        </Inline>

        <Card
          nivel={2}
          densidade="compacta"
          className="border border-erro bg-erro/5"
        >
          <div className="flex flex-col md:flex-row items-center gap-4 justify-between mb-4">
            <Stack gap={1}>
              <h4 className="font-medium text-theme-primary">
                {t('account_delete_permanent')}
              </h4>
              <Text papel="rotulo" tom="suave" as="p">
                {t('account_delete_warning')}
              </Text>
            </Stack>

            <Button
              variant="delete"
              size="sm"
              onClick={handleOpenDeleteModal}
              leftIcon={<PiTrash />}
              className="truncate py-3 px-4"
            >
              {t('account_delete_button')}
            </Button>
          </div>
        </Card>
      </Stack>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteAccount}
        requirePassword={loginMethod.hasPassword}
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
