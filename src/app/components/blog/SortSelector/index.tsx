'use client';

import { useRouter } from 'next/navigation';
import Select from '../../Common/Select';

interface SortSelectorProps {
  currentValue: string;
}

export function SortSelector({ currentValue }: SortSelectorProps) {
  const router = useRouter();

  const ordenarOptions = [
    { value: 'relevancia', label: 'Mais relevante' },
    { value: 'recente', label: 'Mais recente' },
    { value: 'popular', label: 'Mais popular' },
    { value: 'curtidas', label: 'Mais curtido' },
  ];

  const handleChange = (value: string) => {
    const params = new URLSearchParams(window.location.search);

    if (value === 'relevancia') {
      params.delete('ordenar');
    } else {
      params.set('ordenar', value);
    }

    router.push(`/blog/search?${params.toString()}`);
  };

  return (
    <Select
      options={ordenarOptions}
      value={currentValue}
      onChange={(e) => handleChange(e.target.value)}
      className="input-classical text-sm px-3 py-2"
    ></Select>
  );
}
