'use client';
import { useState } from 'react';

type Props = {
  onSearch: (term: string) => void;
};

export default function SearchBar({ onSearch }: Props) {
  const [term, setTerm] = useState('');

  const handleSearch = () => {
    onSearch(term);
  };

  return (
    <div className="flex items-center gap-2 p-4">
      <input
        type="text"
        className="border rounded px-4 py-2 w-full"
        placeholder="Buscar compositor (ex: Mozart, Bach...)"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded">
        Buscar
      </button>
    </div>
  );
}
