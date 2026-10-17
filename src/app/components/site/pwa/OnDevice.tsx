'use client';

import { useSaidas } from '@/app/components/ui/useSaida';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  PiArrowSquareOut,
  PiCheck,
  PiDeviceMobile,
  PiMinus,
  PiFilePdf,
  PiTrash,
  PiQuestion,
} from 'react-icons/pi';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
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
import { AppGravado } from './AppGravado';
import { ABRIR_PASSOS } from './eventos';

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

  const a = copy.apresentacao;
  const instalar = () => window.dispatchEvent(new Event(ABRIR_PASSOS));

  return (
    <div className="section-wrap flex flex-col gap-16 py-12 md:gap-20 md:py-16">
      {online ? (
        <header className="grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div className="flex flex-col gap-5">
            <h1 className="entra classical-title text-[2.375rem] leading-[1.06] text-texto sm:text-5xl lg:text-[3.5rem]">
              {a.titulo}
            </h1>
            <p
              className="entra max-w-[58ch] text-lg leading-relaxed text-texto-suave"
              style={{ ['--i' as string]: 1 }}
            >
              {a.abertura}{' '}
              {/* Nobody needs the technology's name to use it: a quiet sign
                  for the curious, with the explanation one click away. */}
              <a
                href={a.tecnologiaLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={a.tecnologia}
                className="group relative inline-grid h-6 w-6 place-items-center rounded-full align-middle text-texto-fraco transition-colors hover:text-ouro-texto focus-visible:text-ouro-texto"
              >
                <Icon de={PiQuestion} tamanho="p" />
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-elevado mb-2 w-max max-w-[16rem] -translate-x-1/2 sup-alta !rounded-controle px-3 py-2 text-left text-[0.8125rem] leading-snug text-texto opacity-0 shadow-[var(--sombra-2)] transition-opacity duration-[var(--t-resposta)] group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {a.tecnologia}
                </span>
              </a>
            </p>
            <div
              className="entra flex flex-wrap gap-3 pt-2"
              style={{ ['--i' as string]: 3 }}
            >
              <Button
                variante="primario"
                icone={PiDeviceMobile}
                onClick={instalar}
              >
                {copy.instalar}
              </Button>
              <Link href="/" className={classesDeBotao('fantasma')}>
                {copy.voltar}
              </Link>
            </div>
          </div>
          <AppGravado />
        </header>
      ) : (
        <header className="flex max-w-[60ch] flex-col gap-4">
          <h1 className="classical-title text-[2.375rem] leading-[1.06] text-texto sm:text-5xl">
            {copy.tituloOffline}
          </h1>
          <p className="text-lg leading-relaxed text-texto-suave">
            {copy.textoOffline}
          </p>
        </header>
      )}

      {online && (
        <section className="flex flex-col gap-6">
          <h2 className="font-display text-[1.75rem] leading-tight">
            {a.comparar}
          </h2>
          <ul className="grid gap-x-10 gap-y-1 md:grid-cols-2">
            {a.itens.map((item) => (
              <li
                key={item.titulo}
                className="flex items-start gap-4 border-b border-[var(--linha)] py-4"
              >
                <span
                  className={cx(
                    'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full',
                    item.tem
                      ? 'tint-ouro text-ouro-na-tinta'
                      : 'bg-sup-2 text-texto-fraco'
                  )}
                >
                  <Icon de={item.tem ? PiCheck : PiMinus} tamanho="p" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span
                    className={cx(
                      'font-medium',
                      item.tem ? 'text-texto' : 'text-texto-suave'
                    )}
                  >
                    {item.titulo}
                  </span>
                  <span className="t-rotulo text-texto-suave">
                    {item.texto}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[1.75rem] leading-tight">
          {a.seuAparelho}
        </h2>
        <p className="max-w-[60ch] t-rotulo text-texto-suave">{copy.texto}</p>
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
