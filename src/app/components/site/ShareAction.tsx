'use client';

import { PiShareNetwork } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { useShare } from '@/app/components/ui/ShareSheet';
import { COMMON } from '@/app/conteudo/site/common';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { Portrait } from './Portrait';

/** "Compartilhar" for detail pages; the URL is the canonical one. */
export function ShareAction({
  title,
  url,
  image,
  imageName,
  className,
}: {
  title: string;
  url: string;
  image?: string | null;
  imageName: string;
  className?: string;
}) {
  const copy = COMMON[useRouteLanguage().language].share;
  const { share, sheet } = useShare({
    title,
    url,
    copy,
    thumbnail: (
      <Portrait
        name={imageName}
        src={image}
        sizes="480px"
        decorative
        className="aspect-[1.91/1] w-full"
      />
    ),
  });
  return (
    <>
      <Button icone={PiShareNetwork} onClick={share} className={className}>
        {copy.action}
      </Button>
      {sheet}
    </>
  );
}
