'use client';

import type { IconType } from 'react-icons';
import {
  PiArrowsClockwise,
  PiDeviceMobile,
  PiMusicNotesSimple,
  PiPenNib,
} from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import type { PwaCopy } from '@/app/conteudo/site/pwa';

const ICONES: IconType[] = [PiDeviceMobile, PiPenNib, PiArrowsClockwise];

/**
 * What the installed app is, for someone who never heard the word: how it
 * works in three parts, each with a comparison from classical music, and
 * where it helps on the site. The technical name comes last, for the
 * curious.
 */
export function SobreATecnologia({
  aberto,
  aoFechar,
  aoInstalar,
  copy,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoInstalar: () => void;
  copy: PwaCopy['aparelho'];
}) {
  const t = copy.apresentacao.sobre;
  return (
    <Sheet
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={t.titulo}
      largura="m"
      rodape={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variante="fantasma" onClick={aoFechar}>
            {t.fechar}
          </Button>
          <Button
            variante="primario"
            icone={PiDeviceMobile}
            onClick={() => {
              aoFechar();
              aoInstalar();
            }}
          >
            {copy.instalar}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-1">
          <h3 className="t-legenda mb-2">{t.comoFunciona}</h3>
          <ul className="flex flex-col divide-y divide-[var(--linha)]">
            {t.partes.map((parte, i) => (
              <li key={parte.titulo} className="flex gap-4 py-5 first:pt-0">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full tint-ouro text-ouro-na-tinta">
                  <Icon de={ICONES[i]} tamanho="m" />
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="font-display text-[1.375rem] leading-snug">
                    {parte.titulo}
                  </span>
                  <span className="t-rotulo text-texto-suave">
                    {parte.texto}
                  </span>
                  {/* The comparison from the music the person already knows. */}
                  <span className="mt-1 flex items-start gap-2 font-display text-[1.0625rem] italic leading-snug text-texto">
                    <Icon
                      de={PiMusicNotesSimple}
                      tamanho="p"
                      className="mt-1 shrink-0 text-ouro-texto"
                    />
                    {parte.analogia}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="t-legenda">{t.exemplos}</h3>
          <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            {t.usos.map(([quando, como]) => (
              <div
                key={quando}
                className="flex flex-col gap-1 border-t border-[var(--linha)] py-4"
              >
                <dt className="font-medium">{quando}</dt>
                <dd className="t-rotulo text-texto-suave">{como}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="t-legenda">{t.nome}</p>
      </div>
    </Sheet>
  );
}
