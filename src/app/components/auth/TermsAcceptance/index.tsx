// components/authModals/TermsAcceptance.tsx
'use client';

import React, { useState } from 'react';
import {
  PiCheckSquare,
  PiFileText,
  PiShield,
  PiSquare,
  PiWarningCircle,
} from 'react-icons/pi';
import { useTranslation } from '@/app/context/TranslationContext';
import Modal from '../../Modal';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface TermsAcceptanceProps {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
  error?: string;
  disabled?: boolean;
}

interface TermsContent {
  title: string;
  content: React.ReactNode;
  icon: React.ReactNode;
}

const TermsAcceptance: React.FC<TermsAcceptanceProps> = ({
  accepted,
  onChange,
  error,
  disabled = false,
}) => {
  const { t } = useTranslation({ sections: ['components/auth-modals'] });
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleCheckboxChange = () => {
    if (!disabled) {
      onChange(!accepted);
    }
  };

  const privacyContent: TermsContent = {
    title: t('privacy_policy_title'),
    icon: <PiShield className="w-5 h-5 text-ouro-texto" />,
    content: (
      <Text
        papel="rotulo"
        tom="suave"
        as="div"
        className="space-y-6 leading-relaxed"
      >
        <Stack gap={2} className="rounded-lg p-4">
          <h4 className="font-semibold flex items-center">
            <PiShield className="w-4 h-4 mr-2" />
            {t('privacy_policy_summary_title')}
          </h4>
          <p className="">{t('privacy_policy_summary_text')}</p>
        </Stack>

        <Stack gap={3}>
          <h4 className="font-semibold text-theme-primary">
            {t('privacy_policy_data_collection_title')}
          </h4>
          <ul className="space-y-2 ml-4">
            <li>{t('privacy_policy_data_registration')}</li>
            <li>{t('privacy_policy_data_usage')}</li>
            <li>{t('privacy_policy_data_technical')}</li>
          </ul>
        </Stack>

        <Stack gap={3}>
          <h4 className="font-semibold text-theme-primary">
            {t('privacy_policy_how_we_use_title')}
          </h4>
          <ul className="space-y-2 ml-4">
            <li>{t('privacy_policy_use_personalize')}</li>
            <li>{t('privacy_policy_use_security')}</li>
            <li>{t('privacy_policy_use_updates')}</li>
            <li>{t('privacy_policy_use_statistics')}</li>
          </ul>
        </Stack>

        <Stack gap={3}>
          <h4 className="font-semibold text-theme-primary">
            {t('privacy_policy_rights_title')}
          </h4>
          <div className="rounded-lg p-3">
            <ul className="space-y-1">
              <li>{t('privacy_policy_right_access')}</li>
              <li>{t('privacy_policy_right_correction')}</li>
              <li>{t('privacy_policy_right_deletion')}</li>
              <li>{t('privacy_policy_right_portability')}</li>
              <li>{t('privacy_policy_right_revocation')}</li>
            </ul>
          </div>
        </Stack>

        <Stack gap={3}>
          <h4 className="font-semibold text-theme-primary">
            {t('privacy_policy_security_title')}
          </h4>
          <ul className="space-y-2 ml-4">
            <li>{t('privacy_policy_security_encryption')}</li>
            <li>{t('privacy_policy_security_passwords')}</li>
            <li>{t('privacy_policy_security_backups')}</li>
            <li>{t('privacy_policy_security_monitoring')}</li>
          </ul>
        </Stack>

        <Stack gap={3}>
          <h4 className="font-semibold text-theme-primary">
            {t('privacy_policy_retention_title')}
          </h4>
          <ul className="space-y-2 ml-4">
            <li>{t('privacy_policy_retention_account')}</li>
            <li>{t('privacy_policy_retention_usage')}</li>
            <li>{t('privacy_policy_retention_cookies')}</li>
            <li>{t('privacy_policy_retention_annotations')}</li>
          </ul>
        </Stack>

        <Stack gap={2} className="rounded-lg p-4 bg-sup-2">
          <h4 className="font-semibold">{t('privacy_policy_contact_title')}</h4>
          <p className="">
            {t('privacy_policy_contact_text')}
            <br />
            <strong>{t('privacy_policy_contact_email')}</strong>
          </p>
        </Stack>
      </Text>
    ),
  };

  const termsContent: TermsContent = {
    title: t('terms_of_use_title'),
    icon: <PiFileText className="w-5 h-5 text-ouro-texto" />,
    content: (
      <Text
        papel="rotulo"
        tom="suave"
        as="div"
        className="space-y-6 leading-relaxed"
      >
        <Stack gap={2} className="bg-theme-elevated rounded-lg p-4">
          <h4 className="font-semibold flex items-center">
            <PiFileText className="w-4 h-4 mr-2" />
            {t('terms_of_use_summary_title')}
          </h4>
          <p className="">{t('terms_of_use_summary_text')}</p>
        </Stack>

        <Stack gap={3}>
          <h4 className="font-semibold text-theme-primary">
            {t('terms_of_use_permitted_title')}
          </h4>
          <ul className="space-y-2 ml-4">
            <li>{t('terms_of_use_permitted_explore')}</li>
            <li>{t('terms_of_use_permitted_notes')}</li>
            <li>{t('terms_of_use_permitted_community')}</li>
            <li>{t('terms_of_use_permitted_tools')}</li>
          </ul>
        </Stack>

        <Stack gap={3}>
          <h4 className="font-semibold text-theme-primary">
            {t('terms_of_use_prohibited_title')}
          </h4>
          <ul className="space-y-2 ml-4">
            <li>{t('terms_of_use_prohibited_commercial')}</li>
            <li>{t('terms_of_use_prohibited_spam')}</li>
            <li>{t('terms_of_use_prohibited_copyright')}</li>
            <li>{t('terms_of_use_prohibited_offensive')}</li>
          </ul>
        </Stack>

        <Stack gap={3}>
          <h4 className="font-semibold text-theme-primary">
            {t('terms_of_use_content_title')}
          </h4>
          <ul className="space-y-2 ml-4">
            <li>{t('terms_of_use_content_scores')}</li>
            <li>{t('terms_of_use_content_annotations')}</li>
            <li>{t('terms_of_use_content_uploads')}</li>
            <li>{t('terms_of_use_content_points')}</li>
          </ul>
        </Stack>

        <Stack gap={3}>
          <h4 className="font-semibold text-theme-primary">
            {t('terms_of_use_favorites_title')}
          </h4>
          <ul className="space-y-2 ml-4">
            <li>{t('terms_of_use_favorites_organize')}</li>
            <li>{t('terms_of_use_favorites_privacy')}</li>
            <li>{t('terms_of_use_favorites_educational')}</li>
          </ul>
        </Stack>

        <Stack gap={3}>
          <h4 className="font-semibold text-theme-primary">
            {t('terms_of_use_responsibilities_title')}
          </h4>
          <div className="rounded-lg p-3">
            <ul className="space-y-1">
              <li>{t('terms_of_use_responsibility_security')}</li>
              <li>{t('terms_of_use_responsibility_respect')}</li>
              <li>{t('terms_of_use_responsibility_moderation')}</li>
              <li>{t('terms_of_use_responsibility_collaboration')}</li>
            </ul>
          </div>
        </Stack>

        <Stack gap={3}>
          <h4 className="font-semibold text-theme-primary">
            {t('terms_of_use_suspension_title')}
          </h4>
          <ul className="space-y-2 ml-4">
            <li>{t('terms_of_use_suspension_violations')}</li>
            <li>{t('terms_of_use_suspension_user_choice')}</li>
            <li>{t('terms_of_use_suspension_annotations')}</li>
          </ul>
        </Stack>

        <Stack gap={2} className="rounded-lg p-4">
          <h4 className="font-semibold">
            {t('terms_of_use_limitations_title')}
          </h4>
          <p className="">{t('terms_of_use_limitations_text')}</p>
        </Stack>
      </Text>
    ),
  };

  return (
    <>
      <div className="space-y-3">
        <div
          className={`
            flex items-start space-x-3 p-4 rounded-lg  transition-all cursor-pointer
            ${accepted ? '' : ''}
            ${error ? '' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={handleCheckboxChange}
        >
          <div className="flex items-center">
            {accepted ? (
              <PiCheckSquare className="w-5 h-5" />
            ) : (
              <PiSquare className="w-5 h-5 text-theme-tertiary" />
            )}
          </div>

          <div className="flex-1 flex-nowrap min-w-0">
            <Text papel="rotulo" tom="suave" as="p">
              {t('terms_acceptance_text')}{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTermsModal(true);
                }}
                className="text-ouro-texto font-medium underline inline-flex items-center"
                disabled={disabled}
              >
                {t('terms_acceptance_terms_link')}
              </button>{' '}
              {t('terms_acceptance_and')}{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPrivacyModal(true);
                }}
                className="text-ouro-texto font-medium underline inline-flex items-center"
                disabled={disabled}
              >
                {t('terms_acceptance_privacy_link')}
              </button>{' '}
            </Text>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <Inline gap={2} className="text-red-500 text-sm">
            <PiWarningCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </Inline>
        )}
      </div>

      {/* Modal da Política de Privacidade */}
      <Modal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title={privacyContent.title}
        maxWidth="3xl"
        showCloseButton={true}
        setPr
      >
        <Inline gap={3} className="mb-6">
          {privacyContent.icon}
          <div>
            <h3 className="text-lg font-semibold text-theme-primary">
              {t('privacy_policy_subtitle')}
            </h3>
            <Text papel="rotulo" tom="fraco" as="p">
              {t('privacy_policy_last_update')}
            </Text>
          </div>
        </Inline>
        {privacyContent.content}
      </Modal>

      {/* Modal dos Termos de Uso */}
      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title={termsContent.title}
        maxWidth="3xl"
        showCloseButton={true}
        setPr
      >
        <Inline gap={3} className="mb-6">
          {termsContent.icon}
          <div>
            <h3 className="text-lg font-semibold text-theme-primary">
              {t('terms_of_use_subtitle')}
            </h3>
            <Text papel="rotulo" tom="fraco" as="p">
              {t('terms_of_use_last_update')}
            </Text>
          </div>
        </Inline>
        {termsContent.content}
      </Modal>
    </>
  );
};

export default TermsAcceptance;
