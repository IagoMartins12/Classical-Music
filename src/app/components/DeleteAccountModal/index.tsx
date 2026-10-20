'use client';
import { PERFIL } from '@/app/conteudo/textos/perfil';
import { useTextos } from '@/app/hooks/useTextos';
import { Button } from '@/app/components/ui/Button';

import { useState } from 'react';
import {
  PiBookBookmark,
  PiBookOpen,
  PiEnvelopeSimple,
  PiFileText,
  PiHeart,
  PiInfo,
  PiMusicNotes,
  PiPencilLine,
  PiSpinnerGap,
  PiTrash,
  PiUser,
  PiWarning,
} from 'react-icons/pi';
import { CascadeInfo } from '@/app/hooks/useAccountManagement';
import { Field } from '@/app/components/ui/Field';
import { iniciais } from '@/app/components/blog/site/pecas';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Recebe a senha atual quando `requirePassword` (a API a exige de quem tem senha). */
  onConfirm: (currentPassword?: string) => void;
  requirePassword?: boolean;
  onLoadCascadeInfo: () => void;
  isLoading: boolean;
  isCascadeLoading: boolean;
  cascadeInfo?: CascadeInfo | null | undefined;
  userName: string;
  userEmail: string;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  requirePassword = false,
  onLoadCascadeInfo,
  isLoading,
  isCascadeLoading,
  cascadeInfo,
  userName,
  userEmail,
}) => {
  const { t } = useTextos(PERFIL);
  const [confirmText, setConfirmText] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [currentStep, setCurrentStep] = useState<
    'warning' | 'cascade' | 'confirm'
  >('warning');

  const handleClose = () => {
    if (isLoading) return;
    setCurrentStep('warning');
    setConfirmText('');
    setCurrentPassword('');
    onClose();
  };

  const handleNextStep = () => {
    if (currentStep === 'warning') {
      setCurrentStep('cascade');
      onLoadCascadeInfo();
    } else if (currentStep === 'cascade') {
      setCurrentStep('confirm');
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'confirm') {
      setCurrentStep('cascade');
    } else if (currentStep === 'cascade') {
      setCurrentStep('warning');
    }
  };

  // A tela em inglês pede "delete"; antes só "deletar" era aceito.
  const typedConfirmation = ['deletar', 'delete'].includes(
    confirmText.trim().toLowerCase()
  );
  const canProceed =
    typedConfirmation && (!requirePassword || currentPassword.length > 0);

  const handleConfirm = () => {
    if (canProceed) {
      onConfirm(requirePassword ? currentPassword : undefined);
    }
  };

  const dataItems = [
    {
      icon: PiUser,
      label: t('delete_modal_composers'),
      count: cascadeInfo?.composersCount || 0,
      samples: cascadeInfo?.sampleComposers.slice(0, 3).map((c) => ({
        id: c.id,
        title: c.name,
        detail: c.epochName,
      })),
    },
    {
      icon: PiMusicNotes,
      label: t('delete_modal_works'),
      count: cascadeInfo?.worksCount || 0,
      samples: cascadeInfo?.sampleWorks.slice(0, 3).map((w) => ({
        id: w.id,
        title: w.title,
        detail: w.composer.name,
      })),
    },
    {
      icon: PiFileText,
      label: t('delete_modal_scores'),
      count: cascadeInfo?.scoresCount || 0,
    },
    {
      icon: PiPencilLine,
      label: t('delete_modal_annotations'),
      count: cascadeInfo?.annotationsCount || 0,
      samples: cascadeInfo?.sampleAnnotations.slice(0, 2).map((n) => ({
        id: n.id,
        title: n.title,
        detail: n.work.title,
      })),
    },
    {
      icon: PiHeart,
      label: t('delete_modal_favorites'),
      count: cascadeInfo?.favoritesCount || 0,
    },
    {
      icon: PiMusicNotes,
      label: t('delete_modal_instruments'),
      count: cascadeInfo?.instrumentsCount || 0,
    },
    {
      icon: PiBookOpen,
      label: t('delete_modal_learned_works'),
      count: cascadeInfo?.learnedWorksCount || 0,
    },
    {
      icon: PiBookBookmark,
      label: t('delete_modal_want_to_learn'),
      count: cascadeInfo?.wantToLearnCount || 0,
    },
  ];

  const steps = ['warning', 'cascade', 'confirm'] as const;
  const stepIndex = steps.indexOf(currentStep);
  // The texts carry their old list marks ("• ") and colons; the layout
  // draws its own.
  const plain = (key: string) =>
    t(key).replace(/^•\s*/, '').replace(/:\s*$/, '');
  const consequences = [
    'delete_modal_data_removed',
    'delete_modal_uploads_deleted',
    'delete_modal_annotations_lost',
    'delete_modal_history_erased',
    'delete_modal_goodbye_email',
    'delete_modal_irreversible',
  ];

  const footer = (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <span className="t-legenda tabular-nums">
        {t('delete_modal_step')} {stepIndex + 1} {t('delete_modal_of')} 3
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {currentStep === 'warning' ? (
          <Button
            variante="fantasma"
            onClick={handleClose}
            disabled={isLoading}
          >
            {t('delete_modal_cancel')}
          </Button>
        ) : (
          <Button
            variante="fantasma"
            onClick={handlePrevStep}
            disabled={isLoading}
          >
            {t('delete_modal_back')}
          </Button>
        )}
        {currentStep === 'confirm' ? (
          <Button
            variante="perigo"
            icone={PiTrash}
            onClick={handleConfirm}
            carregando={isLoading}
            disabled={!canProceed}
          >
            {isLoading
              ? t('delete_modal_deleting')
              : t('delete_modal_delete_permanently')}
          </Button>
        ) : (
          <Button
            variante="secundario"
            onClick={handleNextStep}
            disabled={isCascadeLoading}
          >
            {currentStep === 'warning'
              ? t('delete_modal_continue')
              : t('delete_modal_next')}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Sheet
      aberto={isOpen}
      aoFechar={() => {
        if (!isLoading) handleClose();
      }}
      titulo={t('delete_modal_title')}
      descricao={t('delete_modal_subtitle')}
      largura="m"
      rodape={footer}
    >
      <div className="flex flex-col gap-8">
        <div key={currentStep} className="entra flex flex-col gap-8">
          {currentStep === 'warning' && (
            <>
              <div className="flex flex-col gap-3">
                <h3 className="font-display text-[clamp(1.75rem,4vw,2.25rem)] leading-tight">
                  {t('delete_modal_sure')}
                </h3>
                <p className="t-corpo max-w-[60ch] text-texto-suave">
                  {t('delete_modal_warning')}
                </p>
              </div>

              {/* The account being closed, as it signs: initials, name, e-mail. */}
              <section
                aria-label={plain('delete_modal_account_info')}
                className="flex items-center gap-4 border-y border-linha py-4"
              >
                <span
                  aria-hidden="true"
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sup-2 font-display text-[1.25rem] text-ouro-texto"
                >
                  {iniciais(userName)}
                </span>
                <dl className="grid min-w-0 gap-0.5">
                  <dt className="sr-only">{plain('delete_modal_name')}</dt>
                  <dd className="truncate font-medium">{userName}</dd>
                  <dt className="sr-only">{plain('delete_modal_email')}</dt>
                  <dd className="t-rotulo break-all text-texto-suave">
                    {userEmail}
                  </dd>
                </dl>
              </section>

              <section className="flex flex-col gap-3">
                <h4 className="t-rotulo font-medium">
                  {plain('delete_modal_what_happens')}
                </h4>
                <ul className="flex flex-col">
                  {consequences.map((key, i) => (
                    <li
                      key={key}
                      className={cx(
                        'flex items-baseline gap-3 border-b border-linha py-2.5 text-[0.9375rem]',
                        i === consequences.length - 1 && 'border-b-0 text-texto'
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cx(
                          'h-1.5 w-1.5 shrink-0 translate-y-[-0.15em] rounded-full',
                          i === consequences.length - 1
                            ? 'bg-[var(--erro)]'
                            : 'bg-[var(--texto-fraco)]'
                        )}
                      />
                      <span
                        className={
                          i === consequences.length - 1
                            ? 'font-medium'
                            : 'text-texto-suave'
                        }
                      >
                        {plain(key)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {currentStep === 'cascade' && (
            <>
              <div className="flex flex-col gap-3">
                <h3 className="font-display text-[clamp(1.75rem,4vw,2.25rem)] leading-tight">
                  {t('delete_modal_data_summary')}
                </h3>
                <p className="t-corpo max-w-[60ch] text-texto-suave">
                  {t('delete_modal_data_description')}
                </p>
              </div>

              {isCascadeLoading ? (
                <div role="status" className="flex flex-col gap-3">
                  {[0, 1, 2, 3].map((n) => (
                    <span
                      key={n}
                      aria-hidden="true"
                      className="loading-skeleton block h-8 rounded-controle"
                    />
                  ))}
                  <span className="t-legenda inline-flex items-center gap-2">
                    <Icon
                      de={PiSpinnerGap}
                      tamanho="pp"
                      className="animate-spin"
                    />
                    {t('delete_modal_analyzing')}
                  </span>
                </div>
              ) : cascadeInfo ? (
                <>
                  {/* The inventory, set like a concert programme: name,
                      dotted leader, count; examples in italics beneath. */}
                  <section aria-label={plain('delete_modal_examples')}>
                    <ul className="flex flex-col">
                      {dataItems
                        .filter((item) => item.count > 0)
                        .map((item) => (
                          <li
                            key={item.label}
                            className="flex flex-col gap-1 py-2.5"
                          >
                            <div className="flex items-baseline gap-3">
                              <Icon
                                de={item.icon}
                                tamanho="pp"
                                className="translate-y-[0.1em] text-texto-fraco"
                              />
                              <span className="text-[0.9375rem]">
                                {item.label}
                              </span>
                              <span
                                aria-hidden="true"
                                className="min-w-6 flex-1 translate-y-[-0.25em] border-b border-dotted border-[var(--linha-forte)]"
                              />
                              <span className="t-dado tabular-nums">
                                {item.count}
                              </span>
                            </div>
                            {!!item.samples?.length && (
                              <p className="t-legenda pl-7 italic">
                                {item.samples.map((sample, i) => (
                                  <span key={sample.id}>
                                    {i > 0 && ' · '}
                                    {sample.title}
                                    {sample.detail && (
                                      <span className="text-texto-fraco">
                                        {' '}
                                        ({sample.detail})
                                      </span>
                                    )}
                                  </span>
                                ))}
                              </p>
                            )}
                          </li>
                        ))}
                    </ul>
                    <div className="mt-2 flex items-baseline justify-between gap-4 border-t-[3px] border-double border-[var(--linha-forte)] pt-3">
                      <span className="t-rotulo text-texto-suave">
                        {t('delete_modal_total_items')}
                      </span>
                      <span className="font-display text-[2rem] leading-none tabular-nums">
                        {cascadeInfo.totalItems}
                      </span>
                    </div>
                  </section>

                  <aside className="flex items-start gap-3 border-t border-linha pt-5">
                    <Icon
                      de={PiEnvelopeSimple}
                      tamanho="p"
                      className="mt-0.5 text-ouro-texto"
                    />
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">
                        {t('delete_modal_goodbye_email_info')}
                      </p>
                      <p className="t-rotulo text-texto-suave">
                        {t('delete_modal_goodbye_description')}
                      </p>
                    </div>
                  </aside>
                </>
              ) : (
                <p className="t-rotulo flex items-center gap-2 text-texto-suave">
                  <Icon de={PiInfo} tamanho="p" />
                  {t('delete_modal_error_loading')}
                </p>
              )}
            </>
          )}

          {currentStep === 'confirm' && (
            <>
              <div className="flex flex-col gap-3">
                <h3 className="font-display text-[clamp(1.75rem,4vw,2.25rem)] leading-tight">
                  {t('delete_modal_final_confirmation')}
                </h3>
                <p className="t-corpo max-w-[60ch] text-texto-suave">
                  {t('delete_modal_last_chance')}
                </p>
              </div>

              <section className="flex items-start gap-3 border-y border-linha py-4">
                <Icon
                  de={PiWarning}
                  tamanho="p"
                  className="mt-0.5 text-[var(--erro)]"
                />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">
                    {t('delete_modal_permanent_warning')}
                  </p>
                  <p className="t-rotulo text-texto-suave">
                    {t('delete_modal_immediate_removal')}
                  </p>
                  {cascadeInfo && (
                    <p className="t-rotulo text-texto-suave">
                      <strong className="font-medium tabular-nums text-texto">
                        {cascadeInfo.totalItems}
                      </strong>{' '}
                      {t('delete_modal_items_removed')}
                    </p>
                  )}
                </div>
              </section>

              <div className="flex flex-col gap-5">
                <Field
                  label={t('delete_modal_type_delete')}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={t('delete_modal_placeholder_delete')}
                  autoComplete="off"
                  spellCheck={false}
                  autoFocus
                  erro={
                    confirmText && !typedConfirmation
                      ? t('delete_modal_type_exactly')
                      : undefined
                  }
                />
                {requirePassword && (
                  <Field.Senha
                    label={t('delete_modal_current_password')}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    rotuloMostrar={t('password_show')}
                    rotuloOcultar={t('password_hide')}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Sheet>
  );
};

export default DeleteAccountModal;
