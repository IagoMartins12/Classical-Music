'use client';

import { useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import {
  PiCheck,
  PiEnvelopeSimple,
  PiFacebookLogo,
  PiLinkSimple,
  PiLinkedinLogo,
  PiTelegramLogo,
  PiWhatsappLogo,
  PiXLogo,
} from 'react-icons/pi';
import { Button } from './Button';
import { Icon } from './Icon';
import { Sheet } from './Sheet';
import { usePulso } from './usePulso';

export interface ShareCopy {
  title: string;
  shareOn: string;
  copyLink: string;
  copied: string;
  email: string;
}

async function copyToClipboard(url: string, copied: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success(copied, { position: 'top-right', duration: 2400 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Sharing, everywhere on the site. On touch devices only the system share
 * sheet opens (or the link is copied when there is none); on desktop, our
 * sheet: a preview, the networks and the link to copy.
 */
export function useShare({
  title,
  url,
  copy,
  thumbnail,
}: {
  title: string;
  url: string;
  copy: ShareCopy;
  thumbnail?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const share = async () => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title, url }).catch(() => undefined);
      } else {
        await copyToClipboard(url, copy.copied);
      }
      return;
    }
    setOpen(true);
  };

  const sheet = (
    <ShareSheet
      open={open}
      onClose={() => setOpen(false)}
      title={title}
      url={url}
      copy={copy}
      thumbnail={thumbnail}
    />
  );

  return { share, sheet };
}

function ShareSheet({
  open,
  onClose,
  title,
  url,
  copy,
  thumbnail,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
  copy: ShareCopy;
  thumbnail?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const { pulsar, pulso } = usePulso();
  const text = encodeURIComponent(title);
  const link = encodeURIComponent(url);
  const address = url.replace(/^https?:\/\/(www\.)?/, '');

  const targets = [
    {
      name: 'WhatsApp',
      icon: PiWhatsappLogo,
      href: `https://wa.me/?text=${text}%20${link}`,
    },
    {
      name: 'X',
      icon: PiXLogo,
      href: `https://x.com/intent/post?text=${text}&url=${link}`,
    },
    {
      name: 'Facebook',
      icon: PiFacebookLogo,
      href: `https://www.facebook.com/sharer/sharer.php?u=${link}`,
    },
    {
      name: 'LinkedIn',
      icon: PiLinkedinLogo,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${link}`,
    },
    {
      name: 'Telegram',
      icon: PiTelegramLogo,
      href: `https://t.me/share/url?url=${link}&text=${text}`,
    },
    {
      name: copy.email,
      icon: PiEnvelopeSimple,
      href: `mailto:?subject=${text}&body=${link}`,
    },
  ];

  const onCopy = async () => {
    if (await copyToClipboard(url, copy.copied)) {
      setCopied(true);
      pulsar();
      setTimeout(() => setCopied(false), 2400);
    }
  };

  return (
    <Sheet aberto={open} aoFechar={onClose} titulo={copy.title} largura="p">
      <div className="flex flex-col gap-7">
        <div className="flex items-center gap-4 rounded-card bg-sup-2 p-3">
          {thumbnail}
          <div className="min-w-0">
            <p className="line-clamp-2 font-display text-[1.125rem] leading-snug">
              {title}
            </p>
            <p className="t-dado mt-0.5 truncate text-[0.75rem] text-texto-fraco">
              {address}
            </p>
          </div>
        </div>

        <ul aria-label={copy.shareOn} className="grid grid-cols-3 gap-y-5">
          {targets.map((target) => (
            <li key={target.name}>
              <a
                href={target.href}
                target={
                  target.href.startsWith('mailto:') ? undefined : '_blank'
                }
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2 rounded-controle text-[0.8125rem] text-texto-suave"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-sup-2 text-texto transition-[background-color,color,transform] duration-[var(--t-toque)] ease-saida group-hover:bg-[var(--interactive-hover)] group-hover:text-ouro-texto group-active:scale-95 motion-reduce:transition-none">
                  <Icon de={target.icon} tamanho="m" />
                </span>
                {target.name}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 rounded-controle bg-[var(--campo)] p-1.5 pl-4">
          <label htmlFor="share-link" className="sr-only">
            {copy.copyLink}
          </label>
          <input
            id="share-link"
            readOnly
            value={url}
            onFocus={(event) => event.currentTarget.select()}
            className="t-dado min-w-0 flex-1 truncate bg-transparent text-[0.8125rem] text-texto-suave outline-none"
          />
          <Button
            tamanho="p"
            variante={copied ? 'secundario' : 'primario'}
            icone={copied ? PiCheck : PiLinkSimple}
            onClick={onCopy}
            className="shrink-0"
            {...pulso}
          >
            {copied ? copy.copied : copy.copyLink}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
