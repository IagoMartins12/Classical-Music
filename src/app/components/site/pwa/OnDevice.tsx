'use client';

import { useSaidas } from '@/app/components/ui/useSaida';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  PiArrowSquareOut,
  PiDeviceMobile,
  PiFilePdf,
  PiTrash,
} from 'react-icons/pi';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { PWA } from '@/app/conteudo/site/pwa';
import { useOnline } from '@/app/hooks/useOnline';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import {
  aoMudarPartituras,
  enderecoOffline,
  listarPartituras,
  removerPartitura,
  type PartituraGuardada,
} from '@/app/libs/pwa/partituras';
import { ABRIR_PASSOS } from './InstallInvite';

const tamanho = (bytes: number, language: 'pt' | 'en') => {
  const fmt = new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    maximumFractionDigits: 1,
  });
  if (bytes >= 1024 ** 3) return `${fmt.format(bytes / 1024 ** 3)} GB`;
  if (bytes >= 1024 ** 2) return `${fmt.format(bytes / 1024 ** 2)} MB`;
  return `${fmt.format(Math.max(1, bytes / 1024))} KB`;
};

/**
 * "No aparelho": offline, it says the page is not saved here and shows what
 * is; online, it is the list of scores kept on the device, with how much
 * room the site is using.
 */
export function OnDevice() {
  const { language } = useRouteLanguage();
  const copy = PWA[language].aparelho;
  const online = useOnline();
  const [lista, setLista] = useState<PartituraGuardada[]>([]);
  const [uso, setUso] = useState<{ usado: number; total: number } | null>(null);
  const leaving = useSaidas();
  const remover = async (url: string) => {
    await leaving.sair(url);
    await removerPartitura(url).catch(() => leaving.voltar(url));
  };

  useEffect(() => {
    const atualizar = () => {
      setLista(listarPartituras());
      navigator.storage
        ?.estimate?.()
        .then((e) =>
          e.usage !== undefined && e.quota
            ? setUso({ usado: e.usage, total: e.quota })
            : null
        )
        .catch(() => undefined);
    };
    atualizar();
    return aoMudarPartituras(atualizar);
  }, []);

  return (
    <div className="section-wrap flex flex-col gap-10 py-12 md:py-16">
      <header className="flex max-w-[60ch] flex-col gap-4">
        <h1 className="classical-title text-[2.375rem] leading-[1.06] text-texto sm:text-5xl">
          {online ? copy.titulo : copy.tituloOffline}
        </h1>
        <p className="text-lg leading-relaxed text-texto-suave">
          {online ? copy.texto : copy.textoOffline}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className={classesDeBotao()}>
            {copy.voltar}
          </Link>
          <Button
            icone={PiDeviceMobile}
            variante="fantasma"
            onClick={() => window.dispatchEvent(new Event(ABRIR_PASSOS))}
          >
            {copy.instalar}
          </Button>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        {uso && (
          <p className="t-legenda">
            {copy.ocupado(
              tamanho(uso.usado, language),
              tamanho(uso.total, language)
            )}
          </p>
        )}
        {lista.length === 0 ? (
          <p className="rounded-card bg-sup-2 px-5 py-6 text-texto-suave">
            {copy.vazio}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-[var(--linha)]">
            {lista.map((p) => (
              <li
                key={p.url}
                ref={leaving.refDe(p.url)}
                className="flex items-center gap-4 py-4"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-controle bg-sup-2">
                  <Icon
                    de={PiFilePdf}
                    tamanho="m"
                    className="text-ouro-texto"
                  />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-display text-[1.25rem] leading-snug text-texto">
                    {p.obra ?? p.titulo}
                  </span>
                  <span className="t-rotulo truncate text-texto-suave">
                    {[p.compositor, p.titulo, tamanho(p.bytes, language)]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                <a
                  href={enderecoOffline(p.url)}
                  target="_blank"
                  rel="noopener"
                  className={classesDeBotao('secundario', 'p')}
                >
                  <Icon de={PiArrowSquareOut} tamanho="p" /> {copy.abrir}
                </a>
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={PiTrash}
                  rotulo={`${copy.remover} ${p.titulo}`}
                  onClick={() => void remover(p.url)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
