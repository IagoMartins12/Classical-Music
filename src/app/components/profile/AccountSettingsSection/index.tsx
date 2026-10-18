// app/profile/components/AccountSettingsSection.tsx - VERSÃO COM VERIFICAÇÃO DE LOGIN SOCIAL
'use client';

import { Field } from '@/app/components/ui/Field';
import { PERFIL } from '@/app/conteudo/textos/perfil';
import { useTextos } from '@/app/hooks/useTextos';
import React, { useState, useEffect } from 'react';
// Era `User` do NextAuth, aumentado em `types/next-auth.d.ts`. É o mesmo
// objeto que `useAuth()` entrega, e ele já tem tipo próprio no store.
import type { User } from '@/app/hooks/userStore';
import { FcGoogle } from 'react-icons/fc';
import {
  PiCheck,
  PiFloppyDisk,
  PiInfo,
  PiLock,
  PiShield,
  PiTrash,
  PiUser,
  PiX,
} from 'react-icons/pi';

import { toast } from 'react-hot-toast';
import { Button } from '@/app/components/ui/Button';
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
import { AssinaturaEDados } from './AssinaturaEDados';
import EmailVerificationBanner2 from '../../EmailVerification/EmailVerificationBanner2';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';
import { porIdioma } from '@/app/utils/porIdioma';
import { useTx } from '@/app/hooks/useTx';

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
  const tx = useTx();
  const { t, language } = useTextos(PERFIL);
  const {
    isUserTypeChanging,
    isDeleting,
    isCascadeLoading,
    cascadeInfo,
    changeAccountType,
    loadCascadeInfo,
    deleteAccount,
    clearCascadeInfo,
    getUserTypeLabel,
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

  const handlePasswordChange = async () => {
    // Validações básicas
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error(tx('Preencha todos os campos', 'Fill in every field'));
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(
        porIdioma('As senhas não coincidem', 'Passwords do not match')
      );
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error(
        passwordValidation.error ||
          porIdioma('Senha inválida', 'Invalid password')
      );
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error(
        tx(
          'A nova senha deve ser diferente da atual',
          'The new password must differ from the current one'
        )
      );
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
      toast.error(
        tx(
          'Erro ao alterar senha. Tente novamente.',
          'Could not change the password. Try again.'
        )
      );
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleUserTypeChange = async () => {
    if (newUserType === user.userType) {
      toast.error(
        porIdioma(
          'Este já é o seu tipo de conta',
          'This is already your account type'
        )
      );
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
          <div className="h-4 bg-sup-2 rounded w-32"></div>
          <div className="h-3 bg-sup-2 rounded w-48"></div>
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
          <p className="font-medium text-texto">{getLoginTypeLabel()}</p>
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
          <h3 className="font-display text-[1.5rem] leading-tight text-texto">
            {t('account_auth_method')}
          </h3>

          <Card nivel={2} densidade="compacta">
            {renderLoginMethodInfo()}
          </Card>
        </Stack>
      )}

      {/* Email Section */}
      <Stack className="border-t border-linha pt-8">
        <h3 className="font-display text-[1.5rem] leading-tight text-texto">
          {t('account_login_info')}
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <Field
            label={t('account_email')}
            value={user.email || ''}
            disabled
            className="min-w-0 flex-1"
          />
          {user.emailVerified && (
            <span className="inline-flex items-center gap-1.5 self-end pb-3 text-sm text-ouro-texto">
              <PiCheck aria-hidden="true" className="h-4 w-4" />
              {t('account_verified')}
            </span>
          )}
        </div>
      </Stack>

      {/* Password Section */}
      <div className="border-t border-linha pt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-[1.5rem] leading-tight text-texto">
            {loginMethod.hasPassword
              ? t('account_change_password')
              : t('account_define_password')}
          </h3>

          {!isChangingPassword && (
            <Button
              variante="secundario"
              tamanho="p"
              onClick={() => setIsChangingPassword(true)}
              icone={PiLock}
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
            <div className="rounded-lg p-4 mb-4 bg-sup-2">
              <div className="flex items-start">
                <PiShield className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">
                    {t('account_social_only')}
                  </h4>
                  <p className="text-sm opacity-90">
                    {t('account_social_only_description', {
                      providers: loginMethod.socialProviders.join(' e '),
                    })}
                  </p>
                  <div className="mt-3 text-xs opacity-80">
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
            <div className="rounded-lg p-4 mb-4 bg-sup-2">
              <div className="flex items-start">
                <PiInfo className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <Stack gap={1}>
                  <h4 className="font-medium">
                    {t('account_improve_security')}
                  </h4>
                  <p className="text-sm opacity-90">
                    {t('account_define_password_description')}
                  </p>
                </Stack>
              </div>
            </div>
          )}

        {isChangingPassword && (
          <Card nivel={2} densidade="compacta" className="gap-4 flex flex-col">
            {/* Mostrar campo de senha atual apenas se o usuário já tem senha */}
            {loginMethod.hasPassword && (
              <Field.Senha
                label={t('account_current_password_required')}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder={tx(
                  'Digite sua senha atual',
                  'Enter your current password'
                )}
                rotuloMostrar={t('password_show')}
                rotuloOcultar={t('password_hide')}
              />
            )}

            <div>
              <Field.Senha
                label={
                  loginMethod.hasPassword
                    ? t('account_new_password_required')
                    : t('account_password_required')
                }
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                placeholder={
                  loginMethod.hasPassword
                    ? t('account_new_password_placeholder')
                    : t('account_password_placeholder')
                }
                erro={!isPasswordValid ? passwordValidation.error : undefined}
                rotuloMostrar={t('password_show')}
                rotuloOcultar={t('password_hide')}
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

            <Field.Senha
              label={
                loginMethod.hasPassword
                  ? t('account_confirm_new_password_required')
                  : t('account_confirm_password_required')
              }
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder={
                loginMethod.hasPassword
                  ? t('account_confirm_new_password_placeholder')
                  : t('account_confirm_password_placeholder')
              }
              erro={
                passwordData.confirmPassword &&
                passwordData.newPassword !== passwordData.confirmPassword
                  ? language === 'en'
                    ? 'Passwords do not match'
                    : 'As senhas não coincidem'
                  : undefined
              }
              rotuloMostrar={t('password_show')}
              rotuloOcultar={t('password_hide')}
            />

            <div className="flex justify-end gap-2">
              <Button
                variante="fantasma"
                tamanho="p"
                icone={PiX}
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
              <Button
                variante="primario"
                tamanho="p"
                icone={PiFloppyDisk}
                onClick={handlePasswordChange}
                carregando={isPasswordLoading}
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
            </div>
          </Card>
        )}
      </div>

      {/* Account Type Section */}
      <div className="border-t border-linha pt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-[1.5rem] leading-tight text-texto">
            {t('account_type')}
          </h3>

          {!isChangingUserType && (
            <Button
              variante="secundario"
              tamanho="p"
              onClick={() => setIsChangingUserType(true)}
              icone={PiUser}
            >
              {t('account_change_type')}
            </Button>
          )}
        </div>

        {!isChangingUserType ? (
          <Card nivel={2} densidade="compacta">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-texto">
                  {getUserTypeLabel(user.userType)}
                </p>
                <Text papel="rotulo" tom="suave" as="p">
                  {t('account_type_description')}
                </Text>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                <PiUser className="w-6 h-6 text-texto" />
              </div>
            </div>
          </Card>
        ) : (
          <Card nivel={2} densidade="compacta" className="gap-4 flex flex-col">
            <div className="rounded-lg p-4 bg-sup-2">
              <div className="flex items-start">
                <PiInfo className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <Stack gap={2}>
                  <h4 className="font-medium">{t('account_choose_type')}</h4>
                  <Stack gap={2} className="text-sm opacity-90">
                    {USER_TYPE_OPTIONS.map((option) => (
                      <div key={option.value}>
                        <strong>{option.label}:</strong> {option.description}
                      </div>
                    ))}
                  </Stack>
                </Stack>
              </div>
            </div>

            <Field.Selecao
              label={t('account_new_account_type')}
              value={newUserType}
              onChange={(e) => {
                setNewUserType(e.target.value as UserTypeValueOptions);
              }}
            >
              {USER_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Field.Selecao>

            <div className="flex justify-end gap-2">
              <Button
                variante="fantasma"
                tamanho="p"
                icone={PiX}
                onClick={() => {
                  setIsChangingUserType(false);
                  setNewUserType(user.userType || 'CASUAL_USER');
                }}
              >
                {t('personal_info_cancel')}
              </Button>
              <Button
                variante="primario"
                tamanho="p"
                icone={PiFloppyDisk}
                onClick={handleUserTypeChange}
                carregando={isUserTypeChanging}
                disabled={newUserType === user.userType}
              >
                {t('account_change_type')}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Account Info */}
      <Stack className="border-t border-linha pt-8">
        <h3 className="font-display text-[1.5rem] leading-tight text-texto">
          {t('account_info')}
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <Card nivel={2} densidade="compacta">
            <h4 className="font-medium text-texto mb-2">
              {t('account_status')}
            </h4>
            <Inline gap={2} className="flex-wrap">
              <span className="inline-flex rounded-full tint-ouro px-3 py-1 text-xs text-ouro-na-tinta">
                {t('account_active')}
              </span>
              {user.emailVerified && (
                <span className="inline-flex rounded-full tint-ouro px-3 py-1 text-xs text-ouro-na-tinta">
                  {t('account_email_verified')}
                </span>
              )}
              {loginMethod.hasSocialLogin && (
                <span className="inline-flex rounded-full tint-ouro px-3 py-1 text-xs text-ouro-na-tinta">
                  {t('account_social_login')}
                </span>
              )}
            </Inline>
          </Card>
        </div>
      </Stack>

      {/* Assinatura (cancelar, portal da Stripe) e exportação dos dados. */}
      <AssinaturaEDados />

      {/* Danger Zone: a quiet row, the red kept for the button. */}
      <section className="flex flex-col gap-4 border-t border-linha pt-8">
        <h3 className="font-display text-[1.5rem] leading-tight text-texto">
          {t('account_danger_zone')}
        </h3>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex max-w-[52ch] flex-col gap-1">
            <h4 className="font-medium text-texto">
              {t('account_delete_permanent')}
            </h4>
            <Text papel="rotulo" tom="suave" as="p">
              {t('account_delete_warning')}
            </Text>
          </div>
          <Button
            variante="perigo"
            tamanho="p"
            onClick={handleOpenDeleteModal}
            icone={PiTrash}
            className="shrink-0 self-start sm:self-auto"
          >
            {t('account_delete_button')}
          </Button>
        </div>
      </section>

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
        userName={
          user.firstName ||
          user.name ||
          (language === 'en' ? 'User' : 'Usuário')
        }
        userEmail={user.email || ''}
      />
    </div>
  );
};

export default AccountSettingsSection;
