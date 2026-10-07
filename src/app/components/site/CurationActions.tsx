'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { PiPencilSimple, PiSealCheck } from 'react-icons/pi';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import Link from '@/app/components/LocalizedLink';
import { COMMON } from '@/app/conteudo/site/common';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useSession } from '@/app/libs/session';
import { canEditCatalog, canVerifyCatalog } from '@/app/utils/permissions';

const VerificationModal = dynamic(
  () => import('@/app/components/Verification/VerificationModal')
);

/**
 * Edit and verify, for curators only. Decided in the browser on purpose:
 * reading the session on the server would make the page dynamic and switch
 * its cache off for every visitor.
 */
export function CurationActions({
  type,
  id,
  name,
  verified,
}: {
  type: 'composer' | 'work';
  id: string;
  name: string;
  verified: boolean;
}) {
  const copy = COMMON[useRouteLanguage().language].curation;
  const { data: session } = useSession();
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(verified);
  const canEdit = canEditCatalog(session?.user);
  const canVerify = canVerifyCatalog(session?.user);
  if (!canEdit && !canVerify) return null;
  return (
    <>
      {canEdit && (
        <Link
          href={`/upload/${type}/${id}/edit`}
          className={classesDeBotao('fantasma')}
        >
          <Icon de={PiPencilSimple} /> {copy.edit}
        </Link>
      )}
      {canVerify && (
        <Button
          variante="fantasma"
          icone={PiSealCheck}
          onClick={() => setVerifying(true)}
        >
          {copy.verify}
        </Button>
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
    </>
  );
}
