'use client';

import { useState } from 'react';
import { PiFlag } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { CONTRIBUTE } from '@/app/conteudo/site/contribute';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useSignInGate } from '@/app/hooks/useSignInGate';
import type { Contribution } from '@/app/requests/contributions';
import { ReportSheet } from '../ReportButton';

/**
 * "Revisto por Fulana", under what someone contributed, with a way to
 * report it: contributions go live at once, so the report is the review.
 */
export function ContributionCredit({
  contribution,
  name,
}: {
  contribution: Contribution;
  /** What the report sheet calls it ("a biografia de Chopin"). */
  name: string;
}) {
  const copy = CONTRIBUTE[useRouteLanguage().language];
  const allowed = useSignInGate();
  const [reporting, setReporting] = useState(false);
  return (
    <div className="t-legenda flex items-center gap-1">
      {copy.credit(contribution.author.name)}
      <Button
        tamanho="p"
        variante="fantasma"
        icone={PiFlag}
        rotulo={copy.reportContribution}
        onClick={() => allowed('report') && setReporting(true)}
      />
      <ReportSheet
        entityType="contribution"
        entityId={contribution.id}
        name={name}
        open={reporting}
        onClose={() => setReporting(false)}
      />
    </div>
  );
}
