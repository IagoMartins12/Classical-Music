'use client';

import { useState } from 'react';

/**
 * A foto de uma pessoa nas listas do painel (32px), ou a inicial quando não
 * há foto ou ela não carrega — foto de perfil vem de vários domínios e
 * alguns expiram.
 */
export function Avatar({
  nome,
  imagem,
}: {
  nome: string;
  imagem?: string | null;
}) {
  const [falhou, setFalhou] = useState(false);
  return imagem && !falhou ? (
    // eslint-disable-next-line @next/next/no-img-element -- avatar de 32px de vários domínios
    <img
      src={imagem}
      alt=""
      width={32}
      height={32}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFalhou(true)}
      className="h-8 w-8 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span
      aria-hidden="true"
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sup-2 text-sm text-texto-suave"
    >
      {nome.charAt(0).toUpperCase()}
    </span>
  );
}
