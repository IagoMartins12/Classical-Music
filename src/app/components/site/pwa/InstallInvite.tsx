'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PiCheckCircle,
  PiCompass,
  PiDotsThreeVertical,
  PiDownloadSimple,
  PiExport,
  PiGoogleChromeLogo,
  PiPlusSquare,
} from 'react-icons/pi';
import { BrandSeal } from '@/app/components/site/BrandSeal';
import { Aba, Abas } from '@/app/components/ui/Abas';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { PWA } from '@/app/conteudo/site/pwa';
import { useOverlayLanguage } from '@/app/hooks/useRouteLanguage';
import { ABRIR_PASSOS } from './eventos';

/** The browser's install prompt (Chromium), kept for the "Instalar" button. */
interface PedidoDeInstalacao extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const CHAVE = 'opus-atlas:convite-app';
const SESSAO = 'opus-atlas:convite-app-sessao';
const ADIAR_DIAS = 14;
const ESPERA_MS = 20_000;

type Estado = { visitas: number; adiarAte?: number; nunca?: boolean };

const ler = (): Estado => {
  try {
    return { visitas: 0, ...JSON.parse(localStorage.getItem(CHAVE) ?? '{}') };
  } catch {
    return { visitas: 0 };
  }
};
const gravar = (estado: Estado) => {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    // Private mode: the invite may show again, nothing else breaks.
  }
};

const instalado = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const sistema = (): 'ios' | 'android' | 'outro' => {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  // iPadOS reports itself as a Mac with touch.
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'outro';
};

const celular = () =>
  sistema() !== 'outro' ||
  ((navigator as Navigator & { userAgentData?: { mobile?: boolean } })
    .userAgentData?.mobile ??
    false);

/**
 * The app invite on phones. On the second visit, after twenty seconds of
 * browsing, a short sheet says there is an app; "Ver como instalar" opens
 * the steps for the person's system. On Android the browser can install in
 * one tap, so the steps open with an "Instalar agora" button; on the iPhone,
 * which has no such prompt, the steps are the way.
 *
 * Never with the app already installed. "Agora não" hides it for fourteen
 * days; "Não mostrar mais" for good. Anything can open the steps directly
 * with the `opus:instalar-app` event.
 */
export function InstallInvite() {
  const language = useOverlayLanguage();
  const copy = PWA[language];
  const [aberto, setAberto] = useState<'convite' | 'passos' | null>(null);
  const [aba, setAba] = useState<'ios' | 'android'>('android');
  const [podeInstalar, setPodeInstalar] = useState(false);
  const pedido = useRef<PedidoDeInstalacao | null>(null);

  useEffect(() => {
    setAba(sistema() === 'ios' ? 'ios' : 'android');

    const aoPedir = (e: Event) => {
      e.preventDefault();
      pedido.current = e as PedidoDeInstalacao;
      setPodeInstalar(true);
    };
    const aoInstalar = () => {
      gravar({ ...ler(), nunca: true });
      setAberto(null);
    };
    const aoAbrir = () => setAberto('passos');
    window.addEventListener('beforeinstallprompt', aoPedir);
    window.addEventListener('appinstalled', aoInstalar);
    window.addEventListener(ABRIR_PASSOS, aoAbrir);

    let espera: ReturnType<typeof setTimeout> | undefined;
    if (celular() && !instalado()) {
      const estado = ler();
      // One visit per browser session.
      let nova = false;
      try {
        nova = !sessionStorage.getItem(SESSAO);
        sessionStorage.setItem(SESSAO, '1');
      } catch {
        nova = false;
      }
      const atual = nova ? { ...estado, visitas: estado.visitas + 1 } : estado;
      if (nova) gravar(atual);
      const adiado = atual.adiarAte && atual.adiarAte > Date.now();
      if (atual.visitas >= 2 && !atual.nunca && !adiado)
        espera = setTimeout(() => setAberto('convite'), ESPERA_MS);
    }

    return () => {
      clearTimeout(espera);
      window.removeEventListener('beforeinstallprompt', aoPedir);
      window.removeEventListener('appinstalled', aoInstalar);
      window.removeEventListener(ABRIR_PASSOS, aoAbrir);
    };
  }, []);

  const adiar = useCallback(() => {
    gravar({ ...ler(), adiarAte: Date.now() + ADIAR_DIAS * 86_400_000 });
    setAberto(null);
  }, []);

  const nuncaMais = () => {
    gravar({ ...ler(), nunca: true });
    setAberto(null);
  };

  const instalar = async () => {
    const p = pedido.current;
    if (!p) return;
    await p.prompt();
    const { outcome } = await p.userChoice;
    pedido.current = null;
    setPodeInstalar(false);
    if (outcome === 'accepted') nuncaMais();
  };

  const icones = {
    ios: [PiCompass, PiExport, PiPlusSquare, PiCheckCircle],
    android: [
      PiGoogleChromeLogo,
      PiDotsThreeVertical,
      PiDownloadSimple,
      PiCheckCircle,
    ],
  };

  return (
    <>
      <Sheet
        aberto={aberto === 'convite'}
        aoFechar={adiar}
        titulo={copy.convite.titulo}
        largura="p"
        rodape={
          <div className="flex flex-col gap-3">
            <div className="flex justify-end gap-2">
              <Button variante="fantasma" onClick={adiar}>
                {copy.convite.agoraNao}
              </Button>
              <Button variante="primario" onClick={() => setAberto('passos')}>
                {copy.convite.ver}
              </Button>
            </div>
            <button
              type="button"
              onClick={nuncaMais}
              className="t-rotulo self-end text-texto-suave underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]"
            >
              {copy.convite.nuncaMais}
            </button>
          </div>
        }
      >
        <div className="flex items-start gap-4">
          <BrandSeal className="h-14 w-14 shrink-0" />
          <p className="text-[0.9375rem] leading-relaxed text-texto-suave">
            {copy.convite.texto}
          </p>
        </div>
      </Sheet>

      <Sheet
        aberto={aberto === 'passos'}
        aoFechar={adiar}
        titulo={copy.passos.titulo}
        descricao={copy.passos.descricao}
        largura="m"
        rodape={
          <div className="flex justify-end">
            <Button variante="fantasma" onClick={adiar}>
              {copy.passos.fechar}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          {podeInstalar && (
            <div className="flex flex-col gap-3">
              <Button
                variante="primario"
                icone={PiDownloadSimple}
                onClick={() => void instalar()}
                className="w-full"
              >
                {copy.passos.instalar}
              </Button>
              <span className="t-legenda">{copy.passos.ouManual}</span>
            </div>
          )}
          <Abas rotulo={copy.passos.titulo}>
            {(['ios', 'android'] as const).map((s) => (
              <Aba key={s} ativa={aba === s} onClick={() => setAba(s)}>
                {copy.passos.abas[s]}
              </Aba>
            ))}
          </Abas>
          <ol className="flex flex-col gap-5">
            {copy.passos[aba].map((passo, i) => (
              <li key={passo.titulo} className="flex items-start gap-4">
                <span className="w-6 shrink-0 font-display text-[1.75rem] leading-none text-ouro-texto">
                  {i + 1}
                </span>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-controle bg-sup-2">
                  <Icon de={icones[aba][i]} tamanho="m" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium text-texto">{passo.titulo}</span>
                  <span className="t-rotulo text-texto-suave">
                    {passo.texto}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Sheet>
    </>
  );
}
