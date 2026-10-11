'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import {
  PiDotsThreeOutline,
  PiFlag,
  PiHandHeart,
  PiPencilSimple,
  PiSealCheck,
} from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { COMMON } from '@/app/conteudo/site/common';
import { CONTRIBUTE } from '@/app/conteudo/site/contribute';
import { useDismiss } from '@/app/hooks/useDismiss';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useSignInGate } from '@/app/hooks/useSignInGate';
import { useSession } from '@/app/libs/session';
import { canEditCatalog, canVerifyCatalog } from '@/app/utils/permissions';
import { ReportSheet } from './ReportButton';
import type { ContributionTarget } from './contribute/ContributeSheet';

const VerificationModal = dynamic(
  () => import('@/app/components/Verification/VerificationModal')
);
const ContributeSheet = dynamic(() =>
  import('./contribute/ContributeSheet').then((m) => m.ContributeSheet)
);

const item =
  'flex min-h-10 w-full items-center gap-3 rounded-controle px-3 text-left text-[0.9375rem] text-texto-suave hover:bg-sup-2 hover:text-texto';

/**
 * The secondary actions of a composer or work page in one "More" menu:
 * contribute and report for everyone, edit and verify for curators. Curation is decided in
 * the browser on purpose: reading the session on the server would make the
 * page dynamic and switch its cache off for every visitor.
 */
export function MoreActions({
  type,
  id,
  name,
  verified,
  current,
}: {
  type: 'composer' | 'work';
  id: string;
  name: string;
  verified: boolean;
  /** Current values of the fields people can contribute to. */
  current: ContributionTarget['current'];
}) {
  const { language } = useRouteLanguage();
  const common = COMMON[language];
  const { data: session } = useSession();
  const allowed = useSignInGate();
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [contributing, setContributing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(verified);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss<HTMLDivElement>(open, close);
  const canEdit = canEditCatalog(session?.user);
  const canVerify = canVerifyCatalog(session?.user);

  return (
    <div ref={ref} className="relative">
      <Button
        icone={PiDotsThreeOutline}
        rotulo={common.more}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      />
      {open && (
        <div
          role="menu"
          className="popover-open sup-alta absolute right-0 top-full z-menu mt-2 flex w-56 flex-col gap-1 !rounded-card p-2"
        >
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              close();
              if (allowed('contribute')) setContributing(true);
            }}
          >
            <Icon de={PiHandHeart} /> {CONTRIBUTE[language].action}
          </button>
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              close();
              if (allowed('report')) setReporting(true);
            }}
          >
            <Icon de={PiFlag} /> {common.report.action}
          </button>
          {canEdit && (
            <Link
              role="menuitem"
              href={`/upload/${type}/${id}/edit`}
              onClick={close}
              className={item}
            >
              <Icon de={PiPencilSimple} /> {common.curation.edit}
            </Link>
          )}
          {canVerify && (
            <button
              type="button"
              role="menuitem"
              className={item}
              onClick={() => {
                close();
                setVerifying(true);
              }}
            >
              <Icon de={PiSealCheck} /> {common.curation.verify}
            </button>
          )}
        </div>
      )}
      <ReportSheet
        entityType={type}
        entityId={id}
        name={name}
        open={reporting}
        onClose={() => setReporting(false)}
      />
      {contributing && (
        <ContributeSheet
          open
          onClose={() => setContributing(false)}
          target={{ type, id, name, current }}
        />
      )}
      {verifying && (
        <VerificationModal
          isOpen
          onClose={() => setVerifying(false)}
          currentItem={type}
          itemId={id}
          composerName={name}
          currentVerificationStatus={isVerified}
          onVerificationChange={setIsVerified}
        />
      )}
    </div>
  );
}
