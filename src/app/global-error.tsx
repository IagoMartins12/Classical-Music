'use client';

import './globals.css';
import { useEffect, useState } from 'react';
import { classesDeBotao } from '@/app/components/ui/Button';
import { STATUS } from '@/app/conteudo/site/status';

/**
 * The last net: a failure in the root layout itself, where no shell, provider
 * or `error.tsx` is left. Without this file Next shows its own page. It brings
 * its own `<html>`, so it uses plain tags and a full reload: nothing of the
 * app can be trusted to be standing.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const [language, setLanguage] = useState<'pt' | 'en'>('pt');
  useEffect(() => {
    console.error('Application error:', error);
    if (/^\/en(\/|$)/.test(window.location.pathname)) setLanguage('en');
  }, [error]);
  const copy = STATUS[language];
  const t = copy.error;

  return (
    <html lang={language === 'en' ? 'en-US' : 'pt-BR'}>
      <body className="antialiased">
        <main className="section-wrap flex min-h-dvh flex-col items-center justify-center gap-6 py-12 text-center">
          <p className="flex items-baseline gap-3 font-display leading-none text-ouro-texto">
            <span className="text-[clamp(2rem,4vw,3rem)] italic">
              {copy.op}
            </span>
            <span className="text-[clamp(6rem,15vw,10.5rem)] tabular-nums tracking-[-0.03em]">
              500
            </span>
          </p>
          <p className="font-display text-[1.125rem] italic text-texto-suave">
            {t.name}
          </p>
          <h1 className="max-w-[18ch] text-balance font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.05]">
            {t.title}
          </h1>
          <p className="t-corpo max-w-[52ch] text-texto-suave">{t.text}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={classesDeBotao('primario')}
            >
              {t.retry}
            </button>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className={classesDeBotao()}
            >
              {t.home}
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
