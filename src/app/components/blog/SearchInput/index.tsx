'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Button } from '@/app/components/ui/Button';

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') || '');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Função que faz a navegação para a busca
  const doSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }
    router.push(`/blog/search?${params.toString()}`);
  };

  // Debounce de 3 segundos ao digitar
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      doSearch(value);
    }, 3000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  return (
    <div className="relative mb-6 flex gap-2">
      <div className="relative flex-1">
        <PiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar artigos, compositores, obras..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input-classical w-full pl-12"
        />
      </div>
      <Button variante="primario" type="button" onClick={() => doSearch(value)}>
        <PiMagnifyingGlass />
        <NomeAcao acao="buscar" />
      </Button>
    </div>
  );
}
