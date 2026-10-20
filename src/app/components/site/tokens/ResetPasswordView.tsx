'use client';

import { useParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { PiEye, PiEyeSlash, PiLockKey, PiWarningCircle } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { TOKENS } from '@/app/conteudo/site/tokens';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { legacyAuth } from '@/app/libs/api/compat';
import { useLoginModal } from '@/app/stores/authStore';
import { failureCode } from './TokenActionPage';
import { TokenFrame } from './TokenFrame';

/** Same floor as the API's DTO. */
const MIN_LENGTH = 8;

/**
 * The reset link opens a form, not an action: the token is only spent when
 * the new password is saved, so a wrong link shows up on submit.
 */
export function ResetPasswordView() {
  const copy = TOKENS[useRouteLanguage().language];
  const t = copy.reset;
  const token = String(useParams()?.token ?? '');
  const { open: openLogin } = useLoginModal();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [outcome, setOutcome] = useState<'form' | 'done' | string>(
    token ? 'form' : 'NO_TOKEN'
  );

  const missing = Math.max(0, MIN_LENGTH - password.length);
  const shortError = touched && missing > 0 ? t.short(missing) : undefined;
  const mismatch =
    touched && confirm && confirm !== password ? t.mismatch : undefined;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (missing > 0 || confirm !== password) return;
    setSaving(true);
    const result = await legacyAuth
      .resetPassword({ token, password, confirmPassword: confirm })
      .catch(() => ({ success: false, errorCode: 'CONNECTION_ERROR' }));
    setSaving(false);
    setOutcome(result.success ? 'done' : failureCode(result));
  };

  if (outcome === 'done') {
    return (
      <TokenFrame icon={PiLockKey} title={t.success} text={t.successText} done>
        <Button variante="primario" onClick={openLogin}>
          {t.signIn}
        </Button>
      </TokenFrame>
    );
  }

  if (outcome !== 'form') {
    const [title, text] = copy.errors[outcome] ?? copy.errors.INVALID_TOKEN;
    const retry = outcome === 'CONNECTION_ERROR' || outcome === 'RATE_LIMITED';
    return (
      <TokenFrame icon={PiWarningCircle} title={title} text={text}>
        {retry ? (
          <Button variante="primario" onClick={() => setOutcome('form')}>
            {copy.retry}
          </Button>
        ) : (
          <Button variante="primario" onClick={openLogin}>
            {t.requestNew}
          </Button>
        )}
        <Link href="/" className={classesDeBotao()}>
          {copy.home}
        </Link>
      </TokenFrame>
    );
  }

  const toggle = (
    <button
      type="button"
      onClick={() => setVisible((v) => !v)}
      aria-pressed={visible}
      className="t-rotulo inline-flex items-center gap-1.5 self-end text-texto-suave hover:text-texto"
    >
      {visible ? (
        <PiEyeSlash aria-hidden="true" />
      ) : (
        <PiEye aria-hidden="true" />
      )}
      {visible ? t.hide : t.show}
    </button>
  );

  return (
    <TokenFrame icon={PiLockKey} title={t.title} text={t.rule}>
      <form
        onSubmit={submit}
        noValidate
        className="flex w-full max-w-sm flex-col gap-4 text-left"
      >
        <Field
          label={t.password}
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          required
          minLength={MIN_LENGTH}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          erro={shortError}
        />
        <Field
          label={t.confirm}
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          erro={mismatch}
        />
        {toggle}
        <Button
          type="submit"
          variante="primario"
          carregando={saving}
          className="w-full"
        >
          {t.save}
        </Button>
      </form>
    </TokenFrame>
  );
}
