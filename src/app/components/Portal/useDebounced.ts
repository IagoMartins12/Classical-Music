'use client';

import { useEffect, useState } from 'react';

/** O valor, só depois de parar de mudar por `ms` — para não consultar a cada tecla. */
export function useDebounced<T>(value: T, ms = 300): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return settled;
}
