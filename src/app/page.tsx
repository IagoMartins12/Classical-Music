'use client';

import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ComposerList from './components/ComposerList';
import WorkList from './components/WorkList';

export default function HomePage() {
  const [composers, setComposers] = useState([]);
  const [works, setWorks] = useState([]);

  const handleSearch = async (term: string) => {
    const res = await fetch(`/api/composers?q=${term}`);
    const data = await res.json();
    setComposers(data);
    setWorks([]);
  };

  const handleSelectComposer = async (id: number) => {
    const res = await fetch(`/api/pieces?id=${id}`);
    const data = await res.json();
    setWorks(data);
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold text-center mb-6">🎼 Música Clássica</h1>
      <SearchBar onSearch={handleSearch} />
      {composers.length > 0 && <ComposerList composers={composers} onSelect={handleSelectComposer} />}
      {works.length > 0 && <WorkList works={works} />}
    </div>
  );
}
