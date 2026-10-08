'use client';

import {
  PiChalkboardTeacher,
  PiEnvelopeOpen,
  PiEnvelopeSimple,
  PiStudent,
  PiUserCheck,
} from 'react-icons/pi';
import { signOut } from '@/app/libs/session';
import Link from '@/app/components/LocalizedLink';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { TOKENS } from '@/app/conteudo/site/tokens';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { legacyAuth } from '@/app/libs/api/compat';
import { useLoginModal, useOnboardingModal } from '@/app/stores/authStore';
import { TokenActionPage, type TokenResult } from './TokenActionPage';

const useCopy = () => TOKENS[useRouteLanguage().language];
const teacherOf = (r: TokenResult) =>
  (r.teacher as { name?: string } | undefined)?.name ?? '';

export function ConfirmAccountView() {
  const copy = useCopy();
  const { open: openOnboarding } = useOnboardingModal();
  const { open: openLogin } = useLoginModal();
  return (
    <TokenActionPage
      icon={PiUserCheck}
      loading={copy.account.loading}
      run={legacyAuth.confirmAccount}
      resend={legacyAuth.resendAccountConfirmation}
      success={(r) => {
        const user = r.user as
          | { firstName?: string; onboardingCompleted?: boolean }
          | undefined;
        const action = !user ? (
          <Button variante="primario" onClick={openLogin}>
            {copy.account.signIn}
          </Button>
        ) : !user.onboardingCompleted ? (
          <Button variante="primario" onClick={openOnboarding}>
            {copy.account.welcome}
          </Button>
        ) : (
          <Link href="/learning" className={classesDeBotao('primario')}>
            {copy.studies}
          </Link>
        );
        return {
          title: r.alreadyConfirmed
            ? copy.account.already
            : copy.account.success,
          text: r.alreadyConfirmed
            ? copy.account.alreadyText
            : copy.account.successText(user?.firstName ?? ''),
          actions: (
            <>
              {action}
              <Link href="/" className={classesDeBotao()}>
                {copy.home}
              </Link>
            </>
          ),
        };
      }}
    />
  );
}

export function ConfirmEmailChangeView() {
  const copy = useCopy();
  const { open: openLogin } = useLoginModal();
  return (
    <TokenActionPage
      icon={PiEnvelopeOpen}
      loading={copy.emailChange.loading}
      run={async (token) => {
        const result = await legacyAuth.confirmEmailChange(token);
        // The API ends every session when the address changes.
        if (result.success)
          await signOut({ redirect: false }).catch(() => undefined);
        return result;
      }}
      success={() => ({
        title: copy.emailChange.success,
        text: copy.emailChange.successText,
        actions: (
          <Button variante="primario" onClick={openLogin}>
            {copy.emailChange.signIn}
          </Button>
        ),
      })}
    />
  );
}

export function AcceptStudentInviteView() {
  const copy = useCopy();
  return (
    <TokenActionPage
      icon={PiStudent}
      loading={copy.studentInvite.loading}
      run={legacyAuth.acceptStudentInvite}
      success={(r) => ({
        title: copy.studentInvite.success(teacherOf(r)),
        text: copy.studentInvite.successText,
        actions: (
          <Link href="/student" className={classesDeBotao('primario')}>
            {copy.studentInvite.portal}
          </Link>
        ),
      })}
    />
  );
}

export function DeclineStudentInviteView() {
  const copy = useCopy();
  return (
    <TokenActionPage
      icon={PiEnvelopeSimple}
      loading={copy.studentDecline.loading}
      run={legacyAuth.declineStudentInvite}
      success={(r) => ({
        title: copy.studentDecline.success,
        text: copy.studentDecline.successText(teacherOf(r)),
        actions: (
          <Link href="/" className={classesDeBotao()}>
            {copy.home}
          </Link>
        ),
      })}
    />
  );
}

export function AcceptTeacherInviteView() {
  const copy = useCopy();
  return (
    <TokenActionPage
      icon={PiChalkboardTeacher}
      loading={copy.teacherInvite.loading}
      run={legacyAuth.acceptTeacherInvite}
      resend={legacyAuth.resendTeacherInvite}
      success={() => ({
        title: copy.teacherInvite.success,
        text: copy.teacherInvite.successText,
        actions: (
          <Link href="/teacher" className={classesDeBotao('primario')}>
            {copy.teacherInvite.portal}
          </Link>
        ),
      })}
    />
  );
}

export function DeclineTeacherInviteView() {
  const copy = useCopy();
  return (
    <TokenActionPage
      icon={PiEnvelopeSimple}
      loading={copy.teacherDecline.loading}
      run={legacyAuth.declineTeacherInvite}
      success={() => ({
        title: copy.teacherDecline.success,
        text: copy.teacherDecline.successText,
        actions: (
          <Link href="/" className={classesDeBotao()}>
            {copy.home}
          </Link>
        ),
      })}
    />
  );
}
