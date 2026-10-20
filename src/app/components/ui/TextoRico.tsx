import type { ReactNode } from 'react';
import LocalizedLink from '@/app/components/LocalizedLink';

/**
 * Texto com a marcação mínima dos documentos de leitura (`conteudo/legal`):
 * `**negrito**`, `[texto](/rota)` ou `[texto](#ancora)`, e e-mails, que viram
 * link sozinhos. Nada além disso — não é um leitor de Markdown, e HTML nunca
 * passa: o texto vira nós do React.
 */
const PADRAO =
  /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

const LINK =
  'font-medium text-ouro-texto underline decoration-ouro/40 underline-offset-[3px] transition-colors hover:decoration-ouro';

export function TextoRico({ texto }: { texto: string }) {
  const partes: ReactNode[] = [];
  let ultimo = 0;
  let chave = 0;
  for (const m of texto.matchAll(PADRAO)) {
    if (m.index! > ultimo) partes.push(texto.slice(ultimo, m.index));
    if (m[1]) {
      partes.push(
        <strong key={chave++} className="font-semibold text-texto">
          {m[1]}
        </strong>
      );
    } else if (m[2]) {
      const href = m[3];
      partes.push(
        href.startsWith('/') ? (
          <LocalizedLink key={chave++} href={href} className={LINK}>
            {m[2]}
          </LocalizedLink>
        ) : (
          <a key={chave++} href={href} className={LINK}>
            {m[2]}
          </a>
        )
      );
    } else if (m[4]) {
      // Um ponto final colado ao e-mail é pontuação, não parte do endereço.
      const email = m[4].replace(/\.$/, '');
      partes.push(
        <a key={chave++} href={`mailto:${email}`} className={LINK}>
          {email}
        </a>
      );
      if (email !== m[4]) partes.push('.');
    }
    ultimo = m.index! + m[0].length;
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo));
  return <>{partes}</>;
}
